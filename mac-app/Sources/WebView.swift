import SwiftUI
import WebKit

// پل انتقال بی‌درنگ لاگ‌های فرانت‌اند به دیباگ کنسول ایکسکد
class CodgarConsoleBridge: NSObject, WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "codgarLogger", let dict = message.body as? [String: Any] {
            let level = dict["level"] as? String ?? "INFO"
            let tag = dict["tag"] as? String ?? "UI/UX"
            let msg = dict["message"] as? String ?? ""
            print("[\(tag)] [\(level)] \(msg)")
        }
    }
}

public struct WebView: NSViewRepresentable {
    public let url: URL

    public init(url: URL) {
        self.url = url
    }

    public func makeCoordinator() -> Coordinator {
        Coordinator(url: url)
    }

    public func makeNSView(context: Context) -> WKWebView {
        let userController = WKUserContentController()
        let bridge = CodgarConsoleBridge()
        userController.add(bridge, name: "codgarLogger")

        let jsLogger = """
        (function() {
            function forward(level, tag, args) {
                try {
                    var str = Array.from(args).map(function(item) {
                        if (typeof item === "object") {
                            try { return JSON.stringify(item); } catch(e) { return String(item); }
                        }
                        return String(item);
                    }).join(" ");
                    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.codgarLogger) {
                        window.webkit.messageHandlers.codgarLogger.postMessage({ level: level, tag: tag, message: str });
                    }
                } catch(err) {}
            }

            var _log = console.log, _warn = console.warn, _err = console.error;
            console.log = function() { forward("INFO", "UI/UX Event", arguments); _log.apply(console, arguments); };
            console.warn = function() { forward("WARN", "UI/UX Warning", arguments); _warn.apply(console, arguments); };
            console.error = function() { forward("CRASH/ERR", "UI/UX Error", arguments); _err.apply(console, arguments); };

            window.addEventListener("error", function(e) {
                forward("FATAL", "UI/UX Uncaught Crash", [e.message + " (" + e.filename + ":" + e.lineno + ")"]);
            });
            window.addEventListener("unhandledrejection", function(e) {
                forward("PROMISE", "UI/UX Promise Error", [e.reason]);
            });

            console.log("[Diagnostic: UI/UX Bridge] Live Xcode Debug Console Logger Activated");
        })();
        """

        let userScript = WKUserScript(source: jsLogger, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        userController.addUserScript(userScript)

        let config = WKWebViewConfiguration()
        config.userContentController = userController

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        context.coordinator.webView = webView

        print("[Diagnostic: WebView] Initializing WKWebView with target URL: \(url)")
        webView.load(URLRequest(url: url))
        return webView
    }

    public func updateNSView(_ nsView: WKWebView, context: Context) {}

    public class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let url: URL
        weak var webView: WKWebView?
        private var retryCount = 0

        init(url: URL) {
            self.url = url
            super.init()
        }

        public func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            print("[Diagnostic: WebView] 🌐 Starting provisional navigation to: \(url)")
        }

        public func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            let nsErr = error as NSError
            print("[Diagnostic: WebView] ⚠️ Connection error (Code: \(nsErr.code)) - \(error.localizedDescription)")

            // کد ۱۰-۰۴ یا ۶۱ نشان‌دهنده منتظر بودن برای بالا آمدن پورت ۳۰۰۰ سرور است
            if nsErr.code == NSURLErrorCannotConnectToHost || nsErr.code == -1004 || nsErr.code == 61 {
                retryCount += 1
                print("[Diagnostic: Watchdog] ⏳ Waiting for Node backend on port 3000... Retrying in 1s (Attempt #\(retryCount))")
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self, weak webView] in
                    guard let self = self, let wv = webView else { return }
                    print("[Diagnostic: Watchdog] 🔄 Retrying connection to \(self.url)...")
                    wv.load(URLRequest(url: self.url))
                }
            }
        }

        public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            print("[Diagnostic: WebView] ✅ Page loaded successfully! UI/UX interface is active and visible.")
        }
    }
}
