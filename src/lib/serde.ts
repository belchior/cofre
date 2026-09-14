export function encoding(message: string) {
  const enc = new TextEncoder()
  return enc.encode(message)
}

export function decoding(buf: ArrayBuffer) {
  const enc = new TextDecoder()
  return enc.decode(buf)
}

export function serializeBuffer(buf: ArrayBuffer) {
  return new Uint8Array(buf).toString()
}

export function deserializeBuffer(text: string) {
  return new Uint8Array(text.split(',').map(Number)).buffer
}