import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setDefaultAdapter } from '@palmares/schemas'
import { ZodSchemaAdapter } from '@palmares/zod-schema'

setDefaultAdapter(new ZodSchemaAdapter());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
