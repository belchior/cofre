import React from 'react'
import { Footer } from '../../component/App/Footer'
import { IconLogo } from '../../component/Icon/Icon'
import { InputPin } from '../../component/Input'
import { SettingsContext } from '../Settings/SettingsProvider'
import { t } from '../../lib/translation'
import { updateAppVersionIfNeed } from '../Settings/AppUpdate'
import { useNavigate } from 'react-router'
import * as auth from '../../lib/auth'
import * as serde from '../../lib/serde'
import * as storage from '../../lib/storage'
import * as webAuthn from '../../lib/webAuthn'
import './Login.css'

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

type PinAuthLoginProps = {
  onSubmit: (pin: string) => void,
}
function PinAuthLogin(props: PinAuthLoginProps) {
  const [message, setMessage] = React.useState<string>('')

  const handleSubmit = async (pin: string) => {
    const isValid = await auth.isPinValid(pin)

    if (isValid === false) {
      setMessage(() => t('invalid_pin'))
      return
    }

    setMessage(() => '')
    const pinHash = await auth.createPinHash(pin)
    props.onSubmit(pinHash)
  }

  return <>
    <p>
      {t('enter_your')} <abbr title='Personal Identification Number'>PIN</abbr>
    </p>
    <InputPin message={message} onSubmit={handleSubmit} autoFocus circularFocus />
  </>
}

type BiometricAuthLoginProps = {
  onSubmit: (pin: string) => void,
  sett: storage.ISettings,
}
function BiometricAuthLogin(props: BiometricAuthLoginProps) {
  const HandleAuthentication = async () => {
    try {
      if (props.sett.passKey == null) {
        throw new Error('passkey_not_found')
      }

      await webAuthn.authenticatePassKey(props.sett.passKey)
      const id = serde.serializeBuffer(props.sett.passKey.id)
      props.onSubmit(id)
      return
    } catch (error) {
      console.error('Passkey authentication error:', (error as Error).message)
    }
  }

  return <>
    <button
      className="BiometricAuth gluey"
      onClick={HandleAuthentication}
      type="button"
    >{t('auth_using_biometric')}</button>
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
    <main className='Login'>
      <IconLogo />
      <h1>{t('login')}</h1>
      <div className="container">
        {context.settings?.enableBiometricAuth &&
          <BiometricAuthLogin onSubmit={handleSubmit} sett={context.settings} />
        }
        {context.settings?.enablePinAuth && (
          onlyPinAuth(context.settings) || state.chosePinAuth
            ? <PinAuthLogin onSubmit={handleSubmit} />
            : <button type="button" className='gluey' onClick={handleClick}>{t('auth_using_pin')}</button>
        )}
      </div>
    </main>
    <Footer />
  </>
}