import SwiftUI

/// کانتینر بصری ایجنت مجهز به افکت‌های شیشه‌ای انکساری و شیدرهای متال
public struct CinematicAgentSurfaceView<Content: View>: View {
    @ViewBuilder public let content: Content
    public var isThinking: Bool
    public var loadFactor: Float
    
    public init(isThinking: Bool, loadFactor: Float = 0.0, @ViewBuilder content: () -> Content) {
        self.isThinking = isThinking
        self.loadFactor = loadFactor
        self.content = content()
    }
    
    public var body: some View {
        TimelineView(.animation) { context in
            let elapsedTime = context.date.timeIntervalSinceReferenceDate
            
            content
                .padding(14)
                .background(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(Color.black.opacity(0.55))
                        .background(.ultraThinMaterial)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .stroke(
                                    LinearGradient(
                                        colors: isThinking 
                                            ? [.cyan.opacity(0.8), .indigo.opacity(0.6), .clear]
                                            : [.white.opacity(0.2), .clear],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    ),
                                    lineWidth: 1.2
                                )
                        )
                )
                .modifier(MetalDistortionModifier(time: elapsedTime, intensity: isThinking ? loadFactor : 0.0))
                .shadow(color: isThinking ? .cyan.opacity(0.35) : .clear, radius: 20, x: 0, y: 8)
        }
    }
}

struct MetalDistortionModifier: ViewModifier {
    let time: Double
    let intensity: Float
    
    func body(content: Content) -> some View {
        if #available(macOS 14.0, *) {
            content.distortionEffect(
                ShaderLibrary.neuralWaveDistortion(
                    .float(time),
                    .float2(800, 600),
                    .float(intensity)
                ),
                maxSampleOffset: CGSize(width: 12, height: 12)
            )
        } else {
            content
        }
    }
}

/// گوی شناور شناختی (Cognitive Orb) با نمایش بلادرنگ وضعیت هوش مصنوعی
public struct CyberneticCognitiveOrb: View {
    @ObservedObject var orchestrator: MasterAgentOrchestrator
    
    public var body: some View {
        HStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(orchestrator.activePhase.color.opacity(0.25))
                    .frame(width: 18, height: 18)
                
                Circle()
                    .fill(orchestrator.activePhase.color)
                    .frame(width: 8, height: 8)
                    .scaleEffect(orchestrator.cognitiveLoadFactor > 0.0 ? 1.3 : 1.0)
                    .animation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true), value: orchestrator.cognitiveLoadFactor)
            }
            
            Text(orchestrator.activePhase.label)
                .font(.system(size: 11, weight: .semibold, design: .monospaced))
                .foregroundColor(.white.opacity(0.9))
            
            Spacer()
            
            Button(action: {
                withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                    orchestrator.isTelemetryExpanded.toggle()
                }
            }) {
                Image(systemName: orchestrator.isTelemetryExpanded ? "chevron.up.circle.fill" : "waveform.circle.fill")
                    .foregroundColor(.cyan)
                    .font(.system(size: 14))
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            Capsule()
                .fill(Color.black.opacity(0.65))
                .background(.ultraThinMaterial)
                .overlay(Capsule().stroke(Color.white.opacity(0.18), lineWidth: 1))
        )
    }
}
