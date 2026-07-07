import React from 'react'
import { InputPin, Switch } from '../../component/Input'
import { SettingsContext } from '../Settings/SettingsProvider'
import { useNavigate } from 'react-router'
import * as auth from '../../lib/auth'
import * as storage from '../../lib/storage'

import './GetStarted.css'

type ViewProps = {
  onSubmit: (sett: storage.ISettings) => void,
}
function View(props: ViewProps) {
  const [state, setState] = React.useState({
    authMethod: '',
    pin: '',
  })

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const authOptions = ['enablePinAuth', 'enableBiometricAuth']
    const elem = event.currentTarget
    const authName = elem.name
    const isChecked = elem.checked

    setState(prev => {
      if (authOptions.includes(authName) === false) return prev
      if (authName !== state.authMethod && isChecked === true) return { ...prev, authMethod: authName }
      return isChecked
        ? { ...prev, authMethod: authName }
        : { ...prev, authMethod: '' }
    })
  }

  const handlePinSubmit = (pin: string) => {
    setState(prev => ({ ...prev, pin: pin }))
  }

  const handleConfirmationPinSubmit = (confirmationPin: string) => {
    if (confirmationPin == state.pin) {
      props.onSubmit({
        enablePinAuth: true,
        enableBiometricAuth: false,
        pin: state.pin,
      })
    }
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
          checked={state.authMethod === 'enablePinAuth'}
          onChange={handleSwitchChange}
        />
        {state.authMethod === 'enablePinAuth' && <>
          <InputPin
            className='Pin'
            label='Insira seu PIN'
            onSubmit={handlePinSubmit}
            pin={state.pin}
          />
          {state.pin !== '' && (
            <InputPin
              className='ConfirmationPin'
              label='Confirme seu PIN'
              onSubmit={handleConfirmationPinSubmit}
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
          checked={state.authMethod === 'enableBiometricAuth'}
          onChange={handleSwitchChange}
        />
      </li>
    </ul>
  </main>
}

export function GetStarted() {
  const context = React.use(SettingsContext)
  const navigate = useNavigate()

  const handleSubmit = async (sett: storage.ISettings) => {
    context.saveSettings(sett)

    if (sett.enablePinAuth === true && sett.pin != null) {
      await auth.addSession(sett.pin)
    }
  }

  React.useEffect(() => {
    (async () => {
      // If the user has a valid session he should be redirected to settings page
      const hasSession = await auth.isSessionValid()
      if (hasSession) {
        navigate('/cofre/settings', { replace: true })
        return
      }

      // If the user has a valid settings but has no session he should be redirected to the login page
      const hasValidSettings = context.settings?.enableBiometricAuth === true
        || context.settings?.enablePinAuth === true
      if (hasValidSettings) {
        navigate('/cofre/login', { replace: true })
        return
      }
    })()
  })

  return <View onSubmit={handleSubmit} />
}