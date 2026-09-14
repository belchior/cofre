import { deepFreeze } from './deepFreeze'
import * as serde from './serde'

export function uniqueId() {
  return window.crypto.randomUUID()
}

export function randomByteArray(byteLength: number) {
  return window.crypto.getRandomValues(new Uint8Array(byteLength))
}

const ALGORITHM_ID = 'AES-GCM'
const ALGORITHM_PARAMS = deepFreeze({ name: ALGORITHM_ID, length: 256 })
const BYTE_LENGTH = 16
const EXTRACTABLE = true
const FORMAT = 'raw'
const KEY_USAGES = deepFreeze(['encrypt', 'decrypt'] as const)

function serializeIv(iv: Uint8Array<ArrayBuffer>) {
  return iv.toString()
}

function deserializeIv(text: string) {
  return new Uint8Array(text.split(',').map(Number))
}

async function serializeKey(key: CryptoKey) {
  return serde.serializeBuffer(await window.crypto.subtle.exportKey(FORMAT, key))
}

async function deserializeKey(text: string) {
  const buf = serde.deserializeBuffer(text)
  return await window.crypto.subtle.importKey(FORMAT, buf, ALGORITHM_PARAMS, EXTRACTABLE, KEY_USAGES)
}

function initializationVector() {
  return window.crypto.getRandomValues(new Uint8Array(BYTE_LENGTH))
}

async function cryptoKey() {
  const key = await window.crypto.subtle.generateKey(ALGORITHM_PARAMS, EXTRACTABLE, KEY_USAGES)
  return key
}

export type KeyIv = {
  key: CryptoKey,
  iv: Uint8Array<ArrayBuffer>
}

export async function init(): Promise<KeyIv> {
  const iv = initializationVector()
  const key = await cryptoKey()

  console.debug({
    message: 'crypto initialized',
  })

  return { key, iv }
}

export async function serializeKeyIv(keyiv: KeyIv) {
  return `${await serializeKey(keyiv.key)}.${serializeIv(keyiv.iv)}`
}

export async function deserializeKeyIv(text: string): Promise<KeyIv> {
  const [key, iv] = text.split('.')
  return {
    key: await deserializeKey(key),
    iv: deserializeIv(iv),
  }
}

export async function encrypt(keyiv: KeyIv, plainText: string, additionalData?: string) {
  const encodedText = serde.encoding(plainText)
  const encodedData = additionalData ? serde.encoding(additionalData) : new TextEncoder().encode()
  const cipherText = await window.crypto.subtle.encrypt(
    { name: ALGORITHM_ID, iv: keyiv.iv, additionalData: encodedData },
    keyiv.key,
    encodedText
  )
  return serde.serializeBuffer(cipherText)
}

export async function decrypt(keyiv: KeyIv, secretAsText: string, additionalData?: string) {
  const cipherText = serde.deserializeBuffer(secretAsText)
  const encodedData = additionalData ? serde.encoding(additionalData) : new TextEncoder().encode()
  const buf = await window.crypto.subtle.decrypt(
    { name: ALGORITHM_ID, iv: keyiv.iv, additionalData: encodedData },
    keyiv.key,
    cipherText
  )
  return serde.decoding(buf)
}
