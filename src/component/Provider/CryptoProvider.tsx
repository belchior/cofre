import React, { createContext, type PropsWithChildren } from 'react'
import * as storage from '../../lib/storage'
import * as crypto from '../../lib/crypto'

export type ICryptoContext = {
  init: boolean,
  encrypt: (plainText: string) => Promise<string>
  decrypt: (secretAsText: string) => Promise<string>
}

// eslint-disable-next-line react-refresh/only-export-components
export const CryptoContext = createContext<ICryptoContext>({
  init: false,
  encrypt: () => Promise.resolve(''),
  decrypt: () => Promise.resolve(''),
})

export function CryptoProvider(props: PropsWithChildren) {
  const [keyiv, setKeyiv] = React.useState<crypto.KeyIv>()

  const encrypt = React.useCallback(async (message: string) => {
    if (keyiv == null) return ''
    return crypto.encrypt(keyiv, message)
  }, [keyiv])

  const decrypt = React.useCallback(async (message: string) => {
    if (keyiv == null) return ''
    return crypto.decrypt(keyiv, message)
  }, [keyiv])

  const contextValue = {
    init: keyiv != null,
    encrypt,
    decrypt,
  }

  React.useEffect(() => {
    if (keyiv == null) {
      (async () => {
        const newKeyIv = await storage.loadKeyIv()
        setKeyiv(newKeyIv)
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <CryptoContext value={contextValue}>
      {props.children}
    </CryptoContext>
  )
}
