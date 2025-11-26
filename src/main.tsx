import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ContentProvider } from './component/Provider/ContentProvider'
import { CryptoProvider } from './component/Provider/CryptoProvider'
import App from './component/App/App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CryptoProvider>
      <ContentProvider>
        <App />
      </ContentProvider>
    </CryptoProvider>
  </StrictMode>
)
