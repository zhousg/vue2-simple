import { isFunction, parsePath } from '../util/index.js'
import Dep from './dep.js'
import { queueWatcher } from './schedule.js'

let uid = 0
export default class Watcher {
  constructor(vm, expOrFn, cb, options = {}) {
    this.vm = vm
    this.cb = cb
    this.dirty = this.lazy = !!options.lazy
    this.uid = uid++

    if (isFunction(expOrFn)) {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
    }

    this.value = this.lazy ? undefined : this.get()
  }

  get() {
    Dep.target = this
    const vm = this.vm
    const value = this.getter.call(vm, vm)
    this.value = value
    Dep.target = null
  }

  addDep(dep) {
    dep.addSub(this)
  }

  update(newVal) {
    if (this.lazy) {
      this.dirty = true
      return
    }
    const oldValue = this.value
    this.value = newVal
    this.cb.call(this.vm, this.value, oldValue)
    queueWatcher(this)
  }

  run() {
    this.get()
  }
}
