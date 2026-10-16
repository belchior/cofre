import { deepFreeze } from './deepFreeze'

// User Data

export type CustomField = {
  name: string,
  index: number,
  value: string,
  type: 'text' | 'password',
}
export type Content = {
  created_at: string,
  custom_fields: CustomField[],
  id: string,
  length: number,
  name: string,
  secret: string,
  starred: boolean,
}
export type Pin = string & {
  _pin: symbol
}
export type UserData = {
  passKey?: PassKey,
  pin?: Pin,
}
export function initialUserData() {
  const ud: UserData = {
    passKey: undefined,
    pin: undefined,
  }
  return deepFreeze(ud)
}

// Settings
export type CredentialDescriptor = {
  id: ArrayBuffer;
  transports: AuthenticatorTransport[];
  type: PublicKeyCredentialType;
}
export type PassKey = CredentialDescriptor & {
  name: string,
  displayName: string,
}
export type AuthOptions = {
  enablePinAuth: boolean,
  enableBiometricAuth: boolean,
}
export type Settings = AuthOptions & {
  enableAutoUpdate: boolean,

}
export type AuthMethods = keyof AuthOptions
export function initialSettings() {
  const initial: Settings = {
    enablePinAuth: false,
    enableBiometricAuth: false,
    enableAutoUpdate: true,
  }
  return deepFreeze(initial)
}

