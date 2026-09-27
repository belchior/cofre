export function aboutBrowser() {
  const ug = navigator.userAgent
  const terms: string[] = ug.match(/\w+\//g) ?? []

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
    default: name = ''
  }

  const device = ug.includes('Mobile') ? 'mobile' : 'desktop'

  return {
    name,
    device,
  }
}
