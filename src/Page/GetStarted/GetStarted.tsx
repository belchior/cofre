import React from 'react'
import { InputPin, Switch } from '../../component/Input'
import { SettingsContext } from '../Settings/SettingsProvider'
import { useNavigate } from 'react-router'
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
      setState(prev => ({ ...prev, confirmationMessage: 'Não corresponde ao valor do PIN' }))
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

  return <main className='GetStarted'>
    <h1>Selecione um método de autenticação</h1>
    <ul>
      <li>
        <h2>Autenticação via PIN</h2>
        <p>
          Habilitando autenticação por PIN ao iniciar uma sessão será
          solicitado um identificador de 4 dígitos.
        </p>
        <Switch
          name='enablePinAuth'
          checked={state.authMethods.has('enablePinAuth')}
          onChange={handleSwitchChange}
        />
        {state.authMethods.has('enablePinAuth') && <>
          <InputPin
            className='Pin'
            label='Insira seu PIN'
            onSubmit={handlePinChange}
            pin={state.pin}
          />
          {state.pin !== '' && (
            <InputPin
              className='ConfirmationPin'
              label='Confirme seu PIN'
              onSubmit={handleConfirmationPin}
              message={state.confirmationMessage}
            />
          )}
        </>}
      </li>
      <li>
        <h2>Autenticação via Biometria</h2>
        <p>
          Habilitando autenticação por Biometria ao iniciar uma sessão será
          solicitado identificação por digital através do gerenciador de
          biometria do seu dispositivo.
        </p>
        <Switch
          name='enableBiometricAuth'
          checked={state.authMethods.has('enableBiometricAuth')}
          onChange={handleSwitchChange}
        />
        {state.authMethods.has('enableBiometricAuth') && <>
          <p className='webAuthn mb-0'>
            <button type='button' onClick={handleWebAuthnCreation}>criar chave de acesso</button>
          </p>
        </>}
      </li>
    </ul>
    {props.message && <p className='message'>{props.message}</p>}
    <button type='button' className='saveSettings' onClick={props.onSubmit}>salvar</button>
  </main>
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
      setMessage(() => 'Selecione uma forma de autenticação')
      return
    }
    if (sett.enableBiometricAuth && sett.credential == null) {
      setMessage(() => 'É necessário criar uma chave de acesso')
      return
    }
    if (sett.enablePinAuth && (sett.pin == null || sett.pin === '')) {
      setMessage(() => 'É necessário criar um PIN')
      return
    }
    context.saveSettings(sett)
  }

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