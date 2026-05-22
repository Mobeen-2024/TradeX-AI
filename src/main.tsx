import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { MarketRegimeProvider } from './contexts/MarketRegimeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MarketRegimeProvider>
      <App />
    </MarketRegimeProvider>
  </StrictMode>,
);
