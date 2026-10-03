const fs = require('fs');

// ۱. بروزرسانی دقیق روت /api/voice/transcribe در server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');

const newTranscribeRoute = `app.post("/api/voice/transcribe", async (req: Request, res: Response) => {
  try {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", async () => {
      const audioBuffer = Buffer.concat(chunks);
      if (!audioBuffer || audioBuffer.length === 0) {
        return res.json({ text: "", success: false });
      }

      const audioBlob = new Blob([audioBuffer], { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", audioBlob, "user_voice.webm");
      formData.append("model", "gemini/gemini-2.5-flash");
      formData.append("language", "fa");

      const rRes = await fetch("http://127.0.0.1:20128/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer sk-1b85c23a61dee238-k2vequ-4bc8de92"
        },
        body: formData
      });

      const data = await rRes.json();
      console.log("[Voice STT] 🎯 Transcribed speech:", data.text);
      return res.json({ text: data.text || "", success: !!data.text });
    });
  } catch (err: any) {
    console.error("[Voice STT] ❌ Error:", err.message);
    return res.json({ text: "", success: false });
  }
});`;

serverCode = serverCode.replace(
  /app\.post\("\/api\/voice\/transcribe"[\s\S]*?return res\.json\(\{ text: "" \};\s*\}\);\s*\}\);/,
  newTranscribeRoute
);
fs.writeFileSync('server.ts', serverCode);
console.log("✅ server.ts connected to 9Router Gemini STT!");

// ۲. بروزرسانی voiceAgent.ts برای ارسال ضبط میکروفون به /api/voice/transcribe
let agentCode = fs.readFileSync('src/services/voiceAgent.ts', 'utf8');

if (!agentCode.includes('sendAudioToTranscribe')) {
  const injection = `
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private silenceTimer: any = null;

  private async sendAudioToTranscribe() {
    if (this.audioChunks.length === 0) return;
    const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
    this.audioChunks = [];
    try {
      const res = await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'audio/webm' },
        body: blob
      });
      const data = await res.json();
      if (data.text && this.onResultCallback) {
        this.accumulatedTranscript = (this.accumulatedTranscript ? this.accumulatedTranscript + " " : "") + data.text.trim();
        this.onResultCallback(this.accumulatedTranscript, true);
        this.notify();
      }
    } catch (e) {}
  }
`;

  agentCode = agentCode.replace(
    'class VoiceAgentService {',
    'class VoiceAgentService {' + injection
  );

  // Hook into startListening to record audio chunks
  agentCode = agentCode.replace(
    'this.startMicrophoneAnalyser();',
    `this.startMicrophoneAnalyser();
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        try {
          this.mediaRecorder = new MediaRecorder(stream);
          this.audioChunks = [];
          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.audioChunks.push(e.data);
          };
          this.mediaRecorder.start(400);
        } catch(e) {}
      }).catch(() => {});
    }`
  );

  // Hook into stopListening to finalize transcription
  agentCode = agentCode.replace(
    'this.stopMicrophoneAnalyser();',
    `if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try { this.mediaRecorder.stop(); } catch(e) {}
      this.sendAudioToTranscribe();
    }
    this.stopMicrophoneAnalyser();`
  );

  fs.writeFileSync('src/services/voiceAgent.ts', agentCode);
  console.log("✅ voiceAgent.ts successfully hooked to send mic audio to 9Router STT!");
}
