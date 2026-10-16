import React from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Outlet, useNavigate } from 'react-router'
import * as env from '../../lib/environment'

export function ProtectRoute() {
  const navigate = useNavigate()
  const [isLoading, setLoading] = React.useState(true)

  React.useEffect(() => {
    (async () => {
      const hasSession = await invoke<boolean>('is_session_valid')

      if (hasSession) {
        setLoading(() => false)
      } else {
        navigate('/cofre/login', { replace: false })
      }

      // Prevents the user refresh the page and lost the session
      if (env.isDevelopment()) return
      const callback = (event: BeforeUnloadEvent) => event.preventDefault()
      window.addEventListener('beforeunload', callback)
      return () => {
        window.removeEventListener('beforeunload', callback)
      }
    })()
  })

  if (isLoading) {
    return null
  }

  return <Outlet />
}
