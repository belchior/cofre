import React, { createContext, type PropsWithChildren } from 'react'
import * as dataLayer from '../../lib/data-layer'

type ContentContext = {
  contents: dataLayer.Content[]
  addContent: (_contents: dataLayer.Content) => void
  removeContent: (_id: dataLayer.Content['id']) => void
  setContents: React.Dispatch<React.SetStateAction<dataLayer.Content[]>>,
  updateContent: (_id: dataLayer.Content['id'], _contents: dataLayer.Content) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const ContentContext = createContext<ContentContext>({
  contents: [],
  addContent: () => { },
  removeContent: () => { },
  setContents: () => { },
  updateContent: () => { },
})

export function ContentContextProvider(props: PropsWithChildren) {
  const [contents, setContents] = React.useState(dataLayer.loadContent())

  const addContent = (content: dataLayer.Content) => {
    contents.push(content)
    setContents([...contents])
  }

  const removeContent = React.useCallback((id: dataLayer.Content['id']) => {
    const newContents = contents.filter(item => item.id !== id)
    setContents(newContents)
  }, [contents])

  const updateContent = (id: dataLayer.Content['id'], content: dataLayer.Content) => {
    const newContents = contents.map(item => item.id === id ? content : item)
    setContents(newContents)
  }

  const contextValue: ContentContext = {
    contents,
    addContent,
    removeContent,
    setContents,
    updateContent,
  }

  /**
   * Keeps the app state in sync with localStorage state
  */
  React.useEffect(() => {
    dataLayer.saveContents(contents)
  }, [contents])

  return (
    <ContentContext value={contextValue}>
      {props.children}
    </ContentContext>
  )
}
