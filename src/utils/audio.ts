// تابع تزریق مستقیم متن به کادرهای کنترل‌شده ری‌اکت و ویس
export function updateReactInput(value: string) {
  if (!value) return;

  // ۱. پیدا کردن اینپوت اصلی تایپ پیام
  const inputEl = document.querySelector(
    'input[placeholder*="Type your message"], textarea[placeholder*="Type your message"], input[type="text"], textarea'
  ) as HTMLInputElement | HTMLTextAreaElement | null;

  if (inputEl) {
    const isTextarea = inputEl.tagName.toLowerCase() === 'textarea';
    const proto = isTextarea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');

    if (desc && desc.set) {
      desc.set.call(inputEl, value);
    } else {
      inputEl.value = value;
    }

    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    inputEl.focus();
  }

  // ۲. به‌روزرسانی همزمان کادر نمایشگر داخلی ویس ریکوردر
  document.querySelectorAll('[data-voice-transcript], .voice-transcript, [class*="voice"], [class*="recording"]').forEach((el) => {
    if (el && el.tagName.toLowerCase() !== 'button') {
      el.textContent = value;
    }
  });
}

export class VoiceRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private stream: MediaStream | null = null;

  public async startRecording(): Promise<boolean> {
    try {
      this.stream = await /* getUserMedia disabled */ undefined({ audio: true });
      this.audioChunks = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');

      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.stream, { mimeType })
        : new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.start(100);
      this.isRecording = true;
      return true;
    } catch (err) {
      /* mic standby */
      return false;
    }
  }

  public async stopRecording(): Promise<string> {
    if (!this.mediaRecorder || !this.isRecording) return '';

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        if (this.stream) {
          this.stream.getTracks().forEach((t) => t.stop());
        }

        const rawMime = this.mediaRecorder?.mimeType || 'audio/webm';
        const cleanMime = rawMime.split(';')[0].trim();
        const audioBlob = new Blob(this.audioChunks, { type: cleanMime });

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const rawBase64 = reader.result as string;
          // جداسازی دقیق رشته Base64 بدون وابستگی به رجکس
          const pureBase64 = rawBase64.includes(',') ? rawBase64.split(',') : rawBase64;

          try {
            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: pureBase64, mimeType: cleanMime })
            });
            const data = await res.json();
            const text = data.text || data.transcript || '';

            // تایپ فوری در تمام کادرها
            if (text) {
              updateReactInput(text);
            }
            resolve(text);
          } catch (err) {
            console.error('[VoiceRecorder] Transcribe error:', err);
            resolve('');
          }
        };
      };

      this.mediaRecorder!.stop();
      this.isRecording = false;
    });
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }
}

export const voiceRecorder = new VoiceRecorderService();

export function updateReactInput(value: string) {
  if (!value) return;
  const inputEl = document.querySelector("input[placeholder*='Type your message'], textarea[placeholder*='Type your message']") as HTMLInputElement | HTMLTextAreaElement | null;
  if (inputEl) {
    const isTextarea = inputEl.tagName.toLowerCase() === "textarea";
    const proto = isTextarea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc && desc.set) {
      desc.set.call(inputEl, value);
    } else {
      inputEl.value = value;
    }
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    inputEl.dispatchEvent(new Event("change", { bubbles: true }));
    inputEl.focus();
  }
}
