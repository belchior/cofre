import { loadSession } from './storage'

export function isSessionValid() {
  const session = loadSession()

  return Boolean(session)
}

