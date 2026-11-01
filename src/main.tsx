import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorDiv = document.createElement('div');
  errorDiv.style.padding = '20px';
  errorDiv.style.color = 'white';
  errorDiv.style.background = 'red';
  errorDiv.innerText = 'CRITICAL ERROR: Root element #root not found in index.html';
  document.body.appendChild(errorDiv);
} else {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error: any) {
    console.error('FAILED TO RENDER APP:', error);
    rootElement.innerHTML = `
      <div style="padding: 40px; color: white; background: #1e3a8a; height: 100vh; font-family: sans-serif;">
        <h1 style="color: #f87171;">Startup Error</h1>
        <p>The application failed to start. This diagnostic screen indicates a JavaScript runtime error.</p>
        <pre style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; overflow: auto; max-height: 50vh;">${error?.stack || error?.message || String(error)}</pre>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Reload Application</button>
      </div>
    `;
  }
}

// Global error handler for unhandled promise rejections and script errors
window.addEventListener('error', (event) => {
  console.error('GLOBAL ERROR:', event.error);
  if (rootElement && rootElement.innerHTML === '') {
    rootElement.innerHTML = `
      <div style="padding: 40px; color: white; background: #1e3a8a; height: 100vh; font-family: sans-serif;">
        <h1 style="color: #f87171;">Runtime Error</h1>
        <pre style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; overflow: auto;">${event.message}\n${event.error?.stack || ''}</pre>
      </div>
    `;
  }
});

