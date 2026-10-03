import SwiftUI
import AppKit

@main
struct CodgarStudioApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)

        let projectFolder = NSHomeDirectory() + "/Codgar-Final-1"
        BackendManager.shared.startBackend(workingDirectory: projectFolder)

        // اجرای خودکار تست کامل در کنسول Xcode
        DiagnosticSuite.run(baseURL: "http://127.0.0.1:3000")
    }

    func applicationWillTerminate(_ notification: Notification) {
        BackendManager.shared.stopBackend()
    }
}
