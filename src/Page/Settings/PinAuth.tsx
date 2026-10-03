import React from 'react'
import { InputPin, Switch } from '../../component/Input'
import { t } from '../../lib/translation'
import { type Notify } from '../../component/Notification/Notification.hook'
import * as auth from '../../lib/auth'
import * as storage from '../../lib/storage'

type PinAuthProps = {
  notify: Notify,
  sett: storage.ISettings,
  onChange: (data: Partial<storage.ISettings>) => void,
}

export function PinAuth(props: PinAuthProps) {
  const { notify } = props

  const [state, setState] = React.useState({
    pin: '',
    pinConfirmation: '',
  })

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const elem = event.currentTarget
    const enablePinAuth = elem.name === 'enablePinAuth' && elem.checked
    props.onChange({ enablePinAuth })
  }

  const handlePinChange = async (pin: string) => {
    if (state.pinConfirmation !== '' && state.pinConfirmation !== pin) {
      notify.setNotification('error', t('pin_confirmation_error'))
    }

    if (state.pinConfirmation !== '' && state.pinConfirmation === pin) {
      notify.setNotification('success', t('pin_saved'))

      const pinHash = await auth.createPinHash(state.pin)
      props.onChange({ pin: pinHash })
    }

    setState(prev => ({ ...prev, pin }))
  }

  const handlePinConfirmation = async (pinConfirmation: string) => {
    if (pinConfirmation !== '' && pinConfirmation !== state.pin) {
      notify.setNotification('error', t('pin_confirmation_error'))
    }

    if (pinConfirmation !== '' && pinConfirmation === state.pin) {
      notify.setNotification('success', t('pin_saved'))

      const pinHash = await auth.createPinHash(state.pin)
      const sett: Partial<storage.ISettings> = {
        enablePinAuth: true,
        pin: pinHash,
      }
      props.onChange(sett)
    }

    setState(prev => ({ ...prev, pinConfirmation }))
  }

  const [pinLabel, pinConfirmationLabel] = props.sett.pin
    ? [t('change_your_pin'), t('confirm_your_new_pin')]
    : [t('enter_your_pin'), t('confirm_your_pin')]

  return <>
    <Switch
      checked={props.sett.enablePinAuth}
      description={t('auth_by_pin_desc')}
      name='enablePinAuth'
      onChange={handleSwitchChange}
      title={t('auth_by_pin')}
    />

    <InputPin
      className='mt-1'
      label={pinLabel}
      name='pin'
      onSubmit={handlePinChange}
      tabIndex={0}
    />
    {state.pin != '' && (
      <InputPin
        className='mt-1'
        label={pinConfirmationLabel}
        name='pinConfirmation'
        onSubmit={handlePinConfirmation}
      />
    )}
  </>
}