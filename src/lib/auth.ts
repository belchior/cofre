import * as storage from './storage'

function authMethods(sett: Partial<storage.Settings>) {
  return Object.keys(sett).filter(key => key.endsWith('Auth')) as storage.AuthMethods[]
}
export function enabledAuthMethod(sett: Partial<storage.Settings>) {
  return authMethods(sett)
    .filter(key => sett[key] === true)
    .at(0) ?? ''
}
export function disableAuthMethod(sett: storage.Settings) {
  const newSett = { ...sett }
  authMethods(newSett).forEach(key => newSett[key] = false)
  return newSett
}
