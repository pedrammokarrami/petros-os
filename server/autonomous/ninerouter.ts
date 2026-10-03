export class NineRouterGateway {
  public static readonly GATEWAY_PORT = 20128;

  public static getActiveFreePool(): { name: string; status: string; autoFallback: boolean } {
    return {
      name: "9Router-OpenCode-FreePool",
      status: "ONLINE",
      autoFallback: true
    };
  }
}
