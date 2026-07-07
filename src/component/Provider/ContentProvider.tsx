import React, { type PropsWithChildren } from 'react'
import * as dataLayer from '../../lib/storage'
import * as crypto from './CryptoProvider'
import type { ICryptoContext } from './CryptoProvider'

type ContentContext = {
  contents: dataLayer.Content[]
  addContent: (contents: dataLayer.Content) => void
  removeContent: (id: dataLayer.Content['id']) => void
  setContents: React.Dispatch<React.SetStateAction<dataLayer.Content[] | undefined>>,
  updateContent: (id: dataLayer.Content['id'], contents: dataLayer.Content) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const ContentContext = React.createContext<ContentContext>({
  contents: [],
  addContent: () => { },
  removeContent: () => { },
  setContents: () => { },
  updateContent: () => { },
})

async function encDecContents(encDec: ICryptoContext['encrypt'] | ICryptoContext['decrypt'], contents: readonly dataLayer.Content[]) {
  return Promise.all(contents.map(async (content) => {
    const secret = await encDec(content.secret)

    const customFields = await Promise.all(content.customFields.map(async (field) => {
      if (field.type === 'password') {
        const secretField = await encDec(field.value)
        return { ...field, value: secretField }
      }
      return field
    }))

    return { ...content, secret, customFields }
  }))
}

export function ContentProvider(props: PropsWithChildren) {
  const [contents, setContents] = React.useState<dataLayer.Content[]>()
  const { decrypt, encrypt, init } = React.use(crypto.CryptoContext)

  const addContent = React.useCallback((content: dataLayer.Content) => {
    if (contents == null) return
    contents.push(content)
    setContents([...contents])
  }, [contents])

  const removeContent = React.useCallback((id: dataLayer.Content['id']) => {
    if (contents == null) return
    const newContents = contents.filter(item => item.id !== id)
    setContents(newContents)
  }, [contents])

  const updateContent = React.useCallback((id: dataLayer.Content['id'], content: dataLayer.Content) => {
    if (contents == null) return
    const newContents = contents.map(item => item.id === id ? content : item)
    setContents(newContents)
  }, [contents])

  const contextValue: ContentContext = {
    contents: contents ?? [],
    addContent,
    removeContent,
    setContents,
    updateContent,
  }

  /**
   * Keeps the app state in sync with localStorage state
  */
  React.useEffect(() => {
    // load content from localStorage to display at UI
    if (init === true && contents == null) {
      (async () => {
        const decryptedContents = await encDecContents(decrypt, dataLayer.loadContent())
        setContents(() => decryptedContents)
      })()
    }

    // save at localStorage the content updated by the user
    if (init === true && Array.isArray(contents) === true) {
      (async () => {
        const encryptedContents = await encDecContents(encrypt, contents)
        dataLayer.saveContents(encryptedContents)
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [init, contents])

  return (
    <ContentContext value={contextValue}>
      {props.children}
    </ContentContext>
  )
}
