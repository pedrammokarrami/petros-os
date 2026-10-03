const fs = require('fs');
const p = "src/services/voiceAgent.ts";
let c = fs.readFileSync(p, "utf8");

// Re-balance the speak method and clean syntax
const brokenPattern = /public speak\(text: string[\s\S]*?public stopSpeaking\(\)/;
const cleanImplementation = `public speak(text: string, language: string = "fa", onEnd?: () => void) {
    try {
      const cleanText = text
        .replace(/\`\`\`[\\s\\S]*?\`\`\`/g, "کدها پردازش شدند.")
        .replace(/\`([^\\`]+)\`/g, "$1")
        .replace(/[#*_~>]/g, "")
        .trim();

      if (!cleanText) { if (onEnd) onEnd(); return; }

      const shortText = cleanText.split(/[.!?\\n]/).filter(Boolean).slice(0, 3).join(". ") + ".";
      const audioUrl = "/api/voice/tts?lang=" + encodeURIComponent(language) + "&text=" + encodeURIComponent(shortText);
      const audio = new Audio(audioUrl);
      
      this.isSpeaking = true;
      this.notify();

      audio.onended = () => {
        this.isSpeaking = false;
        this.notify();
        if (onEnd) onEnd();
      };
      audio.onerror = () => {
        this.isSpeaking = false;
        this.notify();
        if (onEnd) onEnd();
      };
      audio.play().catch(() => {
        this.isSpeaking = false;
        this.notify();
        if (onEnd) onEnd();
      });
      return;
    } catch {
      this.isSpeaking = false;
      this.notify();
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking()`;

c = c.replace(brokenPattern, cleanImplementation);
fs.writeFileSync(p, c);
console.log("✅ Syntax in voiceAgent.ts completely fixed!");
