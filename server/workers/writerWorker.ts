import fs from 'fs';
import path from 'path';

export interface WriterToolContext {
  projectDir: string;
  onEvent?: (type: any, payload: any) => void;
}

export class WriterWorker {
  static resolvePath(projectDir: string, relativePath: string): string {
    const normalized = path.normalize(relativePath || '.');
    const resolved = path.isAbsolute(normalized)
      ? normalized
      : path.resolve(projectDir, normalized);

    if (!resolved.startsWith(projectDir)) {
      throw new Error(`Path traversal denied: ${relativePath} is outside project root.`);
    }
    return resolved;
  }

  /**
   * Authors or updates documentation, specifications, or guides in markdown/text
   */
  static async writeDocumentation(
    context: WriterToolContext,
    filePath: string,
    content: string
  ): Promise<{ filePath: string; bytesWritten: number; created: boolean }> {
    const fullPath = this.resolvePath(context.projectDir, filePath);
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    const created = !fs.existsSync(fullPath);
    fs.writeFileSync(fullPath, content, 'utf8');
    const bytesWritten = Buffer.byteLength(content, 'utf8');

    context.onEvent?.('file.changed', {
      filePath,
      action: created ? 'created' : 'modified',
      bytesWritten,
      worker: 'writer',
    });

    return { filePath, bytesWritten, created };
  }

  /**
   * Modifies a text file or documentation file with append or replace
   */
  static async updateDocumentSection(
    context: WriterToolContext,
    filePath: string,
    sectionHeading: string,
    newContent: string
  ): Promise<{ filePath: string; updated: boolean }> {
    const fullPath = this.resolvePath(context.projectDir, filePath);
    if (!fs.existsSync(fullPath)) {
      await this.writeDocumentation(context, filePath, `${sectionHeading}\n\n${newContent}`);
      return { filePath, updated: true };
    }

    let original = fs.readFileSync(fullPath, 'utf8');
    if (original.includes(sectionHeading)) {
      // Find section heading and update
      const parts = original.split(sectionHeading);
      original = parts[0] + sectionHeading + '\n\n' + newContent;
    } else {
      original = original + '\n\n' + sectionHeading + '\n\n' + newContent;
    }

    fs.writeFileSync(fullPath, original, 'utf8');
    context.onEvent?.('file.changed', {
      filePath,
      action: 'modified',
      bytesWritten: Buffer.byteLength(original, 'utf8'),
      worker: 'writer',
    });

    return { filePath, updated: true };
  }
}
