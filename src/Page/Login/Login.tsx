import React from 'react'
import { InputPin } from '../../component/Input'
import { useNavigate } from 'react-router'
import * as auth from '../../lib/auth'
import * as storage from '../../lib/storage'

import './Login.css'

function PinAuth() {
  const [message, setMessage] = React.useState<string>('')
  const navigate = useNavigate()

  const handleSubmit = async (pin: string) => {
    const isValid = await auth.isPinValid(pin)

    if (isValid === false) {
      setMessage(() => 'PIN inválido')
      return
    }

    await auth.addSession(pin)
    setMessage(() => '')
    navigate('/cofre', { replace: true })
  }

  React.useEffect(() => {
    (async () => {
      const [hasSession, sett] = await Promise.all([
        auth.isSessionValid(),
        storage.loadSettings(),
      ])

      if (hasSession) {
        navigate('/cofre', { replace: true })
      }

      const hasValidSettings = sett.enableBiometricAuth === true
        || sett.enablePinAuth === true
      if (hasValidSettings === false) {
        navigate('/cofre/get-started', { replace: true })
        return
      }
    })()
  })

  return <>
    <h2>
      Insira seu <abbr title='Personal Identification Number'>PIN</abbr>
    </h2>
    <InputPin message={message} onSubmit={handleSubmit} autoFocus circularFocus />
  </>
}

export function Login() {
  return <>
    <main className='Main Login'>
      <PinAuth />
    </main>
  </>
}