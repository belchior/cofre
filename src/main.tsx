import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ContentContextProvider } from './component/ContentProvider/ContentProvider.tsx'
import App from './component/App/App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentContextProvider>
      <App />
    </ContentContextProvider>
  </StrictMode>
)
