import { pipeline } from '@xenova/transformers';

class WhisperSTTService {
  private transcriber: any = null;
  private isLoading: boolean = false;

  public async init() {
    if (this.transcriber || this.isLoading) return;
    this.isLoading = true;
    try {
      console.log('[Whisper] Initializing lightweight multilingual model...');
      // مدل فوق‌سریع چندزبانه (پشتیبانی از فارسی و انگلیسی)
      this.transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
        quantized: true,
      });
      console.log('[Whisper] Ready.');
    } catch (e) {
      console.error('[Whisper] Init error:', e);
    } finally {
      this.isLoading = false;
    }
  }

  public async transcribeAudio(audioData: Float32Array): Promise<string> {
    if (!this.transcriber) {
      await this.init();
    }
    if (!this.transcriber) return '';

    try {
      const result = await this.transcriber(audioData, {
        language: 'persian',
        task: 'transcribe',
      });
      return result?.text || '';
    } catch (err) {
      console.error('[Whisper] Transcribe error:', err);
      return '';
    }
  }
}

export const whisperService = new WhisperSTTService();
