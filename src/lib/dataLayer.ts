export type Content = {
  createdAt: string,
  id: string,
  length: number,
  name: string,
  data?: string,
  secret: string,
  starred: boolean,
}

type Collection<T extends { id: string }> = Map<T['id'], T>

type Store = {
  'contents': Collection<Content>,
}

type StoreKey = keyof Store
type StoreInnerValue<K extends keyof Store> = Store[K] extends Collection<infer V> ? V : never

function getCollection<K extends StoreKey>(key: K): Collection<StoreInnerValue<K>> {
  return new Map(JSON.parse(localStorage.getItem(key) ?? '[]'))
}

function setCollection<K extends StoreKey>(key: K, coll: Collection<StoreInnerValue<K>>) {
  localStorage.setItem(key, JSON.stringify([...coll]))
}

function listToMap(contents: Content[]) {
  return new Map(contents.map((item) => [item.id, item]))
}

export function loadContent(): Content[] {
  const data = getCollection('contents')
  return [...data.values()]
}

export function saveContents(contents: Content[]) {
  setCollection('contents', listToMap(contents))
}
