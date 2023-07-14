import { compileToFunction } from './compiler/index.js'
import { defineReactive, observe } from './observer/index.js'
import Watcher from './observer/watcher.js'
import { isFunction } from './util/index.js'
import { createElement, createText } from './vdom/index.js'
import { patch } from './vdom/patch.js'

import { nextTick } from './util/next-tick.js'

function Vue(options) {
  this._init(options)
}

Vue.prototype._init = function(options) {
  const vm = this
  vm.$options = options

  // 1. 初始化状态
  initData(vm)
  // 2. 初始化计算属性
  initComputed(vm)
  // 3. 初始化侦听器
  initWatch(vm)

  // 4. 挂载
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}

function initData(vm) {
  let data = vm.$options.data
  data = vm._data = isFunction(data) ? data.call(vm, vm) : data || {}

  // 1.1 代理 data 上的属性到 vm 实例上
  const keys = Object.keys(data)
  keys.forEach((key) => {
    proxy(vm, '_data', key)
  })

  // 1.2 初始化响应式
  observe(data)

  // 1.3 创建组件监听器
}

function proxy(target, sourceKey, key) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: function proxyGetter() {
      return target[sourceKey][key]
    },
    set: function proxySetter(val) {
      target[sourceKey][key] = val
    }
  })
}

function initComputed(vm) {
  const computed = vm.$options.computed
  if (computed) {
    for (const key in computed) {
      const watcher = new Watcher(
        vm,
        computed[key],
        () => {
          console.log('computed watcher update')
        },
        {
          lazy: true
        }
      )
      Object.defineProperty(vm, key, {
        enumerable: true,
        configurable: true,
        get: function() {
          if (watcher.dirty) {
            watcher.get()
            watcher.dirty = false
          }
          return watcher.value
        },
        set: function() {
          console.error(`Computed property "${key}" was assigned to but it has no setter.`)
        }
      })
    }
  }
}

Vue.prototype.$watch = function(expOrFn, cb) {
  new Watcher(this, expOrFn, cb)
}

function initWatch(vm) {
  const watch = vm.$options.watch
  if (watch) {
    for (const key in watch) {
      const handler = watch[key]
      new Watcher(vm, key, handler)
    }
  }
}

Vue.prototype.$set = function(target, key, val) {
  defineReactive(target, key, val)
  target.__ob__.dep.notify()
}

Vue.prototype._render = function() {
  const vm = this
  const { render } = vm.$options
  return render.call(vm)
}

// 生成DOM节点
Vue.prototype._c = function() {
  const vm = this
  return createElement(vm, ...arguments)
}
// 生成文本节点
Vue.prototype._v = function(text) {
  const vm = this
  return createText(vm, text)
}
// 处理插值变量
Vue.prototype._s = function(val) {
  if (typeof val === 'object' && val !== null) {
    return JSON.stringify(val)
  } else {
    return val
  }
}

Vue.prototype.$mount = function(el) {
  el = document.querySelector(el)
  const { render } = compileToFunction(el.outerHTML)
  const vm = this
  vm.$el = el
  const opt = vm.$options
  if (!opt.render) {
    opt.render = render
  }
  new Watcher(
    vm,
    function() {
      // 视图渲染
      vm._update(vm._render())
    },
    () => {}
  )
}

Vue.prototype._update = function(vnode) {
  console.log(vnode)
  const vm = this
  const preVnode = vm.preVnode
  vm.preVnode = vnode
  if (!preVnode) {
    // 初渲染
    vm.$el = patch(vm.$el, vnode)
  } else {
    // 更新渲染:新老虚拟节点做 diff 比对
    vm.$el = patch(preVnode, vnode)
  }
  console.log('====================render====================')
}

Vue.prototype.$nextTick = function(fn) {
  nextTick(fn)
}

export default Vue
