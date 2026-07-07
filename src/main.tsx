import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import { ContentProvider } from './component/Provider/ContentProvider'
import { CryptoProvider } from './component/Provider/CryptoProvider'
import { GetStarted } from './Page/GetStarted/GetStarted'
import { Home } from './Page/Home/Home'
import { Login } from './Page/Login/Login'
import { ProtectRoute } from './component/App/ProtectRoute'
import { Settings } from './Page/Settings/Settings'
import { SettingsProvider } from './Page/Settings/SettingsProvider'
import './main.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CryptoProvider>
      <BrowserRouter>
        <Routes>
          {/* public pages */}
          <Route path="/cofre/get-started" element={
            <SettingsProvider>
              <GetStarted />
            </SettingsProvider>
          } />
          <Route path="/cofre/login" element={<Login />} />

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
