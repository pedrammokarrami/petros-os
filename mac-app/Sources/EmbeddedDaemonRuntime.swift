import Foundation
import Network

/// ران‌تایم وب‌سرور سبک درون‌برنامه‌ای مبتنی بر Network framework مک با مصرف رم زیر ۲ مگابایت
public actor EmbeddedDaemonRuntime {
    private let port: UInt16
    private var listener: NWListener?
    private var isRunning: Bool = false
    
    public init(port: UInt16 = 9090) {
        self.port = port
    }
    
    public func start() throws {
        guard !isRunning else { return }
        let params = NWParameters.tcp
        let nwPort = NWEndpoint.Port(rawValue: self.port)!
        let l = try NWListener(using: params, on: nwPort)
        
        l.newConnectionHandler = { connection in
            connection.start(queue: .global())
            self.handleConnection(connection)
        }
        
        l.start(queue: .global())
        self.listener = l
        self.isRunning = true
        print("[EmbeddedDaemon] Native lightweight HTTP daemon online on port \(self.port)")
    }
    
    private nonisolated func handleConnection(_ connection: NWConnection) {
        connection.receive(minimumIncompleteLength: 1, maximumLength: 4096) { data, _, isComplete, _ in
            guard let data = data, let req = String(data: data, encoding: .utf8) else {
                connection.cancel()
                return
            }
            
            let responseBody: String
            if req.contains("GET /v1/agent/status") {
                responseBody = "{\"status\": \"idle\", \"engine\": \"AppleSilicon-Native\", \"port\": 9090}"
            } else {
                responseBody = "{\"ok\": true, \"engine\": \"Yadow\", \"message\": \"Daemon Received\"}"
            }
            
            let httpResponse = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: \(responseBody.utf8.count)\r\nConnection: close\r\n\r\n\(responseBody)"
            connection.send(content: httpResponse.data(using: .utf8), completion: .contentProcessed({ _ in
                connection.cancel()
            }))
        }
    }
    
    public func stop() {
        listener?.cancel()
        listener = nil
        isRunning = false
    }
}
