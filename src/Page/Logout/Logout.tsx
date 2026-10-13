import React from 'react'
import { useNavigate } from 'react-router'
import { Footer } from '../../component/App/Footer'
import { IconLogo } from '../../component/Icon/Icon'
import * as auth from '../../lib/auth'
import './Logout.css'

export function Logout() {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/cofre/login', { replace: false })
  }

  React.useEffect(() => {
    (async () => {
      await auth.removeSession()
    })()
  })

  return <>
    <main className='Logout'>
      <IconLogo />
      <h1>Logged out</h1>
      <button type='button' onClick={handleClick}>Login</button>
    </main>
    <Footer />
  </>
}
