import * as crypto from './crypto'
import type { CredentialDescriptor } from './storage'

export async function createCredential() {
  try {
    const options: CredentialCreationOptions = {
      publicKey: {
        rp: {
          name: 'Cofre',
        },
        user: {
          // TODO should be refined, should be stored?
          id: crypto.randomByteArray(16),
          name: 'user@cofre.com',
          displayName: 'User Cofre',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        attestation: 'direct',
        timeout: 60000,
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

export function credentialDescritor(credential: PublicKeyCredential) {
  const descriptor: CredentialDescriptor = {
    id: credential.rawId,
    transports: (credential.response as AuthenticatorAttestationResponse).getTransports() as AuthenticatorTransport[],
    type: 'public-key',
  }

  return descriptor
}

export async function loadCredential(descriptor: PublicKeyCredentialDescriptor) {
  const options: CredentialRequestOptions = {
    publicKey: {
      timeout: 60000,
      allowCredentials: [descriptor],
      // TODO should be related with creation and verified after load
      challenge: crypto.randomByteArray(16),
    },
  }
  const credential = await navigator.credentials.get(options) as PublicKeyCredential | null

  return credential
}