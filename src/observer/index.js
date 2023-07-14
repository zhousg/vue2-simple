import { isObject } from '../util/index.js'
import Dep from './dep.js'

export function observe(value) {
  if (!isObject(value)) return

  let ob
  if (value.hasOwnProperty('__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }

  return ob
}

class Observer {
  constructor(value) {
    this.value = value
    this.dep = new Dep()

    Object.defineProperty(value, '__ob__', {
      value: this,
      enumerable: false
    })

    this.walk(value)
  }

  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      defineReactive(obj, key, obj[key])
    }
  }
}

export function defineReactive(obj, key, val) {
  const childOb = observe(val)

  const dep = new Dep()
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      console.log('Get:', key, val)
      dep.depend()
      if (childOb) {
        childOb.dep.depend()
      }
      return val
    },
    set: function reactiveSetter(newVal) {
      console.log('Set:', key, newVal)
      if (newVal === val) return
      if (isObject(newVal)) {
        observe(newVal)
      }
      val = newVal
      dep.notify(newVal)
    }
  })
}
