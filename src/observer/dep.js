export default class Dep {
  constructor() {
    this.subs = []
  }

  addSub(watcher) {
    this.subs.push(watcher)
  }

  removeSub(watcher) {
    const index = this.subs.indexOf(watcher)
    if (index > -1) this.subs.splice(index, 1)
  }

  depend() {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify(newVal) {
    const subs = this.subs.slice()
    for (let i = 0; i < subs.length; i++) {
      subs[i].update(newVal)
    }
  }
}
