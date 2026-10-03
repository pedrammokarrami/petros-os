import { GaifDevRouter, ModelProfile, PackageTopology } from '../gaifRouter';

export interface RouterEvaluationResult {
  selectedModel: ModelProfile;
  arbitrationEngine: string;
  routerTier: string;
  freeTierActive: boolean;
  tokensSavedEstimate: number;
  reason: string;
  fallbackChain: string[];
}

export class OmniRouterWorker {
  /**
   * Evaluates task prompt using Gaif.dev decision model
   */
  static evaluateTask(prompt: string, mode: string = 'agent'): RouterEvaluationResult {
    const gaif = GaifDevRouter.getInstance();
    const decision = gaif.selectBestModel(prompt, { mode });

    return {
      selectedModel: decision.model,
      arbitrationEngine: 'موتور هوشمند تصمیم‌گیری کدگر (CODGAR Decision Engine)',
      routerTier: decision.routerTier,
      freeTierActive: true,
      tokensSavedEstimate: decision.estimatedTokens,
      reason: decision.reason,
      fallbackChain: [
        decision.model.name,
        'روتر پشتیبان کدگر (CODGAR Reflex Tier)',
        'موتور معماری کدگر (CODGAR Architect Tier)',
        'سیستم پایدارسازی ابری کدگر (CODGAR Vance Overdrive)',
      ],
    };
  }

  /**
   * Returns current package suite topology
   */
  static getTopology(): PackageTopology {
    return GaifDevRouter.getInstance().getTopology();
  }

  /**
   * Installs and syncs CodGate + Cloud Code + NineWriter + OmniRouter + Vance Router
   */
  static installSuite() {
    return GaifDevRouter.getInstance().installPackageSuite();
  }
}
