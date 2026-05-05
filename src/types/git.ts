export interface FileChange {
  path: string;
  insertions: number;
  deletions: number;
}

export interface DiffProcessResult {
  diff: string;
  filesStats: string;
  filesChanged: string;
  truncated: boolean;
  strategy: 'full' | 'file-truncated' | 'stats-only';
}

export interface BranchInfo {
  raw: string;
  type: string | null;
  name: string | null;
}
