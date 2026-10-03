const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('/api/voice/tts')) {
  const voiceCode = `
// ==========================================
// 🎙️ CODGAR / YADAW ADVANCED VOICE PIPELINE (Edge-TTS + Whisper)
// ==========================================
app.get("/api/voice/tts", async (req: Request, res: Response) => {
  const text = String(req.query.text || "").trim();
  const lang = String(req.query.lang || "fa");
  if (!text) return res.status(400).send("Text is required");

  const voice = lang === "en" ? "en-US-JennyNeural" : "fa-IR-FaridNeural";
  const { spawn } = require("child_process");
  
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "no-cache");

  const ttsProcess = spawn("python3", [
    "-m", "edge_tts",
    "--voice", voice,
    "--text", text,
    "--write-media", "-"
  ]);

  ttsProcess.stdout.pipe(res);
  ttsProcess.stderr.on("data", () => {});
  ttsProcess.on("error", (err: any) => {
    if (!res.headersSent) res.status(500).send(err.message);
  });
});

app.post("/api/voice/transcribe", async (req: Request, res: Response) => {
  try {
    const rRes = await fetch("http://127.0.0.1:20128/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer sk-1b85c23a61dee238-k2vequ-4bc8de92"
      },
      body: req.body as any
    });
    const data = await rRes.json();
    return res.json(data);
  } catch (err: any) {
    return res.json({ text: "" });
  }
});
`;

  const marker = "app.post('/api/agent/prompt";
  if (code.includes(marker)) {
    code = code.replace(marker, voiceCode + "\n" + marker);
  } else {
    code += "\n" + voiceCode;
  }
  fs.writeFileSync('server.ts', code);
  console.log("✅ Voice TTS & Transcription endpoints cleanly added to server.ts!");
} else {
  console.log("ℹ️ Voice endpoints already exist in server.ts");
}
