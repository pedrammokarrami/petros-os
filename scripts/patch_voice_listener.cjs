const fs = require('fs');
let p = "src/services/voiceAgent.ts";
let c = fs.readFileSync(p, "utf8");

// Enhance launchRecognitionInstance with MediaRecorder fallback to avoid Chrome freeze
const oldLaunch = "private launchRecognitionInstance() {";
if (c.includes(oldLaunch)) {
  const replacement = `private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  private launchRecognitionInstance() {
    if (typeof window === 'undefined') return;

    // Start fallback MediaRecorder for bulletproof recording
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        try {
          this.mediaRecorder = new MediaRecorder(stream);
          this.audioChunks = [];
          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.audioChunks.push(e.data);
          };
          this.mediaRecorder.start(250);
        } catch (e) {}
      }).catch(() => {});
    }`;

  c = c.replace(oldLaunch, replacement);
  fs.writeFileSync(p, c);
  console.log("✅ Voice listener patched with MediaRecorder fallback!");
} else {
  console.log("ℹ️ Method already patched.");
}
