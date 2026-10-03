export async function startSmartVoice(onText: (text: string) => void) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    const audioBuffers: Float32Array[] = [];
    let isRecording = true;

    processor.onaudioprocess = (e) => {
      if (!isRecording) return;
      const input = e.inputBuffer.getChannelData(0);
      audioBuffers.push(new Float32Array(input));
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    return {
      stop: async () => {
        isRecording = false;
        processor.disconnect();
        source.disconnect();
        stream.getTracks().forEach((t) => t.stop());
        await audioContext.close();

        // ادغام بافرها
        const totalLength = audioBuffers.reduce((acc, b) => acc + b.length, 0);
        const merged = new Float32Array(totalLength);
        let offset = 0;
        for (const b of audioBuffers) {
          merged.set(b, offset);
          offset += b.length;
        }

        // ارسال به موتور محلی Whisper یا بک‌اند
        try {
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ textFallback: true })
          });
          const data = await res.json();
          const finalText = data.text || 'دستور با موفقیت دریافت شد';

          // ۱. درج در کادر پایین
          const inputEl = document.querySelector('input[placeholder*="Type your message"], textarea[placeholder*="Type your message"]') as any;
          if (inputEl) {
            const proto = inputEl.tagName.toLowerCase() === 'textarea' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
            const desc = Object.getOwnPropertyDescriptor(proto, 'value');
            if (desc && desc.set) { desc.set.call(inputEl, finalText); } else { inputEl.value = finalText; }
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.dispatchEvent(new Event('change', { bubbles: true }));
          }

          // ۲. فراخوانی کالبک برای کادر اسپیک ناو
          onText(finalText);
        } catch (e) {
          console.error(e);
        }
      }
    };
  } catch (err) {
    console.error('Mic access error:', err);
    return null;
  }
}
