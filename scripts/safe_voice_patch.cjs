const fs = require('fs');
const p = "src/services/voiceAgent.ts";
let c = fs.readFileSync(p, "utf8");

// Only inject the clean audio player into speak without touching brackets
if (!c.includes('/api/voice/tts')) {
  c = c.replace(
    'window.speechSynthesis.cancel();',
    `try {
      const clean = text.replace(/\`\`\`[\\s\\S]*?\`\`\`/g, "کدها پردازش شدند.").replace(/[#*_~>\`]/g, "").trim();
      const short = clean.split(/[.!?\\n]/).filter(Boolean).slice(0, 3).join(". ") + ".";
      const audio = new Audio("/api/voice/tts?lang=" + encodeURIComponent(language) + "&text=" + encodeURIComponent(short));
      audio.onended = () => { this.isSpeaking = false; this.notify(); if (onEnd) onEnd(); };
      audio.onerror = () => { this.isSpeaking = false; this.notify(); if (onEnd) onEnd(); };
      this.isSpeaking = true;
      this.notify();
      audio.play().catch(() => {});
      return;
    } catch (e) {}
    window.speechSynthesis.cancel();`
  );
  fs.writeFileSync(p, c);
  console.log("✅ Edge-TTS safely integrated!");
}
