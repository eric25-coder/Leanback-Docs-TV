import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('CRITICAL ERROR: Root element #root not found');
} else {
  try {
    console.log('Mounting Leanback Docs TV React Application...');
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error: any) {
    console.error('CRITICAL MOUNT ERROR:', error);
    rootElement.innerHTML = `
      <div style="padding: 40px; color: white; background: #7f1d1d; height: 100vh; font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 20px;">Startup Failure</h1>
        <p style="font-size: 1.2rem; max-width: 600px; opacity: 0.8; margin-bottom: 30px;">
          The application failed to initialize its core components.
        </p>
        <pre style="background: rgba(0,0,0,0.5); padding: 20px; border-radius: 12px; overflow: auto; max-width: 90vw; text-align: left; font-size: 0.8rem;">${error?.stack || error?.message || String(error)}</pre>
        <button onclick="window.location.reload()" style="margin-top: 30px; padding: 15px 40px; background: white; color: #7f1d1d; border: none; border-radius: 50px; font-weight: bold; cursor: pointer; font-size: 1.1rem;">Restart App</button>
      </div>
    `;
  }
}

// Global error handler - only fires if the app hasn't rendered anything after 5 seconds
let hasRendered = false;
setTimeout(() => { hasRendered = true; }, 5000);

window.addEventListener('error', (event) => {
  console.error('UNHANDLED RUNTIME ERROR:', event.error || event.message);
  
  // Only show the "Nuclear" error screen if we are still on a blank page after 5 seconds
  if (!hasRendered && rootElement && (rootElement.innerHTML === '' || rootElement.innerHTML === '<!-- react-mount-point-unstable -->')) {
    rootElement.innerHTML = `
      <div style="padding: 40px; color: white; background: #0f172a; height: 100vh; font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <h1 style="color: #ef4444; font-size: 2.5rem; margin-bottom: 20px;">Runtime Error Detected</h1>
        <p style="margin-bottom: 20px; opacity: 0.7;">A fatal error occurred before the dashboard could load.</p>
        <pre style="background: rgba(0,0,0,0.4); padding: 20px; border-radius: 8px; overflow: auto; max-width: 90vw; text-align: left;">${event.message}\n${event.error?.stack || ''}</pre>
        <p style="margin-top: 20px; font-size: 0.9rem; color: #94a3b8;">Check Android Logcat for full details.</p>
      </div>
    `;
  }
});

