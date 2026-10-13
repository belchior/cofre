# Cofre - Uma Prova de Conceito

## Jornada do usuário e criptografia

### Definições
Sobre IV - Initialization Vector
- Deve ser uma lista de inteiros gerados de forma aleatória
- O IV deve ser único por dispositivo

Sobre CK - Cryptography Key
- Deve ser a hash de uma informação fornecida pelo usuário (segredo) usado para criptografar/descriptografar o UD
- A CK nunca deve ser persistida ou estar acessível via contexto global
- A CK deve ser consistente entre sessões
- Caso o usuário decida alterar sua CK, os UD devem ser descriptografados usando a CK atual e criptografados usando a nova CK, depois deste ponto a CK nova passa a ser a atual e uma nova sessão deve ser criada
- Caso a aplicação seja recarregada a CK deve ser descartada e um novo processo de login iniciado

Sobre SC - Session Count
- Deve ser um número inteiro iniciado em 1
- A cada nova sessão criada o SC deve ser incrementado em 1

Sobre a sessão
- Deve ser a hash da concatenação da CK + SC

Sobre UD - User Data
- Antes de ser persistido deve ser criptografado usando IV + CK
- Antes de ser lido ou alterado deve ser descriptografado usando IV + CK

### Página `/cofre/get-started`
- Deve ser criado e persistido o IV
- Deve ser apresentado todos métodos de autenticação disponíveis no dispositivo
- Usuário pode registrar vários métodos de autenticação mas apenas 1 deve ser considerado ativo
- As escolhas do usuário (Sett) devem ser criptografadas usando IV e persistidas
- Usuário deve ser redirecionado para a página de Login

### Página `/cofre/login`
- Carregar e descriptografar as Sett usando IV
- Detectar os métodos de autenticação disponíveis no dispositivo
- Deve apresentar métodos de autenticação baseado na Sett e que estejam disponíveis no dispositivo
- Caso haja incompatibilidade resultando em nenhum método de autenticação válido, o usuário deve ser informado sobre a incompatibilidade

Após o usuário se autenticar
- Deve ser criado a CK
- Deve ser criado e persistido o SC
- A sessão do usuário deve ser criada e persistida
- O usuário deve ser redirecionado para a página Home

### Página `/cofre/home`
- Deve verificar que a sessão do usuário existe e é válida, caso contrário o usuário deve ser redirecionado para Login
- Deve verificar que a CK existe, caso contrário o usuário deve ser redirecionado para Login
- Deve carregar e descriptografar os UD usando IV + CK
- Ao criar ou editar um UD este deve ser criptografado usando IV + CK e persistido

### Página `/cofre/settings`
Caso seja alterado o método de autenticação
- Usando a CK nova o UD dever ser criptografado usando IV + CK e persistido
- - Nova sessão deve ser criada

## Referências
- [Web Authentication Spec](https://www.w3.org/TR/webauthn-1/)
- [PublicKeyCredential](https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredential)
- [Simpler WebAuthn feature detection](https://web.dev/articles/webauthn-client-capabilities?hl=pt-br)
- [Web Authentication API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API#creating_a_key_pair_and_registering_a_user)
- [Appendix: verification of the authentication response](https://developers.google.com/identity/passkeys/developer-guides/server-authentication#appendix_verification_of_the_authentication_response)

- [Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Crypto)
- [SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)

