import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrandProvider } from '@/state/BrandProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrandProvider>
      <App />
    </BrandProvider>
  </StrictMode>,
)
