#include <metal_stdlib>
#include <SwiftUI/SwiftUI_Metal.h>
using namespace metal;

/// شیدر اعوجاج موجی متال جهت شبیه‌سازی میدان امواج ذهنی ایجنت
[[stitchable]] float2 neuralWaveDistortion(float2 position, float time, float2 dimensions, float activityIntensity) {
    float2 normalizedCoord = position / dimensions;
    float verticalWave = sin(normalizedCoord.y * 12.0 + time * 3.0);
    float horizontalWave = cos(normalizedCoord.x * 10.0 - time * 2.0);
    float2 displacement = float2(verticalWave, horizontalWave) * (activityIntensity * 12.0);
    return position + displacement;
}

/// شیدر تجزیه طیفی نور و هاله نئونی در مرزهای کامپوننت
[[stitchable]] half4 chromaticAuraShader(float2 position, half4 sourceColor, float time, float pulseSpeed) {
    if (sourceColor.a == 0.0) return sourceColor;
    float wavePhase = (sin(time * pulseSpeed) + 1.0) * 0.5;
    half3 etherealGlow = half3(0.0, 0.8, 0.9) * half(wavePhase);
    return half4(sourceColor.rgb + etherealGlow * sourceColor.a, sourceColor.a);
}
