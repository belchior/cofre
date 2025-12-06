export const deepFreeze = <T extends object>(object: T) => {
  const propNames = Reflect.ownKeys(object)

  for (const name of propNames) {
    // @ts-expect-error An empty object will not enter this part of the code
    const value = object[name]

    if ((value && typeof value === 'object') || typeof value === 'function') {
      deepFreeze(value)
    }
  }

  return Object.freeze(object)
}

// prevents the prototype pollution
deepFreeze(deepFreeze)
