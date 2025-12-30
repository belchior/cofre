import { Outlet } from 'react-router'
import { isSessionValid } from '../../lib/auth'

export function ProtectRoute() {
  if (isSessionValid()) {
    console.log('protected')
  } else {
    console.log('unprotected')
  }

  return <Outlet />
}