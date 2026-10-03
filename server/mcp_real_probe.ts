import http from "http";
import net from "net";

export async function probeMcpService(id: string): Promise<{ online: boolean; statusText: string; code: string; authUrl?: string }> {
  if (id === "local_pc") {
    return { online: true, statusText: "🟢 متصل و فعال", code: "ONLINE" };
  }

  if (id === "gateway") {
    return { online: true, statusText: "🟢 فعال (OmniRoute 20128)", code: "ONLINE" };
  }

  if (id === "ue5") {
    // تست پورت واقعی ریموت کنترل آنریل ۵ (30010)
    return new Promise((resolve) => {
      const sock = new net.Socket();
      sock.setTimeout(600);
      sock.on("connect", () => {
        sock.destroy();
        resolve({ online: true, statusText: "🟢 موتور UE5 متصل است", code: "ONLINE" });
      });
      sock.on("error", () => {
        resolve({ online: false, statusText: "🔴 غیرفعال (UE5 باز نیست)", code: "OFFLINE" });
      });
      sock.on("timeout", () => {
        sock.destroy();
        resolve({ online: false, statusText: "🔴 تایم‌اوت (UE5 پاسخی نداد)", code: "TIMEOUT" });
      });
      sock.connect(30010, "127.0.0.1");
    });
  }

  if (id === "postgres") {
    // تست پورت واقعی دیتابیس (5432)
    return new Promise((resolve) => {
      const sock = new net.Socket();
      sock.setTimeout(600);
      sock.on("connect", () => {
        sock.destroy();
        resolve({ online: true, statusText: "🟢 دیتابیس آنلاین است", code: "ONLINE" });
      });
      sock.on("error", () => {
        resolve({ online: false, statusText: "🔴 دیتابیس اجرا نشده (پورت ۵۴۳۲)", code: "OFFLINE" });
      });
      sock.connect(5432, "127.0.0.1");
    });
  }

  if (id === "gmail") {
    const hasToken = !!process.env.GMAIL_REFRESH_TOKEN;
    if (hasToken) {
      return { online: true, statusText: "🟢 لاگین فعال", code: "ONLINE" };
    }
    return {
      online: false,
      statusText: "🟡 نیاز به احراز هویت",
      code: "AUTH_REQUIRED",
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth"
    };
  }

  if (id === "github") {
    const hasToken = !!process.env.GITHUB_TOKEN;
    return hasToken
      ? { online: true, statusText: "🟢 متصل به گیت‌هاب", code: "ONLINE" }
      : { online: false, statusText: "⚪ توکن گیت‌هاب ست نشده", code: "NOT_CONFIGURED", authUrl: "https://github.com/settings/tokens" };
  }

  return { online: false, statusText: "⚪ در انتظار کانفیگ", code: "STANDBY" };
}
