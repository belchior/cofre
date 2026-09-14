import * as crypto from './crypto'
import * as serde from './serde'
import * as storage from './storage'

export async function addSession(additionalData: string) {
  const session = await newSession(additionalData)
  storage.saveSession(session)
}

export async function getSession() {
  const session = storage.loadSession()
  return session
}

export async function isPinValid(pin: string) {
  if (pin == null || pin === '') {
    return false
  }

  try {
    const sett = await storage.loadSettings()
    if (sett.enablePinAuth === false || sett.pin == null || sett.pin === '') {
      return false
    }
    return sett.pin === pin
  } catch (error) {
    console.error(error)
    return false
  }
}

export async function isSessionValid() {
  try {
    const session = storage.loadSession()

    if (session == null) return false

    const sett = await storage.loadSettings()

    const authMethods = ['enablePinAuth', 'enableBiometricAuth']
    const dataMap = {
      enablePinAuth: sett.pin,
      enableBiometricAuth: sett.credential ? serde.serializeBuffer(sett.credential.id) : undefined,
    }

    const promises = authMethods.map(async (authMethod) => {
      // @ts-expect-error TODO fix type
      const additionalData = dataMap[authMethod]
      const generatedSession = await newSession(additionalData)
      return session === generatedSession
    })

    const results = await Promise.all(promises)
    return results.includes(true)
  } catch (error) {
    console.error(error)
    return false
  }
}

async function newSession(additionalData?: string) {
  const keyiv = await storage.loadKeyIv()
  const text = keyiv.iv.toString()
  const session = await crypto.encrypt(keyiv, text, additionalData)
  return session
}

export async function removeSession() {
  storage.removeSession()
}