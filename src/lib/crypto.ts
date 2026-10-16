
export function uniqueId() {
  return window.crypto.randomUUID()
}

export function randomByteArray(byteLength: number) {
  return window.crypto.getRandomValues(new Uint8Array(byteLength))
}
