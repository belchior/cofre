export function aboutBrowser() {
  const ua = navigator.userAgent
  const terms: string[] = ua.match(/\w+\//g) ?? []

  const firefox = terms.includes('Firefox/')
  const chrome = terms.includes('Chrome/')
  const safari = terms.includes('Safari/')
  const edge = terms.includes('Edg/')

  let name
  switch (`${firefox}|${chrome}|${safari}|${edge}`) {
    case 'true|false|false|false': name = 'Firefox'; break
    case 'false|true|true|false': name = 'Chrome'; break
    case 'false|false|true|false': name = 'Safari'; break
    case 'false|true|true|true': name = 'Edge'; break
    default: name = 'unknown'
  }

  const device = ua.includes('Mobile')
    ? 'mobile'
    : ua.includes('Tablet')
      ? 'tablet'
      : 'desktop'

  return {
    name,
    device,
  }
}

export function isDevelopment() {
  return window.location.host === 'localhost:5173'
}