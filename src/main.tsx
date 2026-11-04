import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ensureSeedData } from './core/config/dbClient';

// Inicialización de datos semilla controlada por bandera única
ensureSeedData().catch((err) => {
  console.error('Error al inicializar la base de datos local:', err);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
