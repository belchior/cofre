import React from 'react'
import { InputPin, Switch } from '../../component/Input'
import * as storage from '../../lib/storage'

type PinAuthProps = {
  sett: storage.ISettings
  onChange: (data: Partial<storage.ISettings>) => void
}

export function PinAuth(props: PinAuthProps) {
  const [state, setState] = React.useState({
    pin: '',
    confirmationMessage: '',
  })

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const elem = event.currentTarget
    const enablePinAuth = elem.name === 'enablePinAuth' && elem.checked
    props.onChange({ enablePinAuth })
  }

  const handlePinChange = (pin: string) => {
    setState(prev => ({ ...prev, pin, confirmationMessage: '' }))
  }

  const handlePinConfirmation = (pinConfirmation: string) => {
    if (pinConfirmation !== state.pin) {
      setState(prev => ({ ...prev, confirmationMessage: 'Não corresponde ao valor do PIN' }))
      return
    }
    setState(prev => ({ ...prev, confirmationMessage: '' }))
    props.onChange({ pin: state.pin })
  }

  return <>
    <h3>Autenticação via PIN</h3>
    <p>
      Habilitando autenticação por PIN ao iniciar uma sessão será
      solicitado um identificador de 4 dígitos.
    </p>
    <Switch
      name='enablePinAuth'
      onChange={handleSwitchChange}
      defaultChecked={props.sett.enablePinAuth}
    />

    {props.sett.enablePinAuth && <>
      <InputPin
        className='Pin'
        label='Insira seu PIN'
        onSubmit={handlePinChange}
        pin={props.sett.pin}
      />
      {state.pin != '' && (
        <InputPin
          className='ConfirmationPin'
          label='Confirme seu PIN'
          onSubmit={handlePinConfirmation}
          message={state.confirmationMessage}
        />
      )}
    </>}
  </>
}