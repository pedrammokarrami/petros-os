import { DiffData, DiffHunk } from '../types';

export function parseGitDiff(rawDiff: string, fileName?: string): DiffData[] {
  if (!rawDiff || typeof rawDiff !== 'string') return [];

  const fileDiffs: DiffData[] = [];
  const rawFiles = rawDiff.split(/^diff --git /m).filter(Boolean);

  for (const fileBlock of rawFiles) {
    const lines = fileBlock.split('\n');
    let currentFile = fileName || 'unknown';

    // Parse file path
    const headerMatch = lines[0]?.match(/a\/(.+?)\s+b\/(.+)/);
    if (headerMatch) {
      currentFile = headerMatch[2] || headerMatch[1];
    }

    const hunks: DiffHunk[] = [];
    let currentHunk: DiffHunk | null = null;
    let oldLineCounter = 0;
    let newLineCounter = 0;

    for (const line of lines) {
      const hunkHeaderMatch = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
      if (hunkHeaderMatch) {
        if (currentHunk) {
          hunks.push(currentHunk);
        }
        const oldStart = parseInt(hunkHeaderMatch[1], 10);
        const oldLines = hunkHeaderMatch[2] ? parseInt(hunkHeaderMatch[2], 10) : 1;
        const newStart = parseInt(hunkHeaderMatch[3], 10);
        const newLines = hunkHeaderMatch[4] ? parseInt(hunkHeaderMatch[4], 10) : 1;

        oldLineCounter = oldStart;
        newLineCounter = newStart;

        currentHunk = {
          oldStart,
          oldLines,
          newStart,
          newLines,
          lines: [],
        };
        continue;
      }

      if (currentHunk) {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          currentHunk.lines.push({
            type: 'add',
            content: line.slice(1),
            newLine: newLineCounter++,
          });
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          currentHunk.lines.push({
            type: 'del',
            content: line.slice(1),
            oldLine: oldLineCounter++,
          });
        } else if (line.startsWith(' ')) {
          currentHunk.lines.push({
            type: 'context',
            content: line.slice(1),
            oldLine: oldLineCounter++,
            newLine: newLineCounter++,
          });
        }
      }
    }

    if (currentHunk) {
      hunks.push(currentHunk);
    }

    fileDiffs.push({
      file: currentFile,
      rawDiff: 'diff --git ' + fileBlock,
      hunks,
    });
  }

  return fileDiffs;
}
