import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import { AppProvider } from './component/App/AppProvider'
import { GetStarted } from './Page/GetStarted/GetStarted'
import { Home } from './Page/Home/Home'
import { Login } from './Page/Login/Login'
import { PageSettings } from './Page/Settings/Settings'
import { ProtectRoute } from './component/App/ProtectRoute'
import { Logout } from './Page/Logout/Logout'
import './main.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* public pages */}
        <Route path="/cofre/get-started" element={<GetStarted />} />
        <Route path="/cofre/login" element={<Login />} />
        <Route path="/cofre/logout" element={<Logout />} />

        {/* protected pages */}
        <Route element={<ProtectRoute />}>
          <Route path="/cofre/home" element={
            <AppProvider>
              <Home />
            </AppProvider>
          } />
          <Route path="/cofre/settings" element={
            <AppProvider>
              <PageSettings />
            </AppProvider>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode >
)
