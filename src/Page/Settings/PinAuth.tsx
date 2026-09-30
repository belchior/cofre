import React from 'react'
import { InputPin, Switch } from '../../component/Input'
import { t } from '../../lib/translation'
import * as auth from '../../lib/auth'
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

  const handlePinConfirmation = async (pinConfirmation: string) => {
    if (pinConfirmation !== state.pin) {
      setState(prev => ({ ...prev, confirmationMessage: t('pin_confirmation_error') }))
      return
    }
    setState(prev => ({ ...prev, confirmationMessage: '' }))
    const pinHash = await auth.createPinHash(state.pin)
    props.onChange({ pin: pinHash })
  }

  return <>
    <Switch
      className='mb-1'
      defaultChecked={props.sett.enablePinAuth}
      description={t('auth_by_pin_desc')}
      name='enablePinAuth'
      onChange={handleSwitchChange}
      title={t('auth_by_pin')}
    />

    {props.sett.enablePinAuth && <>
      <InputPin
        label={t('enter_your_pin')}
        onSubmit={handlePinChange}
        pin={props.sett.pin}
        tabIndex={0}
      />
      {state.pin != '' && (
        <InputPin
          className='mt-1'
          label={t('confirm_your_pin')}
          message={state.confirmationMessage}
          onSubmit={handlePinConfirmation}
        />
      )}
    </>}
  </>
}