import Foundation
import SwiftUI
import Combine

/// وضعیت‌های درونی ایجنت جهت تغییر رفتار انیمیشن‌ها و جریان داده
public enum AgentCognitivePhase: Equatable {
    case ready
    case synthesizing(step: String)
    case executingSystemAction(toolName: String)
    case streamingBuffer
    case failure(reason: String)
    
    public var label: String {
        switch self {
        case .ready: return "آماده به کار"
        case .synthesizing(let step): return "استدلال: \(step)"
        case .executingSystemAction(let tool): return "ابزار: \(tool)"
        case .streamingBuffer: return "تولید جریان کد"
        case .failure(let reason): return "خطا: \(reason)"
        }
    }
    
    public var color: Color {
        switch self {
        case .ready: return Color(red: 16/255, green: 185/255, blue: 129/255)
        case .synthesizing: return .cyan
        case .executingSystemAction: return .indigo
        case .streamingBuffer: return .blue
        case .failure: return Color(red: 244/255, green: 63/255, blue: 94/255)
        }
    }
}

/// هماهنگ‌کننده مرکزی ارتباط میان استنتاج محلی، ابزارها و لایه ارائه
@MainActor
public final class MasterAgentOrchestrator: ObservableObject {
    public static let shared = MasterAgentOrchestrator()
    
    @Published public var activePhase: AgentCognitivePhase = .ready
    @Published public var sourceCodeBuffer: String = ""
    @Published public var systemExecutionLogs: String = ""
    @Published public var cognitiveLoadFactor: Float = 0.0
    @Published public var isTelemetryExpanded: Bool = false
    
    public let mcpServer: CodebaseMCPServer
    public let daemon: EmbeddedDaemonRuntime
    
    public init() {
        let activeDirectory = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
        self.mcpServer = CodebaseMCPServer(workspacePath: activeDirectory)
        self.daemon = EmbeddedDaemonRuntime(port: 9090)
        
        Task {
            try? await self.daemon.start()
        }
    }
    
    /// ثبت و اجرای دستور کاربری در خط‌لوله شناختی
    public func submitDirective(_ directive: String) async {
        self.activePhase = .synthesizing(step: "تحلیل پرامپت و کانتکست")
        self.cognitiveLoadFactor = 0.5
        self.systemExecutionLogs += "\n[Directives] Processing: \(directive)"
        
        do {
            let tokenStream = try await initiateTokenGeneration(for: directive)
            self.activePhase = .streamingBuffer
            self.cognitiveLoadFactor = 0.85
            
            for try await token in tokenStream {
                self.sourceCodeBuffer.append(token)
                
                if self.sourceCodeBuffer.contains("<call:tool>") {
                    self.activePhase = .executingSystemAction(toolName: "Native Codebase Navigation")
                    self.cognitiveLoadFactor = 1.0
                    try await Task.sleep(nanoseconds: 300_000_000)
                }
            }
            
            self.activePhase = .ready
            self.cognitiveLoadFactor = 0.0
            self.systemExecutionLogs += "\n[Directives] Completed successfully."
        } catch {
            self.activePhase = .failure(reason: error.localizedDescription)
            self.cognitiveLoadFactor = 0.0
        }
    }
    
    private func initiateTokenGeneration(for prompt: String) async throws -> AsyncThrowingStream<String, Error> {
        return AsyncThrowingStream { continuation in
            Task {
                let segments = ["// Yadow Native Autonomous Agent Engine\n", "import Foundation\n", "actor PipelineWorker {\n", "    func compute() -> Bool { true }\n", "}\n"]
                for seg in segments {
                    try await Task.sleep(nanoseconds: 60_000_000)
                    continuation.yield(seg)
                }
                continuation.finish()
            }
        }
    }
}
