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

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const elem = event.currentTarget
    const enablePinAuth = elem.name === 'enablePinAuth' && elem.checked
    onSubmit({ ...sett, enablePinAuth })
  }

  const handlePinSubmit = (pin: string) => {
    onSubmit({ ...sett, pin })
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

    {sett.enablePinAuth && (
      <InputPin
        label='Insira seu PIN'
        onSubmit={handlePinSubmit}
        pin={sett.pin}
      />
    )}
  </>
}