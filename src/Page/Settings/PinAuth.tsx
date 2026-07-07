import React from 'react'
import { InputPin, Switch } from '../../component/Input'
import * as storage from '../../lib/storage'

export type PinAuthData = {
  enablePinAuth: boolean,
  pin?: string,
}
type PinAuthProps = {
  sett: storage.ISettings
  onSubmit: (data: PinAuthData) => void
}

export function PinAuth(props: PinAuthProps) {
  const { onSubmit, sett } = props
  const [state, setState] = React.useState({
    pin: '',
    confirmationMessage: '',
  })

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const elem = event.currentTarget
    const enablePinAuth = elem.name === 'enablePinAuth' && elem.checked
    onSubmit({ ...sett, enablePinAuth })
  }

  const handlePinSubmit = (pin: string) => {
    setState(prev => ({ ...prev, pin, confirmationMessage: '' }))
  }

  const handleConfirmationPinSubmit = (confirmationPin: string) => {
    if (confirmationPin == state.pin) {
      setState(prev => ({ ...prev, confirmationMessage: '' }))
      onSubmit({ ...sett, pin: state.pin })
      return
    }

    setState(prev => ({ ...prev, confirmationMessage: 'Não corresponde ao valor do PIN' }))
  }

  return <>
    <h3>Autenticação via PIN</h3>
    <p>
      Habilitando autenticação via PIN ao iniciar uma sessão será
      solicitado um identificador de 4 dígitos.
    </p>
    <Switch
      name='enablePinAuth'
      onChange={handleSwitchChange}
      defaultChecked={sett.enablePinAuth}
    />

    {sett.enablePinAuth && <>
      <InputPin
        className='Pin'
        label='Insira seu PIN'
        onSubmit={handlePinSubmit}
        pin={sett.pin}
      />
      {state.pin != '' && (
        <InputPin
          className='ConfirmationPin'
          label='Confirme seu PIN'
          onSubmit={handleConfirmationPinSubmit}
          message={state.confirmationMessage}
        />
      )}
    </>}
  </>
}