import React from 'react'
import { Outlet, useNavigate } from 'react-router'
import { t } from '../../lib/translation'
import * as auth from '../../lib/auth'

export function ProtectRoute() {
  const navigate = useNavigate()
  const [isLoading, setLoading] = React.useState(true)

  React.useEffect(() => {
    (async () => {
      const hasSession = await auth.isSessionValid()

      if (hasSession) {
        setLoading(() => false)
      } else {
        navigate('/cofre/login', { replace: true })
      }
    })()
  })

  if (isLoading) {
    return `${t('loading')} ...`
  }

  return <Outlet />
}