import React from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useNavigate } from 'react-router'
import { Footer } from '../../component/App/Footer'
import { IconLogo } from '../../component/Icon/Icon'
import './Logout.css'

export function Logout() {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/cofre/login', { replace: false })
  }

  React.useEffect(() => {
    (async () => {
      await invoke<void>('remove_session')
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
