
export function uniqueId() {
  return window.crypto.randomUUID()
}

export function isUniqueId(id: string) {
  return Boolean(id.match(/^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/))
}
