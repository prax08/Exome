import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Register the service worker for PWA capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered successfully:', registration);
      })
      .catch(registrationError => {
        console.error('Service Worker registration failed:', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);