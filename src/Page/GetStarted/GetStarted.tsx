import React from 'react'
import { useNavigate } from 'react-router'
import { Footer } from '../../component/App/Footer'
import { InputPin, Switch } from '../../component/Input'
import { Logo } from '../../component/Logo/Logo'
import { SettingsContext } from '../Settings/SettingsProvider'
import { t } from '../../lib/translation'
import * as auth from '../../lib/auth'
import * as storage from '../../lib/storage'
import * as webAuthn from '../../lib/webauthn'
import './GetStarted.css'

type ViewProps = {
  message?: React.ReactNode,
  onChange: (sett: Partial<storage.ISettings>) => void,
  onSubmit: () => void,
}
function View(props: ViewProps) {
  const [state, setState] = React.useState<{
    authMethods: Set<string>,
    confirmationMessage: string,
    credential?: storage.CredentialDescriptor,
    pin: string,
    isPinConfirmed: boolean,
  }>({
    authMethods: new Set(),
    confirmationMessage: '',
    credential: undefined,
    pin: '',
    isPinConfirmed: false,
  })

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const authOptions = ['enablePinAuth', 'enableBiometricAuth']
    const elem = event.currentTarget
    const authName = elem.name
    const isChecked = elem.checked

    if (authOptions.includes(authName) === false) return

    setState(prev => {
      if (isChecked) {
        prev.authMethods.add(authName)
      } else {
        prev.authMethods.delete(authName)
      }
      return { ...prev, authMethods: new Set(prev.authMethods) }
    })

    props.onChange({
      [authName]: isChecked,
    })
  }

  const handlePinChange = (pin: string) => {
    setState(prev => ({ ...prev, pin: pin }))
  }

  const handleConfirmationPin = (confirmationPin: string) => {
    if (confirmationPin !== state.pin) {
      setState(prev => ({ ...prev, confirmationMessage: t('pin_confirmation_error') }))
      return
    }

    const sett: Partial<storage.ISettings> = {
      enablePinAuth: true,
      pin: state.pin,
    }
    props.onChange(sett)
  }

  const handleWebAuthnCreation = async () => {
    const credential = await webAuthn.createCredential()
    const sett: Partial<storage.ISettings> = {
      enableBiometricAuth: true,
      credential: webAuthn.credentialDescritor(credential),
    }

    props.onChange(sett)
  }

  return <>
    <main className='GetStarted'>
      <Logo />
      <h1>{t('choose_auth_method')}</h1>
      <ul>
        <li className='gluey'>
          <Switch
            title={t('auth_by_pin')}
            description={t('auth_by_pin_desc')}
            name='enablePinAuth'
            checked={state.authMethods.has('enablePinAuth')}
            onChange={handleSwitchChange}
          />
          {state.authMethods.has('enablePinAuth') && <>
            <InputPin
              className='Pin'
              label={t('enter_your_pin')}
              onSubmit={handlePinChange}
              pin={state.pin}
            />
            {state.pin !== '' && (
              <InputPin
                className='ConfirmationPin'
                label={t('confirm_your_pin')}
                onSubmit={handleConfirmationPin}
                message={state.confirmationMessage}
              />
            )}
          </>}
        </li>
        <li className='gluey'>
          <Switch
            title={t('auth_by_biometric')}
            description={t('auth_by_biometric_desc')}
            name='enableBiometricAuth'
            checked={state.authMethods.has('enableBiometricAuth')}
            onChange={handleSwitchChange}
          />
          {state.authMethods.has('enableBiometricAuth') && <>
            <p className='webAuthn mb-0'>
              <button type='button' onClick={handleWebAuthnCreation}>{t('create_access_key')}</button>
            </p>
          </>}
        </li>
      </ul>
      {props.message && <p className='message'>{props.message}</p>}
      <button type='button' className='saveSettings' onClick={props.onSubmit}>{t('save')}</button>
    </main>
    <Footer />
  </>
}

export function GetStarted() {
  const context = React.use(SettingsContext)
  const navigate = useNavigate()
  const [sett, setSettings] = React.useState(context.settings)
  const [message, setMessage] = React.useState<string>()

  const handleChange = async (partialSett: Partial<storage.ISettings>) => {
    setSettings(prevSett => {
      return { ...prevSett, ...partialSett } as storage.ISettings
    })
  }

  const handleSubmit = () => {
    const selectedAuthMethod = [sett?.enableBiometricAuth, sett?.enablePinAuth].includes(true)
    if (sett == null || selectedAuthMethod === false) {
      setMessage(() => t('choose_auth_method'))
      return
    }
    if (sett.enableBiometricAuth && sett.credential == null) {
      setMessage(() => t('access_key_is_required'))
      return
    }
    if (sett.enablePinAuth && (sett.pin == null || sett.pin === '')) {
      setMessage(() => t('pin_is_required'))
      return
    }
    context.saveSettings(sett)
  }

  React.useEffect(() => {
    setSettings(prev => {
      if (context.settings == null) return prev
      return {
        ...context.settings,
        ...prev,
      } as storage.ISettings
    })
  }, [context.settings, setSettings])

  React.useEffect(() => {
    (async () => {
      // If the user has a valid settings and session he should be redirected to home page
      const hasSession = await auth.isSessionValid()

      if (hasSession) {
        navigate('/cofre', { replace: true })
        return
      }

      // If the user has a valid settings but has no session he should be redirected to the login page
      const hasValidSettings = [
        context.settings?.enableBiometricAuth,
        context.settings?.enablePinAuth,
      ].includes(true)
      if (hasValidSettings) {
        navigate('/cofre/login', { replace: true })
        return
      }
    })()
  })

  return <View onChange={handleChange} onSubmit={handleSubmit} message={message} />
}