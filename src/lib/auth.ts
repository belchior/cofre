import * as crypto from './crypto'
import * as cryptoKey from './cryptoKey'
import * as storage from './storage'

export async function addSession() {
  storage.incrementSessionCounter()
  const session = await createSession()
  storage.saveSession(session)
}

export async function getSession() {
  const session = storage.loadSession()
  return session
}

export async function isSessionValid() {
  try {
    const session = storage.loadSession()
    if (session == null) return false
    const generatedSession = await createSession()
    return session === generatedSession
  } catch (error) {
    if ((error as Error).message === 'crypto_key_not_found') {
      removeSession()
      return false
    }
    console.error(error)
    return false
  }
}

async function createSession() {
  const ck = cryptoKey.load()
  const sc = storage.loadSessionCounter()
  const data = `${ck}${sc}`
  const session = await crypto.createHash(data)
  return session
}

export async function removeSession() {
  storage.removeSession()
}

// TODO hash composition needs refinament
export async function createPinHash(pin: string) {
  const { iv } = await storage.loadKeyIv()
  return await crypto.createHash(`1${pin}${iv}1`) as storage.Pin
}

export async function isPinValid(pin: storage.Pin) {
  if (pin == null || pin === '') return false

  try {
    const ck = cryptoKey.load()
    const currentPin = (await storage.loadPin(ck))!
    return pin === currentPin
  } catch (error) {
    console.error(error)
    return false
  }
}

function authMethods(sett: Partial<storage.Settings>) {
  return Object.keys(sett).filter(key => key.endsWith('Auth')) as storage.AuthMethods[]
}
export function enabledAuthMethod(sett: Partial<storage.Settings>) {
  return authMethods(sett)
    .filter(key => sett[key] === true)
    .at(0) ?? ''
}
export function disableAuthMethod(sett: storage.Settings) {
  const newSett = { ...sett }
  authMethods(newSett).forEach(key => newSett[key] = false)
  return newSett
}
