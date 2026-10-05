
import * as storage from './storage'

function createFile(content: Record<string, unknown>) {
  const fileName = `cofre_backup_${Date.now()}.json`
  const blob = new Blob([JSON.stringify(content)], {
    'type': 'application/json',
  })
  const file = new File([blob], fileName)

  return file
}

export function createBackup() {
  const data = {
    contents: window.localStorage.getItem('contents'),
    keyiv: window.localStorage.getItem('keyiv'),
    settings: window.localStorage.getItem('settings'),
    version: window.localStorage.getItem('version'),
  }
  const file = createFile(data)
  return file
}

function isBackupValid(data: Record<string, unknown>) {
  const requiredAttributes = ['contents', 'keyiv', 'settings', 'version']

  if (data == null || typeof data !== 'object') return false

  const test = requiredAttributes.reduce((acc, attr) => {
    if (acc === false) return false
    if (data[attr] == null) return false
    if (typeof data[attr] !== 'string') return false
    return acc
  }, true)

  return test
}

export async function restore(file: File) {
  const data = JSON.parse(await file.text())

  if (isBackupValid(data) === false) return false

  window.localStorage.setItem('contents', data.contents)
  window.localStorage.setItem('keyiv', data.keyiv)
  window.localStorage.setItem('settings', data.settings)
  window.localStorage.setItem('version', data.version)

  return true
}

export async function clearAppData() {
  // clear localStorage
  window.localStorage.removeItem('contents')
  window.localStorage.removeItem('keyiv')
  window.localStorage.removeItem('sc')
  window.localStorage.removeItem('settings')
  window.localStorage.removeItem('version')

  // clear sessionStorage
  window.sessionStorage.removeItem('session')

  // deletes cached files from old app version
  await caches.delete('v1')
}

export function hasUpdate(arg?: storage.AppVersions) {
  if (arg == null) return false
  const v = Number(arg.version.replaceAll('.', ''))
  const lv = Number(arg.lastVersion.replaceAll('.', ''))
  return lv > v
}

export async function updateAppVersion(versions: storage.AppVersions) {
  if (hasUpdate(versions) === false) return false
  console.debug(`The App will be updated from ${versions.version} to ${versions.lastVersion}`)
  storage.saveVersion(versions)

  // deletes cached files from old app version
  await caches.delete('v1')
  return true
}

/**
 * Must be used in a React.useEffect context
*/
export async function updateAppVersionIfNeed(sett: storage.ISettings) {
  if (sett.enableAutoUpdate === false) return
  const versions = storage.loadVersions()
  const updated = await updateAppVersion(versions)
  if (updated) window.location.assign('/cofre/login')
}