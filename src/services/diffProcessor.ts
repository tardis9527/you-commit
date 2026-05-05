import type { DiffProcessResult } from '../types';
import { log } from '../utils';

const IGNORE_PATTERNS = [
  /package-lock\.json$/,
  /pnpm-lock\.yaml$/,
  /yarn\.lock$/,
  /\.min\.js$/,
  /\.min\.css$/,
  /\.map$/,
  /\.generated\./,
  /\.snap$/,
];

const MAX_LINES_PER_FILE = 100;

export class DiffProcessor {
  process(rawDiff: string, maxLength: number): DiffProcessResult {
    if (!rawDiff || rawDiff.trim().length === 0) {
      return {
        diff: '',
        filesStats: '无变更',
        filesChanged: '',
        truncated: false,
        strategy: 'full',
      };
    }

    const filesStats = this.extractFileStats(rawDiff);
    const filesChanged = this.extractFileNames(rawDiff).join(', ');

    // Strategy 1: full
    const filtered = this.filterIgnoredFiles(rawDiff);
    if (filtered.length <= maxLength) {
      log(`Diff strategy: full (${filtered.length} chars)`);
      return {
        diff: filtered,
        filesStats,
        filesChanged,
        truncated: false,
        strategy: 'full',
      };
    }

    // Strategy 2: file-truncated
    const truncatedDiff = this.truncatePerFile(filtered, MAX_LINES_PER_FILE);
    if (truncatedDiff.length <= maxLength) {
      log(`Diff strategy: file-truncated (${truncatedDiff.length} chars)`);
      return {
        diff: truncatedDiff,
        filesStats,
        filesChanged,
        truncated: true,
        strategy: 'file-truncated',
      };
    }

    // Strategy 3: stats-only
    log(`Diff strategy: stats-only`);
    return {
      diff: `以下为文件级变更统计，请据此生成概要性 commit message：\n\n${filesStats}`,
      filesStats,
      filesChanged,
      truncated: true,
      strategy: 'stats-only',
    };
  }

  private filterIgnoredFiles(diff: string): string {
    const fileSections = this.splitByFile(diff);
    const filtered = fileSections.filter((section) => {
      const fileName = this.extractFileName(section);
      return !IGNORE_PATTERNS.some((pattern) => pattern.test(fileName));
    });
    return filtered.join('\n');
  }

  private truncatePerFile(diff: string, maxLines: number): string {
    const fileSections = this.splitByFile(diff);
    return fileSections
      .map((section) => {
        const lines = section.split('\n');
        if (lines.length <= maxLines) {
          return section;
        }
        const truncated = lines.slice(0, maxLines).join('\n');
        const remaining = lines.length - maxLines;
        return `${truncated}\n[... 截断 ${remaining} 行]`;
      })
      .join('\n');
  }

  private splitByFile(diff: string): string[] {
    const sections: string[] = [];
    const lines = diff.split('\n');
    let current: string[] = [];

    for (const line of lines) {
      if (line.startsWith('diff --git') && current.length > 0) {
        sections.push(current.join('\n'));
        current = [];
      }
      current.push(line);
    }

    if (current.length > 0) {
      sections.push(current.join('\n'));
    }

    return sections;
  }

  private extractFileName(diffSection: string): string {
    const match = diffSection.match(/^diff --git a\/(.+?) b\//m);
    return match ? match[1] : '';
  }

  private extractFileNames(diff: string): string[] {
    const names: string[] = [];
    const regex = /^diff --git a\/(.+?) b\//gm;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(diff)) !== null) {
      names.push(match[1]);
    }
    return names;
  }

  private extractFileStats(diff: string): string {
    const files = this.splitByFile(diff);
    const stats = files.map((section) => {
      const name = this.extractFileName(section);
      const lines = section.split('\n');
      let insertions = 0;
      let deletions = 0;
      for (const line of lines) {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          insertions++;
        }
        if (line.startsWith('-') && !line.startsWith('---')) {
          deletions++;
        }
      }
      return `${name}: +${insertions} -${deletions}`;
    });

    const totalFiles = files.length;
    return `${totalFiles} file(s) changed\n${stats.join('\n')}`;
  }
}
