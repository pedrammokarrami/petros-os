// LocalIntentEngine - تحلیل شناختی و روتینگ محلی (Sub-5ms, 100% Offline)
export type IntentCategory = 'WEB_APP_SYNTHESIS' | 'VIDEO_GENERATION' | 'IMAGE_GENERATION' | 'TERMINAL_COMMAND' | 'ROUTER_LLM_ASSISTANT';

export interface AnalyzedIntent {
  category: IntentCategory;
  cleanPrompt: string;
  confidence: number;
}

export class LocalIntentEngine {
  static analyze(prompt: string): AnalyzedIntent {
    if (!prompt) return { category: 'ROUTER_LLM_ASSISTANT', cleanPrompt: '', confidence: 1.0 };
    const p = prompt.trim();
    const pLower = p.toLowerCase();

    // ۱. دستورات ترمینال زنده مک‌بوک
    if (p.startsWith('$') || /^(terminal|bash|zsh|ls|cd|git|npm|brew)\b/i.test(p)) {
      return { category: 'TERMINAL_COMMAND', cleanPrompt: p.replace(/^\$\s*/, ''), confidence: 0.99 };
    }

    // ۲. اولویت قطعی: ساخت وب‌سایت، اپلیکیشن، پلتفرم، کدنویسی، کامپوننت و AudioVido
    const isCodeOrWeb = /(سایت|وبسایت|وب‌سایت|اپلیکیشن|پلتفرم|کد|کامپوننت|فرانت|طراحی سایت|audiovido|react|typescript|html|css|component|app\b|website|page\b|صفحه|frontend|نرم‌افزار)/i.test(pLower);
    if (isCodeOrWeb) {
      return { category: 'WEB_APP_SYNTHESIS', cleanPrompt: p, confidence: 0.99 };
    }

    // ۳. درخواست صریح تولید ویدیو و موشن
    const isVideo = /(ویدیو|کلیپ|رندر ویدیو|فیلم|video|clip|انیمیشن|موشن)/i.test(pLower);
    if (isVideo) {
      return { category: 'VIDEO_GENERATION', cleanPrompt: p, confidence: 0.95 };
    }

    // ۴. درخواست صریح تولید عکس با FLUX
    const isImage = /(عکس|تصویر|طراحی تصویر|طراحی عکس|image|photo|draw|flux)/i.test(pLower);
    if (isImage) {
      return { category: 'IMAGE_GENERATION', cleanPrompt: p, confidence: 0.95 };
    }

    // ۵. چت، تحلیل معماری و دیباگ
    return { category: 'ROUTER_LLM_ASSISTANT', cleanPrompt: p, confidence: 0.90 };
  }
}
