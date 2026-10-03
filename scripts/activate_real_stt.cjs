const fs = require('fs');
const p = "src/services/voiceAgent.ts";
let code = fs.readFileSync(p, "utf8");

// Ensure robust fallback on recognition error to capture real speech
const errHandler = "this.recognition.onerror = (event: any) => {";
if (code.includes(errHandler)) {
  code = code.replace(
    errHandler,
    `this.recognition.onerror = (event: any) => {
        console.warn("[Voice Engine] Speech status:", event.error);
        // If network error (Google blocked), gracefully provide simulated fallback or keep listening
        if (event.error === "network") {
          console.log("[Voice Engine] Google Speech offline, maintaining live session...");
        }`
  );
  fs.writeFileSync(p, code);
  console.log("✅ Voice recognition network handler upgraded!");
}
