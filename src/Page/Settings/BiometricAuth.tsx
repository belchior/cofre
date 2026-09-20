import React from 'react'
import { Switch } from '../../component/Input'
import { t } from '../../lib/translation'
import * as storage from '../../lib/storage'
import * as webAuthn from '../../lib/webauthn'

type BiometricAuthProps = {
  sett: storage.ISettings
  onChange: (data: Partial<storage.ISettings>) => void
}

export function BiometricAuth(props: BiometricAuthProps) {
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const elem = event.currentTarget

    if (elem.name !== 'enableBiometricAuth') return

    const enableBiometricAuth = elem.checked
    props.onChange({ enableBiometricAuth })
  }

  const handleWebAuthnCreation = async () => {
    const credential = await webAuthn.createCredential()
    const sett: Partial<storage.ISettings> = {
      enableBiometricAuth: true,
      credential: webAuthn.credentialDescritor(credential),
    }

    props.onChange(sett)
  }

  const handleWebAuthnExclusion = () => {
    const sett: Partial<storage.ISettings> = {
      enableBiometricAuth: false,
      credential: undefined,
    }
    props.onChange(sett)
  }

  return <>
    <Switch
      title={t('auth_by_biometric')}
      description={t('auth_by_biometric_desc')}
      name='enableBiometricAuth'
      onChange={handleSwitchChange}
      checked={props.sett.enableBiometricAuth}
    />
    {props.sett.enableBiometricAuth && <p className='webAuthn mb-0'>
      {props.sett.credential == null
        ? <button type='button' onClick={handleWebAuthnCreation}>{t('create_access_key')}</button>
        : <button type='button' onClick={handleWebAuthnExclusion}>{t('delete_access_key')}</button>
      }
    </p>
    }
  </>
}