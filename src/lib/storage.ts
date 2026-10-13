import { deepFreeze } from './deepFreeze'
import { t } from './translation'
import * as crypto from './crypto'
import * as serde from './serde'
import * as cryptoKey from './cryptoKey'

// User Data

export type CustomField = {
  name: string,
  index: number,
  value: string,
  type: 'text' | 'password',
}
export type Content = {
  createdAt: string,
  customFields: CustomField[]
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
  contents: Content[],
  pin?: Pin,
}
export function initialUserData() {
  const ud: UserData = {
    contents: [],
    pin: undefined,
  }
  return deepFreeze(ud)
}
export async function loadContents(ck: cryptoKey.CryptoKey) {
  const ud = await loadUserData(ck)
  return deepFreeze(ud.contents)
}
export async function loadPin(ck: cryptoKey.CryptoKey) {
  return (await loadUserData(ck)).pin
}
export async function loadUserData(ck: cryptoKey.CryptoKey) {
  const cipherText = window.localStorage.getItem('ud')
  if (cipherText == null) throw new Error('user_data_not_found')
  const keyiv = await loadKeyIv()
  const text = await crypto.decrypt(keyiv, cipherText, ck)
  const data = JSON.parse(text)
  return deepFreeze<UserData>(data)
}
export async function saveContents(ck: cryptoKey.CryptoKey, contents: Content[]) {
  const ud = structuredClone(await loadUserData(ck)) as UserData
  ud.contents = contents
  await saveUserData(ck, ud)
}
export async function savePin(ck: cryptoKey.CryptoKey, pin: Pin) {
  const ud = await loadUserData(ck)
  const newUd: UserData = structuredClone(ud)
  newUd.pin = pin
  await saveUserData(ck, newUd)
}
export async function saveUserData(ck: cryptoKey.CryptoKey, ud: UserData) {
  const text = JSON.stringify(ud)
  const keyiv = await loadKeyIv()
  const cipherText = await crypto.encrypt(keyiv, text, ck)
  window.localStorage.setItem('ud', cipherText)
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
  passKey?: PassKey,
}
export type AuthMethods = keyof AuthOptions
export function hasSettings() {
  return window.localStorage.getItem('sett') != null
}
export function initialSettings() {
  const initial: Settings = {
    enablePinAuth: false,
    enableBiometricAuth: false,
    enableAutoUpdate: true,
    passKey: undefined,
  }
  return deepFreeze(initial)
}
export function isSettingsValid(sett: Partial<Settings>): [boolean, string] {
  const selectedAuthMethod = [sett?.enableBiometricAuth, sett?.enablePinAuth].includes(true)

  if (selectedAuthMethod === false) return [false, t('must_choose_auth_method')]

  return [true, 'settings valid']
}
export async function loadSettings() {
  const cipherText = window.localStorage.getItem('sett')
  if (cipherText == null) throw new Error('settings_not_found')
  const keyiv = await loadKeyIv()
  const text = await crypto.decrypt(keyiv, cipherText)
  const data = JSON.parse(text)

  if (data.passKey) {
    data.passKey.id = serde.deserializeBuffer(data.passKey.id)
  }

  return deepFreeze<Settings>(data)
}
export async function saveSettings(sett: Settings) {
  let text
  if (sett.passKey) {
    text = JSON.stringify({
      ...sett,
      passKey: {
        ...sett.passKey,
        id: serde.serializeBuffer(sett.passKey.id),
      },
    })
  } else {
    text = JSON.stringify(sett)
  }
  const keyiv = await loadKeyIv()
  const cipherText = await crypto.encrypt(keyiv, text)
  window.localStorage.setItem('sett', cipherText)
}

// KeyIV
export async function loadKeyIv() {
  const text = window.localStorage.getItem('keyiv')

  if (text == null) {
    const keyiv = await crypto.init()
    await saveKeyIv(keyiv)
    return keyiv
  }

  return crypto.deserializeKeyIv(text)
}
export async function saveKeyIv(keyiv: crypto.KeyIv) {
  const text = await crypto.serializeKeyIv(keyiv)
  return window.localStorage.setItem('keyiv', text)
}

// Session
export function incrementSessionCounter(): number {
  const sc = window.localStorage.getItem('sc')
  const value = sc == null ? 1 : Number(sc) + 1
  window.localStorage.setItem('sc', String(value))
  return value
}
export function loadSession() {
  return window.sessionStorage.getItem('session')
}
export function loadSessionCounter() {
  return Number(window.localStorage.getItem('sc'))
}
export function removeSession() {
  return window.sessionStorage.removeItem('session')
}
export function saveSession(session: string) {
  return window.sessionStorage.setItem('session', session)
}

// App Version
export type AppVersions = {
  lastVersion: string,
  version: string,
}
export function loadVersions(): AppVersions {
  const lastVersion = document.querySelector<HTMLMetaElement>('meta[name="last-version"]')!.content
  const version = window.localStorage.getItem('version')!

  return {
    lastVersion,
    version,
  }
}
export function saveVersion(versions: AppVersions): AppVersions {
  window.localStorage.setItem('version', versions.lastVersion)!

  return {
    lastVersion: versions.lastVersion,
    version: versions.lastVersion,
  }
}