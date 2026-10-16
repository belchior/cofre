import React from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useNavigate } from 'react-router'
import { cls } from '../../lib/classNames'
import { Footer } from '../../component/App/Footer'
import { IconLogo } from '../../component/Icon/Icon'
import { InputPin } from '../../component/Input'
import { Notification } from '../../component/Notification/Notification'
import { t } from '../../lib/translation'
import { useNotification, type Notify } from '../../component/Notification/Notification.hook'
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
      navigate('/cofre/home', { replace: false })
      return
    } catch (error) {
      console.error('Authentication error:', error)
      notify.setNotification('error', error as string)
    }
  }

  const choose = (key: keyof ChosenAuthState) => () => setAuth(key)

  // Load Settings
  React.useEffect(() => {
    (async () => {
      if (sett != null) return
      // TODO move the load to frontend storage file
      const text = await invoke<string>('load_settings')
      const newSett = JSON.parse(text) as storage.Settings
      setSettings(() => newSett)
    })()
  }, [sett, setSettings])

  React.useEffect(() => {
    (async () => {
      try {
        if (await invoke<boolean>('has_settings') === false) {
          navigate('/cofre/get-started', { replace: false })
          return
        }
      } catch (error) {
        console.error(error)
        navigate('/cofre/get-started', { replace: false })
      }

      if (await invoke<boolean>('is_session_valid') === true) {
        navigate('/cofre/home', { replace: false })
        return
      }
    })()
  })

  if (chosenAuth.isLoading === true) return null

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
}
function PinAuthLogin(props: PinAuthLoginProps) {
  const handleSubmit = async (rawPin: string) => {
    try {
      await invoke<boolean>('auth_pin_login', { rawPin })
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
  ud: storage.UserData,
}
function BiometricAuthLogin(props: BiometricAuthLoginProps) {
  const [state, setState] = React.useState(false)

  const handleAuthentication = async () => {
    try {
      if (props.ud.passKey == null) {
        throw new Error('passkey_not_found')
      }

      await webAuthn.authenticatePassKey(props.ud.passKey)

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
