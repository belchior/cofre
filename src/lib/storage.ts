import { deepFreeze } from './deepFreeze'
import * as crypto from './crypto'
import * as serde from './serde'

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

export type CredentialDescriptor = {
  id: ArrayBuffer;
  transports?: AuthenticatorTransport[];
  type: PublicKeyCredentialType;
}
export type ISettings = Readonly<{
  enablePinAuth: boolean,
  enableBiometricAuth: boolean,
  enableAutoUpdate: boolean,
  pin?: string,
  credential?: CredentialDescriptor,
}>

type Collection<T extends { id: string }> = Map<T['id'], T>

type Store = {
  'contents': Collection<Content>,
  'keyiv': string,
  'settings': ISettings,
}

type StoreKey = keyof Store
type StoreInnerValue<K extends keyof Store> = Store[K] extends Collection<infer V> ? V : never

function getCollection<K extends StoreKey>(key: K): Collection<StoreInnerValue<K>> {
  return new Map(JSON.parse(localStorage.getItem(key) ?? '[]'))
}

function setCollection<K extends StoreKey>(key: K, coll: Collection<StoreInnerValue<K>>) {
  localStorage.setItem(key, JSON.stringify([...coll]))
}

function listToMap(contents: Content[]) {
  return new Map(contents.map((item) => [item.id, item]))
}

export function isNameBeenUsed(name: Content['name']) {
  const content = loadContent().find(item => item.name.toLowerCase() === name.toLowerCase())
  return Boolean(content)
}

export function loadContent() {
  const data = getCollection('contents')
  return deepFreeze([...data.values()])
}
export function saveContents(contents: Content[]) {
  setCollection('contents', listToMap(contents))
}

export async function loadKeyIv() {
  const text = localStorage.getItem('keyiv')

  if (text == null) {
    const keyiv = await crypto.init()
    await saveKeyIv(keyiv)
    return keyiv
  }

  return crypto.deserializeKeyIv(text)
}
export async function saveKeyIv(keyiv: crypto.KeyIv) {
  const text = await crypto.serializeKeyIv(keyiv)
  return localStorage.setItem('keyiv', text)
}

export function loadSession() {
  return sessionStorage.getItem('session')
}
export function removeSession() {
  return sessionStorage.removeItem('session')
}
export function saveSession(session: string) {
  return sessionStorage.setItem('session', session)
}

export async function loadSettings(): Promise<ISettings> {
  const cipherText = localStorage.getItem('settings')

  if (cipherText == null) {
    const defaultSett: ISettings = {
      enablePinAuth: false,
      enableBiometricAuth: false,
      enableAutoUpdate: true,
      pin: undefined,
      credential: undefined,
    }
    await saveSettings(defaultSett)
    return defaultSett
  }

  const keyiv = await loadKeyIv()
  const text = await crypto.decrypt(keyiv, cipherText)
  const sett = JSON.parse(text)
  if (sett.credential) {
    sett.credential.id = serde.deserializeBuffer(sett.credential.id)
  }

  return deepFreeze(sett)
}
export async function saveSettings(sett: ISettings) {
  let text
  if (sett.credential) {
    text = JSON.stringify({
      ...sett,
      credential: {
        ...sett.credential,
        id: serde.serializeBuffer(sett.credential.id),
      },
    })
  } else {
    text = JSON.stringify(sett)
  }

  const keyiv = await loadKeyIv()
  const encSett = await crypto.encrypt(keyiv, text)
  localStorage.setItem('settings', encSett)
}

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
export function updateVersions(versions: AppVersions): AppVersions {
  window.localStorage.setItem('version', versions.lastVersion)!

  return {
    lastVersion: versions.lastVersion,
    version: versions.lastVersion,
  }
}