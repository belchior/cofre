import React from 'react'
import { Outlet, useNavigate } from 'react-router'
import * as auth from '../../lib/auth'
import * as env from '../../lib/environment'

export function ProtectRoute() {
  const navigate = useNavigate()
  const [isLoading, setLoading] = React.useState(true)

  React.useEffect(() => {
    (async () => {
      const hasSession = await auth.isSessionValid()

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