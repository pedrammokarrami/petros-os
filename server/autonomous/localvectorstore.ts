import fs from "fs";
import path from "path";

export class LocalVectorStore {
  private static vectorFile = path.resolve(process.cwd(), ".codgar_vectors.json");

  public static storeVector(id: string, text: string) {
    try {
      let vectors: any[] = [];
      if (fs.existsSync(this.vectorFile)) {
        vectors = JSON.parse(fs.readFileSync(this.vectorFile, "utf-8"));
      }
      vectors.push({ id, text, createdAt: new Date().toISOString() });
      fs.writeFileSync(this.vectorFile, JSON.stringify(vectors.slice(-50), null, 2));
    } catch (e) {}
  }
}
