const dict = {
  'access_key_is_required': ['It is required to create an access key', 'É necessário criar uma chave de acesso'],
  'add_secret': ['Add secret', 'Adicionar segredo'],
  'add_to_favorite': ['Add to favorites', 'Adicionar aos favoritos'],
  'add': ['add', 'adicionar'],
  'app_updates': ['App updates', 'Atualização da app'],
  'at_least_1_char': ['at least 1 character', 'no mímino 1 caracter'],
  'at_most_255_char': ['at most 255 character', 'no máxino 255 caracteres'],
  'auth_by_biometric_desc': ['By enabling biometric authentication for logins, you will be prompted to confirm your identity via your device\'s passkey manager.', 'Habilitando autenticação por Biometria ao iniciar uma sessão, será  solicitado confirmar sua identidade através do gerenciador de chaves de acesso do seu dispositivo.'],
  'auth_by_biometric': ['Authentication by Biometric', 'Autenticação via Biometria'],
  'auth_by_pin_desc': ['Enabling PIN authentication when starting a session will prompt you for a 4-digit identifier.', 'Habilitando autenticação por PIN ao iniciar uma sessão será solicitado um identificador de 4 dígitos.'],
  'auth_by_pin': ['Authentication by PIN', 'Autenticação via PIN'],
  'auth_using_biometric': ['Authenticate using biometrics', 'Autenticar usando biometria'],
  'auth_using_pin': ['Authenticate using PIN', 'Autenticar usando PIN'],
  'cancel': ['cancel', 'cancelar'],
  'choose_auth_method': ['Choose an authentication method', 'Selecione um método de autenticação'],
  'click_for_copy_secret': ['click for copy the secret', 'click para copiar o segredo'],
  'click_for': ['click for', 'click para'],
  'configurations': ['Configurations', 'Configurações'],
  'confirm_your_pin': ['Confirm your PIN', 'Confirme seu PIN'],
  'copied': ['copied', 'copiado'],
  'copy': ['copiar', 'copiar'],
  'create_access_key': ['create access key', 'criar chave de acesso'],
  'current_version': ['Current version', 'Versão atual'],
  'delete_access_key': ['delete access key', 'excluir chave de acesso'],
  'delete': ['delete', 'excluir'],
  'details_from': ['Details from', 'Detalhes de'],
  'edit': ['edit', 'editar'],
  'enter_your_pin': ['Enter your PIN', 'Insira seu PIN'],
  'enter_your': ['Enter your', 'Insira seu'],
  'favorite': ['Favorite', 'Favorito'],
  'go_back': ['go back', 'voltar'],
  'hide': ['hide', 'esconder'],
  'invalid_pin': ['invalid PIN', 'PIN inválido'],
  'item_menu': ['item menu', 'menu do item'],
  'loading': ['loading', 'carregando'],
  'login': ['Login', 'Login'],
  'name_in_use': ['nome em uso', 'nome em uso'],
  'name': ['name', 'nome'],
  'new_field': ['New field', 'Novo campo'],
  'new_secret': ['New secret', 'Novo segredo'],
  'new_version_available': ['There is a newer version, do you want to update?', 'Há uma versão mais recente, deseja atualizar?'],
  'pin_confirmation_error': ['Does not match the PIN value', 'Não corresponde ao valor do PIN'],
  'pin_is_required': ['It is required to create a PIN', 'É necessário criar um PIN'],
  'receive_updates_auto': ['Receive updates automatically', 'Receber atualizações de forma automática'],
  'save': ['save', 'salvar'],
  'search_secrets_by_name': ['Search for secrets by name', 'Busque segredos por nome'],
  'secret': ['Secret', 'Segredo'],
  'show': ['show', 'mostrar'],
  'the_secret': ['the secret', 'o segredo'],
  'update_secret': ['Atualizar segredo', 'Atualizar segredo'],
  'update': ['atualizar', 'atualizar'],
  'yes_update': ['yes, update', 'sim, quero atualizar'],
}

const defaultLang = 'en-US'
const langMap = {
  [defaultLang]: 0,
  'pt-BR': 1,
} as const

type Languages = keyof typeof langMap
type DictionaryKey = keyof typeof dict

const lang = typeof langMap[navigator.language as Languages] === 'number'
  ? langMap[navigator.language as Languages]
  : langMap[defaultLang]

export function t(key: DictionaryKey) {
  return dict[key][lang]
}