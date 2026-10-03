export interface VoicePersonaResult {
  name: string;
  gender: 'female' | 'male';
  voice: string;
  rate: string;
  pitch: string;
  emotion: string;
}

export class LayaVoicePersona {
  /**
   * Intelligently analyzes user prompt and response text to determine
   * the optimal speaker gender, emotion, pitch, and speaking rate.
   */
  public static determinePersona(prompt: string, reply: string, lang = 'fa'): VoicePersonaResult {
    const combined = `${prompt} ${reply}`.toLowerCase();

    // 1. Creative, Design, UI/UX, Welcome -> Dilara (Female, Warm, Expressive)
    const isCreativeOrDesign = /(طراحی|دیزاین|ui|ux|زیبا|استایل|رنگ|پوستر|عکس|انیمیشن|خوش آمدید|سلام|خوبی|چخبر|ایده|هنری|فرانت|ظاهر)/i.test(combined);

    if (isCreativeOrDesign) {
      return {
        name: 'Dilara',
        gender: 'female',
        voice: lang === 'fa' ? 'fa-IR-DilaraNeural' : 'en-US-JennyNeural',
        rate: '+4%',
        pitch: '+3Hz',
        emotion: 'creative_warmth'
      };
    }

    // 2. Technical, Core Architecture, Backend, Debugging -> Farid (Male, Confident, Engineering Lead)
    const isHeavyEngineering = /(کد|باگ|دیباگ|معماری|دیتابیس|سرور|ترمینال|پورت|ارور|تست|الگوریتم|سوپروایزر|روتر|api|پروسه)/i.test(combined);

    if (isHeavyEngineering) {
      return {
        name: 'Farid',
        gender: 'male',
        voice: lang === 'fa' ? 'fa-IR-FaridNeural' : 'en-US-GuyNeural',
        rate: '-2%',
        pitch: '-2Hz',
        emotion: 'authoritative_engineering'
      };
    }

    // Default friendly balanced persona
    return {
      name: 'Farid',
      gender: 'male',
      voice: lang === 'fa' ? 'fa-IR-FaridNeural' : 'en-US-GuyNeural',
      rate: '+0%',
      pitch: '+0Hz',
      emotion: 'balanced_partner'
    };
  }
}
