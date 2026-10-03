import SwiftUI

struct ContentView: View {
    private let targetURL = URL(string: "http://127.0.0.1:3000")!
    @StateObject private var orchestrator = MasterAgentOrchestrator.shared

    var body: some View {
        ZStack(alignment: .topTrailing) {
            // وب‌ویوی اصلی برنامه
            LocalWebView(url: targetURL)
                .frame(minWidth: 1100, minHeight: 750)
                .background(Color.black)
            
            // ویجت شناور هوش مصنوعی و گوی شناختی بومی مک
            VStack(alignment: .trailing, spacing: 8) {
                CyberneticCognitiveOrb(orchestrator: orchestrator)
                    .frame(width: 260)
                
                if orchestrator.isTelemetryExpanded {
                    CinematicAgentSurfaceView(
                        isThinking: orchestrator.cognitiveLoadFactor > 0.0,
                        loadFactor: orchestrator.cognitiveLoadFactor
                    ) {
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text("YADOW NEURAL TELEMETRY")
                                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                                    .foregroundColor(.cyan)
                                Spacer()
                                Text("Port 9090 [OK]")
                                    .font(.system(size: 9, design: .monospaced))
                                    .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
                            }
                            
                            Divider().background(Color.white.opacity(0.15))
                            
                            Text("Cognitive Load: \(Int(orchestrator.cognitiveLoadFactor * 100))%")
                                .font(.system(size: 10, design: .monospaced))
                                .foregroundColor(.white.opacity(0.8))
                            
                            ProgressView(value: orchestrator.cognitiveLoadFactor)
                                .tint(.cyan)
                            
                            if !orchestrator.sourceCodeBuffer.isEmpty {
                                Text("Buffer Stream:")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundColor(.white.opacity(0.6))
                                Text(orchestrator.sourceCodeBuffer.suffix(120))
                                    .font(.system(size: 9, design: .monospaced))
                                    .foregroundColor(.cyan.opacity(0.9))
                                    .lineLimit(3)
                            }
                        }
                        .frame(width: 270)
                    }
                    .transition(.move(edge: .top).combined(with: .opacity))
                }
            }
            .padding(14)
        }
    }
}
