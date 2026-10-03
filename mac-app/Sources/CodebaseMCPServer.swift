import Foundation

/// سرور ایزوله ابزارهای بومی کلاینت بر اساس استاندارد Model Context Protocol
public actor CodebaseMCPServer {
    private let workspacePath: URL
    
    public init(workspacePath: URL) {
        self.workspacePath = workspacePath
    }
    
    /// بازخوانی محتوای یک فایل با امنیت دامنه
    public func readFile(at relativePath: String) throws -> String {
        let fileURL = workspacePath.appendingPathComponent(relativePath)
        return try String(contentsOf: fileURL, encoding: .utf8)
    }
    
    /// ذخیره محتوا در فایل
    public func writeFile(at relativePath: String, content: String) throws {
        let fileURL = workspacePath.appendingPathComponent(relativePath)
        try content.write(to: fileURL, atomically: true, encoding: .utf8)
    }
    
    /// اجرای دستور سیستمی و بازگشت خروجی استاندارد
    public func executeCommand(_ command: String) async throws -> String {
        let process = Process()
        let pipe = Pipe()
        
        process.executableURL = URL(fileURLWithPath: "/bin/zsh")
        process.arguments = ["-c", command]
        process.currentDirectoryURL = workspacePath
        process.standardOutput = pipe
        process.standardError = pipe
        
        try process.run()
        process.waitUntilExit()
        
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        return String(data: data, encoding: .utf8) ?? ""
    }
}
