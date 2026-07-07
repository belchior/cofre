import * as crypto from './crypto'
import { deepFreeze } from './deepFreeze'

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

export type ISettings = Readonly<{
  enablePinAuth: boolean,
  enableBiometricAuth: boolean,
  pin?: string,
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

export async function loadKeyIv() {
  const text = localStorage.getItem('keyiv')

  if (text == null) {
    const keyiv = await crypto.init()
    await saveKeyIv(keyiv)
    return keyiv
  }

  return crypto.deserializeKeyIv(text)
}

export async function loadSettings(): Promise<ISettings> {
  const cipherText = localStorage.getItem('settings')

  if (cipherText == null) {
    const defaultSett: ISettings = {
      enablePinAuth: false,
      enableBiometricAuth: false,
      pin: undefined,
    }
    await saveSettings(defaultSett)
    return defaultSett
  }

  const keyiv = await loadKeyIv()
  const text = await crypto.decrypt(keyiv, cipherText)
  const sett = JSON.parse(text)
  return deepFreeze(sett)
}

export function loadSession() {
  return sessionStorage.getItem('session')
}

export function saveContents(contents: Content[]) {
  setCollection('contents', listToMap(contents))
}

export async function saveKeyIv(keyiv: crypto.KeyIv) {
  const text = await crypto.serializeKeyIv(keyiv)
  return localStorage.setItem('keyiv', text)
}

export async function saveSettings(sett: ISettings) {
  const text = JSON.stringify(sett)
  const keyiv = await loadKeyIv()
  const encSett = await crypto.encrypt(keyiv, text)
  localStorage.setItem('settings', encSett)
}

export function saveSession(session: string) {
  return sessionStorage.setItem('session', session)
}