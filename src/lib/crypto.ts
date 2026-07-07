import { deepFreeze } from './deepFreeze'

export function uniqueId() {
  return window.crypto.randomUUID()
}

export function isUniqueId(id: string) {
  return Boolean(id.match(/^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/))
}

const ALGORITHM_ID = 'AES-GCM'
const ALGORITHM_PARAMS = deepFreeze({ name: ALGORITHM_ID, length: 256 })
const BYTE_LENGTH = 16
const EXTRACTABLE = true
const FORMAT = 'raw'
const KEY_USAGES = deepFreeze(['encrypt', 'decrypt'] as const)

const serde = deepFreeze({
  encoding(message: string) {
    const enc = new TextEncoder()
    return enc.encode(message)
  },

  decoding(buf: ArrayBuffer) {
    const enc = new TextDecoder()
    return enc.decode(buf)
  },

  serializeBuffer(buf: ArrayBuffer) {
    return new Uint8Array(buf).toString()
  },

  deserializeBuffer(text: string) {
    return new Uint8Array(text.split(',').map(Number)).buffer
  },

  serializeIv(iv: Uint8Array<ArrayBuffer>) {
    return iv.toString()
  },

  deserializeIv(text: string) {
    return new Uint8Array(text.split(',').map(Number))
  },

  async serializeKey(key: CryptoKey) {
    return this.serializeBuffer(await window.crypto.subtle.exportKey(FORMAT, key))
  },

  async deserializeKey(text: string) {
    const buf = this.deserializeBuffer(text)
    return await window.crypto.subtle.importKey(FORMAT, buf, ALGORITHM_PARAMS, EXTRACTABLE, KEY_USAGES)
  },
})

export function initializationVector() {
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
  return `${await serde.serializeKey(keyiv.key)}.${serde.serializeIv(keyiv.iv)}`
}

export async function deserializeKeyIv(text: string): Promise<KeyIv> {
  const [key, iv] = text.split('.')
  return {
    key: await serde.deserializeKey(key),
    iv: serde.deserializeIv(iv),
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
