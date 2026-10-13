import React from 'react'
import { useNavigate } from 'react-router'
import { cls } from '../../lib/classNames'
import { Footer } from '../../component/App/Footer'
import { IconLogo } from '../../component/Icon/Icon'
import { InputPin } from '../../component/Input'
import { Notification } from '../../component/Notification/Notification'
import { t } from '../../lib/translation'
import { useNotification, type Notify } from '../../component/Notification/Notification.hook'
import * as appManager from '../../lib/appManager'
import * as auth from '../../lib/auth'
import * as cryptoKey from '../../lib/cryptoKey'
import * as storage from '../../lib/storage'
import * as webAuthn from '../../lib/webAuthn'
import './Login.css'

export function Login() {
  const navigate = useNavigate()
  const notify = useNotification()
  const [sett, setSettings] = React.useState<storage.Settings>()
  const [chosenAuth, setAuth] = useChosenAuth(sett)

  const handleSubmit = async () => {
    try {
      await auth.addSession()
      navigate('/cofre/home', { replace: false })
      return
    } catch (error) {
      console.error('Authentication error:', (error as Error).message)
      notify.setNotification('error', (error as Error).message)
    }
  }

  const choose = (key: keyof ChosenAuthState) => () => setAuth(key)

  // Load Settings
  React.useEffect(() => {
    (async () => {
      if (sett != null) return
      const newSett = await storage.loadSettings()
      setSettings(() => newSett)
    })()
  }, [sett, setSettings])

  React.useEffect(() => {
    (async () => {
      const hasSession = await auth.isSessionValid()

      if (hasSession) {
        navigate('/cofre/home', { replace: false })
        return
      }

      if (storage.hasSettings() === false) {
        navigate('/cofre/get-started', { replace: false })
        return
      }

      if (sett == null) {
        return
      }

      const hasValidSettings = [sett.enableBiometricAuth, sett.enablePinAuth].includes(true)

      if (hasValidSettings === false) {
        navigate('/cofre/get-started', { replace: false })
        return
      }

      await appManager.updateAppVersionIfNeed(sett)
    })()
  })

  if (sett == null || chosenAuth.isLoading === true) return null

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
          sett={sett}
        />
        <BiometricAuthLogin
          enabled={chosenAuth.enableBiometricAuth}
          notify={notify}
          onChoose={choose('enableBiometricAuth')}
          onlyEnabled={chosenAuth.onlyBiometricAuth}
          onSubmit={handleSubmit}
          sett={sett}
        />
      </div>
      {chosenAuth.notAvailable && <>
        <h3>{t('auth_method_not_available')}</h3>
        <p>{t('auth_method_not_available_desc')}</p>
      </>}
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
  isLoading: boolean,
}
function useChosenAuth(sett?: storage.Settings) {
  const [state, setState] = React.useState<ChosenAuthState>({
    enableBiometricAuth: false,
    enablePinAuth: sett?.enablePinAuth ?? false,
    isLoading: true,
  })

  const setAuth = React.useCallback((key: keyof ChosenAuthState) => {
    setState(prev => ({
      ...prev,
      enableBiometricAuth: false,
      enablePinAuth: false,
      [key]: true,
    }))
  }, [])

  React.useEffect(() => {
    (async () => {
      if (sett == null) return
      const isAvailable = await webAuthn.isAuthenticatorAvailable()
      setState(prev => {
        return {
          ...prev,
          isLoading: false,
          enablePinAuth: sett.enablePinAuth,
          enableBiometricAuth: isAvailable && sett.enableBiometricAuth,
        }
      })
    })()
  }, [sett])

  const data = {
    ...state,
    onlyPinAuth: state.enablePinAuth === true && state.enableBiometricAuth === false,
    onlyBiometricAuth: state.enablePinAuth === false && state.enableBiometricAuth === true,
    notAvailable: [state.enableBiometricAuth, state.enablePinAuth].includes(true) === false,
  }

  return [data, setAuth] as const
}

type PinAuthLoginProps = {
  className?: string,
  enabled: boolean,
  notify: Notify,
  onChoose: () => void,
  onlyEnabled: boolean,
  onSubmit: () => void,
  sett: storage.Settings,
}
function PinAuthLogin(props: PinAuthLoginProps) {
  const handleSubmit = async (rawPin: string) => {
    try {
      const pin = await auth.createPinHash(rawPin)
      await cryptoKey.overrideUsingPinAuth(props.sett, pin)

      const isValid = await auth.isPinValid(pin)

      if (isValid === false) {
        props.notify.setNotification('error', t('invalid_pin'))
        return
      }

      props.onSubmit()
    } catch (error) {
      props.notify.setNotification('error', t('invalid_pin'))
      console.error(error)
      return
    }
  }

  if (props.enabled === false) return null
  if (props.onlyEnabled === false) return (
    <button type="button" onClick={props.onChoose}>{t('auth_using_pin')}</button>
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
  onSubmit: () => void,
  sett: storage.Settings,
}
function BiometricAuthLogin(props: BiometricAuthLoginProps) {
  const [state, setState] = React.useState(false)

  const handleAuthentication = async () => {
    try {
      if (props.sett.passKey == null) {
        throw new Error('passkey_not_found')
      }

      await webAuthn.authenticatePassKey(props.sett.passKey)
      await cryptoKey.overrideUsingBiometricAuth(props.sett)

      props.onSubmit()
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
      className={cls('BiometricAuthButton', props.className)}
      onClick={handleAuthentication}
      type="button"
    >{t('auth_using_biometric')}</button>
  </>
}