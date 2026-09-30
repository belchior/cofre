import * as crypto from './crypto'
import * as serde from './serde'
import * as storage from './storage'

export async function addSession(additionalData: string) {
  storage.incrementSessionCounter()
  const session = await createSession(additionalData)
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

    const sett = await storage.loadSettings()

    const dataMap = {
      enablePinAuth: sett.pin,
      enableBiometricAuth: sett.passKey ? serde.serializeBuffer(sett.passKey.id) : undefined,
    }
    const authMethods: Array<keyof typeof dataMap> = ['enablePinAuth', 'enableBiometricAuth']

    const promises = authMethods.map(async (authMethod) => {
      const additionalData = dataMap[authMethod]
      if (additionalData == null) return false
      const generatedSession = await createSession(additionalData)
      return session === generatedSession
    })

    const results = await Promise.all(promises)
    return results.includes(true)
  } catch (error) {
    console.error(error)
    return false
  }
}

async function createSession(additionalData: string) {
  const sc = storage.loadSessionCounter()
  const data = `${additionalData}${sc}`
  const session = await crypto.createHash(data)
  return session
}

export async function removeSession() {
  storage.removeSession()
}

export async function createPinHash(pin: string) {
  const { iv } = await storage.loadKeyIv()
  return await crypto.createHash(`${pin}${iv}`)
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
    return sett.pin === await createPinHash(pin)
  } catch (error) {
    console.error(error)
    return false
  }
}