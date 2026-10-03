//
//  ContentView.swift
//  SimpleIOSApp
//
//  Created autonomously by CODGAR with Swift & SwiftUI
//

import SwiftUI

struct ContentView: View {
    @State private var isLiked: Bool = false
    @State private var counter: Int = 0

    var body: some View {
        ZStack {
            // Background Gradient (iOS 18 Liquid Glass Style)
            LinearGradient(
                colors: [Color(red: 0.08, green: 0.12, blue: 0.22), Color(red: 0.04, green: 0.06, blue: 0.12)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 24) {
                Spacer()

                // App Icon / SF Symbol
                ZStack {
                    Circle()
                        .fill(LinearGradient(colors: [.blue, .cyan], startPoint: .topLeading, endPoint: .bottomTrailing))
                        .frame(width: 88, height: 88)
                        .shadow(color: .blue.opacity(0.4), radius: 16, x: 0, y: 8)

                    Image(systemName: "applelogo")
                        .font(.system(size: 40, weight: .bold))
                        .foregroundColor(.white)
                }

                // Title & Subtitle
                VStack(spacing: 8) {
                    Text("اپلیکیشن ساده iOS")
                        .font(.system(size: 26, weight: .bold, design: .rounded))
                        .foregroundColor(.white)

                    Text("طراحی شده با Swift & SwiftUI")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(.gray)
                }

                // Interactive Counter Card
                VStack(spacing: 16) {
                    Text("تعداد کلیک: \(counter)")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.white)

                    HStack(spacing: 16) {
                        Button(action: {
                            counter += 1
                        }) {
                            HStack {
                                Image(systemName: "plus.circle.fill")
                                Text("افزایش")
                            }
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 12)
                            .background(Color.blue)
                            .cornerRadius(12)
                        }

                        Button(action: {
                            isLiked.toggle()
                        }) {
                            Image(systemName: isLiked ? "heart.fill" : "heart")
                                .font(.system(size: 20))
                                .foregroundColor(isLiked ? .red : .white)
                                .padding(12)
                                .background(Color.white.opacity(0.1))
                                .clipShape(Circle())
                        }
                    }
                }
                .padding(24)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color.white.opacity(0.06))
                        .overlay(
                            RoundedRectangle(cornerRadius: 20)
                                .stroke(Color.white.opacity(0.12), lineWidth: 1)
                        )
                )
                .padding(.horizontal, 32)

                Spacer()

                // Footer Device Info
                Text("Native iOS Runtime • Ready for Xcode")
                    .font(.system(size: 12, weight: .regular, design: .monospaced))
                    .foregroundColor(.gray.opacity(0.7))
                    .padding(.bottom, 20)
            }
        }
    }
}

#Preview {
    ContentView()
}
