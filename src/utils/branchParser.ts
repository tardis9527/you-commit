import type { BranchInfo } from '../types';

interface BranchPattern {
  regex: RegExp;
  type: string;
}

const BRANCH_PATTERNS: BranchPattern[] = [
  { regex: /^feature[/\-_](.+)/, type: 'feat' },
  { regex: /^(bug)?fix[/\-_](.+)/, type: 'fix' },
  { regex: /^hotfix[/\-_](.+)/, type: 'fix' },
  { regex: /^release[/\-_](.+)/, type: 'release' },
  { regex: /^chore[/\-_](.+)/, type: 'chore' },
  { regex: /^docs?[/\-_](.+)/, type: 'docs' },
  { regex: /^refactor[/\-_](.+)/, type: 'refactor' },
  { regex: /^perf[/\-_](.+)/, type: 'perf' },
  { regex: /^test[/\-_](.+)/, type: 'test' },
  { regex: /^style[/\-_](.+)/, type: 'style' },
  { regex: /^ci[/\-_](.+)/, type: 'ci' },
  { regex: /^build[/\-_](.+)/, type: 'build' },
];

export function parseBranch(branchName: string): BranchInfo {
  if (!branchName) {
    return { raw: branchName, type: null, name: null };
  }

  for (const pattern of BRANCH_PATTERNS) {
    const match = branchName.match(pattern.regex);
    if (match) {
      const name = match[match.length - 1];
      return {
        raw: branchName,
        type: pattern.type,
        name: name || null,
      };
    }
  }

  return { raw: branchName, type: null, name: null };
}
