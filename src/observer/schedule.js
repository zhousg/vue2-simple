import { nextTick } from '../util/next-tick'

let queue = []
let has = {}
let pending = false

/**
 * 刷新队列：执行所有 watcher.run 并将队列清空；
 */
function flushSchedulerQueue() {
  // 更新前,执行生命周期：beforeUpdate
  queue.forEach(watcher => watcher.run()) // 依次触发视图更新
  queue = [] // reset
  has = {} // reset
  pending = false // reset
  // 更新完成,执行生命周期：updated
}

/**
 * 将 watcher 进行查重并缓存，最后统一执行更新
 * @param {*} watcher 需更新的 watcher
 */
export function queueWatcher(watcher) {
  const id = watcher.uid
  if (has[id] === undefined) {
    has[id] = true
    queue.push(watcher) // 缓存住watcher,后续统一处理
    if (!pending) { // 等效于防抖
      pending = true // 首次进入被置为 true，使微任务执行完成后宏任务才执行
      nextTick(flushSchedulerQueue)
    }
  }
}
