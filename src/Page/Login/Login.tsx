import React from 'react'
import { cls } from '../../lib/classNames'
import { Footer } from '../../component/App/Footer'
import { IconLogo } from '../../component/Icon/Icon'
import { InputPin } from '../../component/Input'
import { Notification } from '../../component/Notification/Notification'
import { SettingsContext } from '../Settings/SettingsProvider'
import { t } from '../../lib/translation'
import { useNavigate } from 'react-router'
import { useNotification, type Notify } from '../../component/Notification/Notification.hook'
import * as appManager from '../../lib/appManager'
import * as auth from '../../lib/auth'
import * as serde from '../../lib/serde'
import * as storage from '../../lib/storage'
import * as webAuthn from '../../lib/webAuthn'
import './Login.css'

export function Login() {
  const navigate = useNavigate()
  const notify = useNotification()
  const context = React.use(SettingsContext)
  const [chosenAuth, setAuth] = useChosenAuth(context.settings)

  const handleSubmit = async (additionalData: string) => {
    await auth.addSession(additionalData)
    navigate('/cofre/home', { replace: true })
    return
  }

  const choose = (key: keyof ChosenAuthState) => () => setAuth(key)

  React.useEffect(() => {
    (async () => {
      const hasSession = await auth.isSessionValid()

      if (hasSession) {
        navigate('/cofre/home', { replace: true })
        return
      }

      if (context.settings == null) {
        return
      }

      const hasValidSettings = [
        context.settings.enableBiometricAuth,
        context.settings.enablePinAuth,
      ].includes(true)

      if (hasValidSettings === false) {
        navigate('/cofre/get-started', { replace: true })
        return
      }

      await appManager.updateAppVersionIfNeed(context.settings)
    })()
  })

  if (context.settings == null) return null

  return <>
    <main className='Login'>
      <IconLogo />
      <h1>{t('login')}</h1>
      <div className="container">
        <PinAuthLogin
          className='mb-1'
          enabled={chosenAuth.enablePinAuth}
          notify={notify}
          onChoose={choose('enablePinAuth')}
          onlyEnabled={chosenAuth.onlyPinAuth}
          onSubmit={handleSubmit}
        />
        <BiometricAuthLogin
          enabled={chosenAuth.enableBiometricAuth}
          notify={notify}
          onChoose={choose('enableBiometricAuth')}
          onlyEnabled={chosenAuth.onlyBiometricAuth}
          onSubmit={handleSubmit}
          sett={context.settings}
        />
      </div>
    </main>
    <Footer />
    <Notification
      message={notify.message}
      onClose={notify.closeNotification}
      type={notify.type}
    />
  </>
}

type ChosenAuthState = {
  enableBiometricAuth: boolean,
  enablePinAuth: boolean,
}
function useChosenAuth(sett?: storage.ISettings) {
  const [state, setState] = React.useState<ChosenAuthState>({
    enableBiometricAuth: sett?.enableBiometricAuth ?? false,
    enablePinAuth: sett?.enablePinAuth ?? false,
  })

  React.useEffect(() => {
    (async () => {
      const test = await webAuthn.isAuthenticatorAvailable()
      setState(prev => {
        return {
          ...prev,
          enablePinAuth: sett?.enablePinAuth ?? false,
          enableBiometricAuth: test && (sett?.enableBiometricAuth ?? false),
        }
      })
    })()
  }, [sett])

  const data = {
    ...state,
    onlyPinAuth: state.enablePinAuth === true && state.enableBiometricAuth === false,
    onlyBiometricAuth: state.enablePinAuth === false && state.enableBiometricAuth === true,
  }

  const setAuth = (key: keyof ChosenAuthState) => {
    setState(prev => ({
      ...prev,
      enableBiometricAuth: false,
      enablePinAuth: false,
      [key]: true,
    }))
  }

  return [data, setAuth] as const
}

type PinAuthLoginProps = {
  className?: string,
  enabled: boolean,
  notify: Notify,
  onChoose: () => void,
  onlyEnabled: boolean,
  onSubmit: (pin: string) => void,
}
function PinAuthLogin(props: PinAuthLoginProps) {
  const handleSubmit = async (pin: string) => {
    const isValid = await auth.isPinValid(pin)

    if (isValid === false) {
      props.notify.setNotification('error', t('invalid_pin'))
      return
    }

    const pinHash = await auth.createPinHash(pin)
    props.onSubmit(pinHash)
  }

  if (props.enabled === false) return null
  if (props.onlyEnabled === false) return (
    <button type="button" className='gluey' onClick={props.onChoose}>{t('auth_using_pin')}</button>
  )

  return <>
    <p>{t('enter_your')} <abbr title='Personal Identification Number'>PIN</abbr></p>
    <InputPin
      autoFocus
      circularFocus
      className={props.className}
      name='login'
      onSubmit={handleSubmit}
    />
  </>
}

type BiometricAuthLoginProps = {
  className?: string,
  enabled: boolean,
  notify: Notify,
  onChoose: () => void,
  onlyEnabled: boolean,
  onSubmit: (pin: string) => void,
  sett: storage.ISettings,
}
function BiometricAuthLogin(props: BiometricAuthLoginProps) {
  const [state, setState] = React.useState(false)

  const handleAuthentication = async () => {
    try {
      if (props.sett.passKey == null) {
        throw new Error('passkey_not_found')
      }

      await webAuthn.authenticatePassKey(props.sett.passKey)
      const id = serde.serializeBuffer(props.sett.passKey.id)
      props.onSubmit(id)
      return
    } catch (error) {
      const errorMessage = (error as Error).message
      let message = t('authentication_fail')

      if (errorMessage.includes('The operation either timed out or was not allowed')) {
        message = t('operation_not_allowed')
      }

      props.notify.setNotification('error', message)
      console.error('Passkey authentication error:', errorMessage)
    }
  }

  React.useEffect(() => {
    if (state === false && props.onlyEnabled === true) {
      setState(() => true)
      document.querySelector<HTMLButtonElement>('.BiometricAuthButton')?.click()
    }
  }, [state, props.onlyEnabled])

  if (props.enabled === false) return null

  return <>
    <button
      className={cls('BiometricAuthButton', 'gluey', props.className)}
      onClick={handleAuthentication}
      type="button"
    >{t('auth_using_biometric')}</button>
  </>
}