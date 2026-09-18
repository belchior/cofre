import React from 'react'
import { InputPin, Switch } from '../../component/Input'
import { t } from '../../lib/translation'
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
      setState(prev => ({ ...prev, confirmationMessage: t('pin_confirmation_error') }))
      return
    }
    setState(prev => ({ ...prev, confirmationMessage: '' }))
    props.onChange({ pin: state.pin })
  }

  return <>
    <h3>{t('auth_by_pin')}</h3>
    <p>{t('auth_by_pin_desc')}</p>
    <Switch
      name='enablePinAuth'
      onChange={handleSwitchChange}
      defaultChecked={props.sett.enablePinAuth}
    />

    {props.sett.enablePinAuth && <>
      <InputPin
        tabIndex={0}
        className='Pin'
        label={t('enter_your_pin')}
        onSubmit={handlePinChange}
        pin={props.sett.pin}
      />
      {state.pin != '' && (
        <InputPin
          className='ConfirmationPin'
          label={t('confirm_your_pin')}
          onSubmit={handlePinConfirmation}
          message={state.confirmationMessage}
        />
      )}
    </>}
  </>
}