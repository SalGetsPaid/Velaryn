const config = {
  appId: "com.velaryn.app",
  appName: "Velaryn",
  // Next.js static export output directory
  webDir: "out",
  android: {
    // Disallow mixed HTTP content within the WebView
    allowMixedContent: false,
    // Keep WebView debugging off in production
    webContentsDebuggingEnabled: false,
    // Capture all text input natively for performance
    captureInput: true,
    // Override SDK versions from variables.gradle at runtime (Capacitor 7+)
    minSdkVersion: 28,   // BiometricPrompt Class 3 (BIOMETRIC_STRONG) requires API 28+
    targetSdkVersion: 36, // Android 16 — required for Google Play acceptance from 2026
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#000000",
    },
  },
};

export default config;
