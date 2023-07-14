export function isFunction(value) {
  return typeof value === 'function'
}

export function isObject(obj) {
  return obj !== null && typeof obj === 'object'
}

export function parsePath(path) {
  const segments = path.split('.')
  return function(obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    console.log('++++=', obj)
    return obj
  }
}
