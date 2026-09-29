import React from 'react'
import { aboutBrowser } from '../../lib/aboutBrowser'
import { Input, Switch } from '../../component/Input'
import { t } from '../../lib/translation'
import * as storage from '../../lib/storage'
import * as webAuthn from '../../lib/webAuthn'

type CredentialFormProps = {
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

  return <>
    <form onSubmit={handleSubmit}>
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

      <button type='submit'>{t('create_passkey')}</button>
    </form>
  </>
}

type CredentialViewProps = {
  passKey: storage.PassKey,
  onDelete: () => void
}
function CredentialView(props: CredentialViewProps) {
  return <>
    <fieldset className='mb-1'>
      <legend>{t('passkey')}</legend>
      <p className='small'>{t('name')}</p>
      <p className='mb-1'>{props.passKey.name}</p>
      <p className='small'>{t('display_name')}</p>
      <p className='mb-0'>{props.passKey.displayName}</p>
    </fieldset>
    <button type='button' onClick={props.onDelete}>{t('delete_passkey')}</button>
  </>
}

type BiometricAuthProps = {
  sett: storage.ISettings,
  onChange: (data: Partial<storage.ISettings>) => void,
}
export function BiometricAuth(props: BiometricAuthProps) {
  const handleChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const elem = event.currentTarget

    if (elem.name !== 'enableBiometricAuth') return

    const sett: Partial<storage.ISettings> = {
      enableBiometricAuth: elem.checked,
    }
    props.onChange(sett)
  }

  const handleSubmit = async (user: webAuthn.User) => {
    const credential = await webAuthn.createCredential(user)
    const passKey = {
      ...webAuthn.credentialDescritor(credential),
      ...user,
    }
    const sett: Partial<storage.ISettings> = {
      enableBiometricAuth: true,
      passKey,
    }
    props.onChange(sett)
  }

  // TODO the use case of recreating a passKey needs more refinament.
  // Maybe it's a bad idea to remove the passKey only in the app
  // because there is no way to remove a passKey from the user authenticator
  // this can cause duplication of passkeys at user authenticator
  const handlePasskeyExclusion = () => {
    const sett: Partial<storage.ISettings> = {
      passKey: undefined,
    }
    props.onChange(sett)
  }

  return <>
    <Switch
      className='mb-1'
      checked={props.sett.enableBiometricAuth}
      description={t('auth_by_biometric_desc')}
      name='enableBiometricAuth'
      onChange={handleChangeSwitch}
      title={t('auth_by_biometric')}
    />

    {props.sett.enableBiometricAuth && props.sett.passKey == null && <>
      <CredentialForm onSubmit={handleSubmit} />
    </>}
    {props.sett.enableBiometricAuth && props.sett.passKey != null && <>
      <CredentialView passKey={props.sett.passKey} onDelete={handlePasskeyExclusion} />
    </>}
  </>
}