import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const mountEl = document.getElementById('garden') || document.getElementById('root');
if (mountEl) {
  createRoot(mountEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
