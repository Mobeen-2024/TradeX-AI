import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { MarketRegimeProvider } from './contexts/MarketRegimeContext';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <MarketRegimeProvider>
        <App />
      </MarketRegimeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
