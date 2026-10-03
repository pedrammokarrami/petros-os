import Foundation

final class BackendManager {
    static let shared = BackendManager()
    private var process: Process?

    private init() {}

    func startBackend(workingDirectory: String) {
        guard process == nil else { return }

        let p = Process()
        p.currentDirectoryURL = URL(fileURLWithPath: workingDirectory)
        p.executableURL = URL(fileURLWithPath: "/bin/zsh")
        p.arguments = ["-l", "-c", "lsof -ti:3000 | xargs kill -9 2>/dev/null || true; npm run dev"]

        var env = ProcessInfo.processInfo.environment
        // مسیر ترکیبی شامل /usr/local/bin برای مک‌های اینتل و /opt/homebrew/bin برای اپل سیلیکون
        let universalPaths = "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
        let existingPath = env["PATH"] ?? ""
        env["PATH"] = "\(universalPaths):\(existingPath)"
        env["HOST"] = "127.0.0.1"
        env["PORT"] = "3000"
        p.environment = env

        do {
            try p.run()
            self.process = p
            print("[BackendManager] Universal backend started cleanly on port 3000.")
        } catch {
            print("[BackendManager] Error: \(error.localizedDescription)")
        }
    }

    func stopBackend() {
        guard let p = process, p.isRunning else { return }
        p.terminate()
        p.waitUntilExit()
        process = nil
    }
}
