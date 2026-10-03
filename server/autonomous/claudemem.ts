import fs from "fs";
import path from "path";

export class ClaudeMemEngine {
  private static memFile = path.resolve(process.cwd(), ".codgar_memory.json");
  public static recallContext(): string {
    return fs.existsSync(this.memFile) ? "Memory session synced." : "Clean memory state.";
  }
}
