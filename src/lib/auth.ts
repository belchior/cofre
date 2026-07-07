import * as storage from './storage'
import * as crypto from './crypto'

export async function addSession(pin: string) {
  const session = await newSession(pin)
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
    const additionalData = sett.enablePinAuth
      ? sett.pin
      : undefined
    const generatedSession = await newSession(additionalData)

    return session === generatedSession
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