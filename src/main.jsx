import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import FirebaseConfigError from './components/FirebaseConfigError.jsx'
import { PlanDataProvider } from './context/PlanDataProvider.jsx'
import { isFirebaseConfigured, missingFirebaseEnvKeys } from './firebase.js'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

const root = createRoot(document.getElementById('root'));

if (!isFirebaseConfigured) {
  root.render(
    <StrictMode>
      <FirebaseConfigError missingKeys={missingFirebaseEnvKeys} />
    </StrictMode>,
  );
} else {
  root.render(
    <StrictMode>
      <PlanDataProvider>
        <App />
      </PlanDataProvider>
    </StrictMode>,
  );
}
