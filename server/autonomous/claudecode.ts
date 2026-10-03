import { exec } from "child_process";

export class ClaudeCodeBridge {
  public static executeCommand(cmd: string): Promise<string> {
    // پوشش همزمان مسیرهای اینتل (/usr/local/bin) و اپل سیلیکون (/opt/homebrew/bin)
    const universalEnv = {
      ...process.env,
      PATH: `/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:${process.env.PATH || ""}`
    };

    return new Promise((resolve) => {
      exec(cmd, { cwd: process.cwd(), env: universalEnv }, (err, stdout, stderr) => {
        if (err) resolve(`Error: ${stderr || err.message}`);
        else resolve(stdout || stderr || "Command executed with no output.");
      });
    });
  }

  public static async getCpuArchitecture(): Promise<string> {
    const arch = await this.executeCommand("uname -m");
    const brand = await this.executeCommand("sysctl -n machdep.cpu.brand_string 2>/dev/null || echo 'Unknown Processor'");
    return `${brand.trim()} [Arch: ${arch.trim()}]`;
  }
}
