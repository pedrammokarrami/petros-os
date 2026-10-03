import fs from "fs";
import path from "path";

export class TaskObserver {
  private static skillFile = path.resolve(process.cwd(), ".codgar_skills.json");

  public static observeAndLearn(task: string, status: string) {
    try {
      let skills: any[] = [];
      if (fs.existsSync(this.skillFile)) {
        skills = JSON.parse(fs.readFileSync(this.skillFile, "utf-8"));
      }
      skills.push({ task, status, observedAt: new Date().toISOString() });
      fs.writeFileSync(this.skillFile, JSON.stringify(skills.slice(-20), null, 2));
    } catch (e) {}
  }
}
