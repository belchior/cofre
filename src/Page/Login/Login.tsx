import React from 'react'
import { Footer } from '../../component/App/Footer'
import { InputPin } from '../../component/Input'
import { SettingsContext } from '../Settings/SettingsProvider'
import { useNavigate } from 'react-router'
import * as auth from '../../lib/auth'
import * as serde from '../../lib/serde'
import * as storage from '../../lib/storage'
import * as webAuthn from '../../lib/webauthn'

import './Login.css'
import { updateAppVersionIfNeed } from '../Settings/AutoUpdate'

function usedAuthMethods(sett?: storage.ISettings) {
  if (sett == null) return []
  return Object.entries(sett)
    .filter(([key, value]) => key.endsWith('Auth') && value === true)
    .map(([key]) => key)
}

function onlyPinAuth(sett?: storage.ISettings) {
  const authMethods = usedAuthMethods(sett)
  if (authMethods.length !== 1) return false
  return authMethods[0] === 'enablePinAuth'
}

type PinAuthProps = {
  onSubmit: (pin: string) => void,
}
function PinAuth(props: PinAuthProps) {
  const [message, setMessage] = React.useState<string>('')

  const handleSubmit = async (pin: string) => {
    const isValid = await auth.isPinValid(pin)

    if (isValid === false) {
      setMessage(() => 'PIN inválido')
      return
    }

    setMessage(() => '')
    props.onSubmit(pin)
  }

  return <>
    <p>
      Insira seu <abbr title='Personal Identification Number'>PIN</abbr>
    </p>
    <InputPin message={message} onSubmit={handleSubmit} autoFocus circularFocus />
  </>
}

type BiometricAuthProps = {
  onSubmit: (pin: string) => void,
  sett: storage.ISettings,
}
function BiometricAuth(props: BiometricAuthProps) {
  const loadCredential = async () => {
    try {
      const credential = await webAuthn.loadCredential(props.sett.credential!)
      const id = serde.serializeBuffer(credential!.rawId)
      props.onSubmit(id)
      return
    } catch (error) {
      // TODO handle error properly
      console.log('error credential:', (error as Error).message)
    }
  }

  return <>
    <button type="button" className="BiometricAuth" onClick={loadCredential}>Autenticar usando biometria</button>
  </>
}

export function Login() {
  const navigate = useNavigate()
  const context = React.use(SettingsContext)
  const [state, setState] = React.useState<{
    chosePinAuth: boolean
  }>({
    chosePinAuth: false,
  })

  const handleSubmit = async (additionalData: string) => {
    await auth.addSession(additionalData)
    navigate('/cofre', { replace: true })
    return
  }

  const handleClick = () => {
    setState(prev => ({ ...prev, chosePinAuth: true }))
  }

  React.useEffect(() => {
    (async () => {
      const hasSession = await auth.isSessionValid()

      if (hasSession) {
        navigate('/cofre', { replace: true })
        return
      }

      const hasValidSettings = [
        context.settings?.enableBiometricAuth,
        context.settings?.enablePinAuth,
      ].includes(true)

      if (hasValidSettings === false) {
        navigate('/cofre/get-started', { replace: true })
        return
      }

      if (context.settings) {
        updateAppVersionIfNeed(context.settings)
      }
    })()
  })

  return <>
    <main className='Main Login'>
      <h2>Login</h2>
      <div className="container">
        {context.settings?.enableBiometricAuth &&
          <BiometricAuth onSubmit={handleSubmit} sett={context.settings} />
        }
        {context.settings?.enablePinAuth && (
          onlyPinAuth(context.settings) || state.chosePinAuth
            ? <PinAuth onSubmit={handleSubmit} />
            : <button type="button" onClick={handleClick}>Autenticar usando PIN</button>
        )}
      </div>
    </main>
    <Footer />
  </>
}