import './index.css'; // Must be first!
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BrightBuyEcommerce from './BrightBuyEcommerce';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrightBuyEcommerce />
  </StrictMode>
);
