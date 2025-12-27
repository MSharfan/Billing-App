import { App } from "@capacitor/app";

export function setupBackButton(onBack) {
  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) {
      onBack();   // Go one step back inside your app
    } else {
      // Prevent exiting app accidentally
      App.exitApp(); 
    }
  });
}
