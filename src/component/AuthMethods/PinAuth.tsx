import React from 'react'
import { InputPin, Switch } from '../../component/Input'
import { t } from '../../lib/translation'
import { type Notify } from '../../component/Notification/Notification.hook'
import * as storage from '../../lib/storage'

type PinAuthProps = {
  notify: Notify,
  sett: storage.Settings,
  ud: storage.UserData,
  onChange: (sett: Partial<storage.Settings>, ud: Partial<storage.UserData>) => void,
}

export function PinAuth(props: PinAuthProps) {
  const [state, setState] = React.useState({
    pin: '',
    pinConfirmation: '',
  })

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const elem = event.currentTarget
    const sett: Partial<storage.Settings> = {
      enablePinAuth: elem.name === 'enablePinAuth' && elem.checked,
    }
    props.onChange(sett, props.ud)
  }

  const handlePinChange = async (rawPin: string) => {
    if (state.pinConfirmation === '') {
      setState(prev => ({ ...prev, pin: rawPin }))
      return
    }

    if (rawPin === state.pinConfirmation) {
      // TODO rollback
      // const pin = await auth.createPinHash(rawPin)
      const pin = rawPin as storage.Pin
      const ud: Partial<storage.UserData> = {
        pin,
      }
      props.onChange(props.sett, ud)
      props.notify.setNotification('success', t('pin_saved'))
    } else {
      props.notify.setNotification('error', t('pin_confirmation_error'))
    }

    setState(prev => ({ ...prev, pin: rawPin }))
  }

  const handlePinConfirmation = async (pinConfirmation: string) => {
    if (pinConfirmation === '') {
      setState(prev => ({ ...prev, pinConfirmation }))
      return
    }

    if (pinConfirmation === state.pin) {
      // TODO rollback
      // const pin = await auth.createPinHash(state.pin)
      const pin = state.pin as storage.Pin
      const sett: Partial<storage.Settings> = {
        enablePinAuth: true,
      }
      const ud: Partial<storage.UserData> = {
        pin,
      }
      props.onChange(sett, ud)
      props.notify.setNotification('success', t('pin_saved'))
    } else {
      props.notify.setNotification('error', t('pin_confirmation_error'))
    }

    setState(prev => ({ ...prev, pinConfirmation }))
  }

  const [pinLabel, pinConfirmationLabel] = props.ud.pin
    ? [t('change_your_pin'), t('confirm_your_new_pin')]
    : [t('enter_your_pin'), t('confirm_your_pin')]

  return <div className='box'>
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
    />
    {state.pin != '' && (
      <InputPin
        autoFocus
        className='mt-1'
        label={pinConfirmationLabel}
        name='pinConfirmation'
        onSubmit={handlePinConfirmation}
      />
    )}
  </div>
}
