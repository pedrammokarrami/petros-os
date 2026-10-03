// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CodgarStudio",
    platforms: [.macOS(.v13)],
    targets: [
        .executableTarget(
            name: "CodgarStudio",
            path: "Sources"
        )
    ]
)
