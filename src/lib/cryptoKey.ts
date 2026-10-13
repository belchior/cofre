import * as auth from './auth'
import * as crypto from './crypto'
import * as serde from './serde'
import * as storage from './storage'
import type { AppContext } from '../component/App/AppProvider'

export type CryptoKey = string & { _ck: symbol }

let CK: CryptoKey

export async function add(sett: storage.Settings, ud: storage.UserData) {
  if (CK != null) throw new Error('crypto_key_already_exists')
  await override(sett, ud)
}

export function hasChange(
  newSett: Partial<storage.Settings>,
  ud: Partial<storage.UserData>,
  context: AppContext
) {
  if (auth.enabledAuthMethod(newSett) !== auth.enabledAuthMethod(context.sett!)) {
    return true
  }
  if (newSett?.enablePinAuth === true && context.ud?.pin !== ud.pin) {
    return true
  }

  if (
    newSett?.enableBiometricAuth === true
    && context.sett?.passKey == null
    && newSett.passKey != null
  ) {
    return true
  }

  const prevId = context.sett?.passKey?.id != null
    ? serde.serializeBuffer(context.sett.passKey.id)
    : undefined

  const nextId = newSett.passKey?.id
    ? serde.serializeBuffer(newSett.passKey.id)
    : undefined

  if (newSett?.enableBiometricAuth === true && nextId != null && nextId !== prevId) {
    return true
  }

  return false
}

export function load() {
  if (CK == null) throw new Error('crypto_key_not_found')
  return CK
}

export async function override(sett: storage.Settings, ud: storage.UserData) {
  const enabledMethod = auth.enabledAuthMethod(sett)
  let data: string
  switch (enabledMethod) {
    case 'enableBiometricAuth': {
      if (sett.passKey == null) throw new Error('invalid_authetication_method', { cause: enabledMethod })
      data = serde.serializeBuffer(sett.passKey.id)
      break
    }
    case 'enablePinAuth': {
      if (ud.pin == null) throw new Error('invalid_authetication_method', { cause: enabledMethod })
      data = ud.pin
      break
    }
    default: throw new Error('invalid_authetication_method', { cause: enabledMethod })
  }

  const { iv } = await storage.loadKeyIv()
  CK = await crypto.createHash(`${data}${iv}`) as CryptoKey
}

export async function overrideUsingPinAuth(sett: storage.Settings, pin: storage.Pin) {
  const ud = { pin, contents: [] }
  await override(sett, ud)
}

export async function overrideUsingBiometricAuth(sett: storage.Settings) {
  const ud = { pin: undefined, contents: [] }
  await override(sett, ud)
}

