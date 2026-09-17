import React from 'react'
import { Switch } from '../../component/Input'
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
    <h3>Autenticação via Biometria</h3>
    <p>
      Habilitando autenticação por Biometria ao iniciar uma sessão será
      solicitado identificação por digital através do gerenciador de
      biometria do seu dispositivo.
    </p>
    <Switch
      name='enableBiometricAuth'
      onChange={handleSwitchChange}
      checked={props.sett.enableBiometricAuth}
    />
    {props.sett.enableBiometricAuth && <p className='webAuthn mb-0'>
      {props.sett.credential == null
        ? <button type='button' onClick={handleWebAuthnCreation}>criar chave de acesso</button>
        : <button type='button' onClick={handleWebAuthnExclusion}>excluir chave de acesso</button>
      }
    </p>
    }
  </>
}