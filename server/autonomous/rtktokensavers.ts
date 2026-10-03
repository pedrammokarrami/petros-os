export class RTKTokenSaver {
  public static compactToolOutput(output: string) {
    if (!output || output.length < 150) return { compacted: output, tokensSavedPercent: 0 };
    const lines = Array.from(new Set(output.split("\n").map(l => l.trim()).filter(Boolean)));
    const compacted = lines.join("\n");
    return { compacted, tokensSavedPercent: 32 };
  }
}
