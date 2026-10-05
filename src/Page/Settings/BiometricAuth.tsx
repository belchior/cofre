import React from 'react'
import { aboutBrowser } from '../../lib/aboutBrowser'
import { Input, Switch } from '../../component/Input'
import { Modal } from '../../component/Modal/Modal'
import { t } from '../../lib/translation'
import { useModal } from '../../component/Modal/Modal.hook'
import * as storage from '../../lib/storage'
import * as webAuthn from '../../lib/webAuthn'
import type { Notify } from '../../component/Notification/Notification.hook'

type CredentialFormProps = {
  onCancel: () => void,
  onSubmit: (data: webAuthn.User) => void,
}
function CredentialForm(props: CredentialFormProps) {
  const browser = aboutBrowser()
  const defaultUser = {
    name: `app_cofre_${browser.name}_${browser.device}`.toLowerCase(),
    displayName: `${t('app_cofre_at')} ${browser.name}`,
  }
  const [user, setUser] = React.useState<webAuthn.User>(defaultUser)

  const handleChangeUser = (key: keyof webAuthn.User) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser(prev => {
      return { ...prev, [key]: event.target.value } as webAuthn.User
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    props.onSubmit(user)
  }

  return (
    <form className='CredentialForm' onSubmit={handleSubmit}>
      <h2>{t('new_passkey')}</h2>
      <Input
        className='mb-1'
        placeholder={user.name}
        description={t('passkey_name_desc')}
        id='passKeyName'
        label={`${t('name')} (${t('optional')})`}
        name='name'
        onChange={handleChangeUser('name')}
      />
      <Input
        className='mb-1'
        placeholder={user.displayName}
        description={`${t('display_name_desc')}`}
        id='passKeyDisplayName'
        label={`${t('display_name')} (${t('optional')})`}
        name='displayName'
        onChange={handleChangeUser('displayName')}
      />
      <div className='actionGroup'>
        <button type='button' onClick={props.onCancel}>{t('cancel')}</button>
        <button type='submit'>{t('create_passkey')}</button>
      </div>
    </form>
  )
}

type BiometricAuthProps = {
  notify: Notify,
  sett: storage.ISettings,
  onChange: (data: Partial<storage.ISettings>) => void,
}
export function BiometricAuth(props: BiometricAuthProps) {
  const { isOpen, openModal, closeModal } = useModal()

  const handleChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const elem = event.currentTarget
    if (elem.name !== 'enableBiometricAuth') return
    const sett: Partial<storage.ISettings> = {
      enableBiometricAuth: elem.checked,
    }
    props.onChange(sett)
  }

  const handleSubmit = async (user: webAuthn.User) => {
    const passKey = await webAuthn.createPassKey(user)
    const sett: Partial<storage.ISettings> = {
      enableBiometricAuth: true,
      passKey,
    }
    props.onChange(sett)
    closeModal()
    props.notify.setNotification('success', t('passkey_created'))
  }

  return <>
    <Switch
      checked={props.sett.enableBiometricAuth}
      description={t('auth_by_biometric_desc')}
      name='enableBiometricAuth'
      onChange={handleChangeSwitch}
      title={t('auth_by_biometric')}
    />
    {props.sett.passKey != null && (
      <fieldset className='mt-1'>
        <legend>{t('passkey')}</legend>
        <p className='small'>{t('name')}</p>
        <p className='mb-1'>{props.sett.passKey?.name}</p>
        <p className='small'>{t('display_name')}</p>
        <p className='mb-0'>{props.sett.passKey?.displayName}</p>
      </fieldset>
    )}
    <button type='button' className='mt-1' onClick={openModal}>{t('create_new_passkey')}</button>
    <Modal open={isOpen} onClose={closeModal}>
      <CredentialForm onCancel={closeModal} onSubmit={handleSubmit} />
    </Modal>
  </>
}