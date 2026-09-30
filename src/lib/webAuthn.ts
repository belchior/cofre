import * as crypto from './crypto'
import * as storage from './storage'

export type User = {
  name: string,
  displayName: string,
}

export async function createCredential(user: User) {
  try {
    const options: CredentialCreationOptions = {
      publicKey: {
        rp: {
          name: 'Cofre',
        },
        user: {
          id: crypto.randomByteArray(16),
          displayName: user.displayName,
          name: user.name,
        },
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          residentKey: 'required',
          userVerification: 'required',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        attestation: 'direct',
        timeout: 60000,
        // TODO should be refined
        challenge: crypto.randomByteArray(16),
      },
    }

    const credential = await navigator.credentials.create(options) as PublicKeyCredential | null

    if (credential == null) {
      throw new Error('create_credential_fail')
    }

    return credential
  } catch (error) {
    throw new Error('create_credential_fail', { cause: error })
  }
}

export async function createPassKey(user: User) {
  const credential = await createCredential(user)

  const passKey: storage.PassKey = {
    ...credentialDescritor(credential),
    ...user,
  }

  return passKey
}

export function credentialDescritor(credential: PublicKeyCredential) {
  const descriptor: storage.CredentialDescriptor = {
    id: credential.rawId,
    transports: (credential.response as AuthenticatorAttestationResponse).getTransports() as AuthenticatorTransport[],
    type: 'public-key',
  }

  return descriptor
}

export async function loadCredential(descriptor: storage.CredentialDescriptor, challenge: Uint8Array<ArrayBuffer>) {
  const options: CredentialRequestOptions = {
    publicKey: {
      timeout: 60000,
      allowCredentials: [descriptor],
      challenge,
      userVerification: 'required',
    },
  }
  const credential = await navigator.credentials.get(options) as PublicKeyCredential | null

  if (credential == null) {
    throw new Error('credential_not_found')
  }

  return credential
}

export async function isAuthenticatorAvailable() {
  return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
}

function parseAuthenticatorData(buff: ArrayBuffer) {
  const rpIdHash = new Uint8Array(buff, 0, 32).toString()

  const signCount = new DataView(buff, 33, 4).getUint32(0, false)

  const flagMap = [
    'User Presence',
    undefined,
    'User Verification',
    'Backup Eligibility',
    'Backup State',
    undefined,
    'Attested Credential Data',
    'Extension Data',
  ] as const

  type Flags = Exclude<(typeof flagMap)[number], undefined>

  const flags = new DataView(buff, 32, 1)
    .getUint8(0)
    .toString(2)
    .padStart(8, '0')
    .split('')
    .toReversed()
    .reduce((acc, flag, index) => {
      if (flag === '1' && flagMap[index]) acc.push(flagMap[index])
      return acc
    }, [] as Flags[])

  return { rpIdHash, flags, signCount }
}

export async function authenticatePassKey(passKey: storage.PassKey) {
  const challenge = crypto.randomByteArray(16)
  const credential = await loadCredential(passKey, challenge)

  type ClientData = {
    type: string,
    challenge: string,
    origin: string,
    crossOrigin: boolean,
  }
  const clientData: ClientData = JSON.parse(new TextDecoder().decode(credential.response.clientDataJSON))
  // @ts-expect-error TODO fix type
  if (clientData.challenge !== challenge.toBase64({ alphabet: 'base64url', omitPadding: true })) throw new Error('invalid_challenge')
  if (clientData.type !== 'webauthn.get') throw new Error('invalid_webauthn_method')
  if (clientData.origin !== window.location.origin) throw new Error('invalid_origin')
  if (clientData.crossOrigin !== false) throw new Error('invalid_cross_origin')

  const { authenticatorData } = credential.response as AuthenticatorAssertionResponse
  const authData = parseAuthenticatorData(authenticatorData)
  if (authData.flags.includes('User Verification') === false) throw new Error('user_not_verified')
}