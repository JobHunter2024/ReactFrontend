import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from '../App';
import { DropdownProvider } from './DropdownContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <DropdownProvider>
    <App />
  </DropdownProvider>
);