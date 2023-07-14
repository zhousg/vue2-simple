let callbacks = [] // 缓存异步更新的 nextTick
let pending = false
function flushsCallbacks() {
  callbacks.forEach(fn => fn()) // 依次执行 nextTick
  callbacks = [] // reset
  pending = false // reset
}

/**
 * 将方法异步化
 * @param {*} fn 需要异步化的方法
 * @returns
 */
export function nextTick(fn) {
  // return Promise.resolve().then(fn);
  callbacks.push(fn) // 先缓存异步更新的nextTick,后续统一处理
  if (!pending) {
    pending = true // 首次进入被置为 true,控制逻辑只走一次
    Promise.resolve().then(flushsCallbacks)
  }
}
