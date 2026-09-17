type Language = 'pt-BR' | 'en-US'
type DataMap = Record<string, string>
type Dictionary = Record<Language, DataMap>

const dict: Dictionary = {
  'en-US': {
    'choose_auth_method': 'Choose an authentication method',
    'auth_by_pin': 'Authentication by PIN',
    'auth_by_pin_desc': 'Enabling PIN authentication when starting a session will prompt you for a 4-digit identifier.',
  },
  'pt-BR': {
    'choose_auth_method': 'Selecione um método de autenticação',
    'auth_by_pin': 'Autenticação via PIN',
    'auth_by_pin_desc': 'Habilitando autenticação por PIN ao iniciar uma sessão será solicitado um identificador de 4 dígitos.',
  },
}
const defaultLang: Language = 'en-US'
const lang = dict[navigator.language as Language]
  ? navigator.language as Language
  : defaultLang

export function t(key: string) {
  const translation = dict[lang][key] ?? dict[defaultLang][key]
  return translation ?? 'translation error'
}