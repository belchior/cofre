import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import { Auth } from './component/Page/Auth/Auth'
import { ContentProvider } from './component/Provider/ContentProvider'
import { CryptoProvider } from './component/Provider/CryptoProvider'
import { Home } from './component/Page/Home/Home'
import { ProtectRoute } from './component/App/ProtectRoute'
import { Settings } from './component/Page/Settings/Settings'
import { SettingsProvider } from './component/Provider/SettingsProvider'
import './main.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CryptoProvider>
      <BrowserRouter>
        <Routes>
          {/* public pages */}
          <Route path="/cofre/auth" element={<Auth />} />

          {/* protected pages */}
          <Route element={<ProtectRoute />}>
            <Route path="/cofre" element={
              <SettingsProvider>
                <ContentProvider>
                  <Home />
                </ContentProvider>
              </SettingsProvider>
            } />
            <Route path="/cofre/settings" element={
              <SettingsProvider>
                <Settings />
              </SettingsProvider>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </CryptoProvider>
  </StrictMode >
)
