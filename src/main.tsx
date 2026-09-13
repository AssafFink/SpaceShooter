import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { SoundProvider } from './context/SoundContext.tsx';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* basename picks up Vite's base ('/SpaceShooter/' in prod, '/' in dev) so
        routes resolve correctly under the GitHub Pages project path. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SoundProvider>
        <App />
      </SoundProvider>
    </BrowserRouter>
  </StrictMode>,
);
