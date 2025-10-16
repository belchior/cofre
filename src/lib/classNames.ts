
export function cls(...args: unknown[]) {
  return args.map(item => {
    if (Array.isArray(item)) {
      return item.at(0) ? item.at(1) : item.at(2)
    }
    return item
  })
    .filter(Boolean)
    .join(' ')
}
