var data = {
  money: {
      value: 1000,
      dep: {
          // 凡是进入 observers 数组中的观察者对象，必须自身携带 getVal 方法，要不然你也没依赖 monery 啊，
          // 把你放进来干什么。 表示自己是关注 money 变化的
          observers: [],    // 观察者对象， 数组元素是对象 这个对象有 一个 get 方法， 才能说明是 money 的观察者，因为依赖他
          notifyAll() {  // 通知依赖(观察此变量的观察者们 money 改变了，你们快来获取新值呀)
              console.log('notifyall 调用')
              this.observers.forEach(obj => obj.getVal() )
          },
          add(...args) {
              this.observers.push( ...args )
          }
      },
      setVal(newVal) {
          console.log(this)
          this.value = newVal
          this.dep.notifyAll()
      }
  }
}

var obj1 = {    // 观察者对象1 - 订阅者
  getVal() {
      console.log('obj1收到通知，money改变了，变成了', data.money.value)
  }       
}
var obj2 = {    // 观察者对象2 - 订阅者
  getVal() {
      console.log('obj2 收到通知，money改变了，变成了', data.money.value)
  }       
}
var obj3 = {    // 观察者对象3 - 订阅者
  getVal() {
      console.log('obj3 收到通知，money改变了，变成了', data.money.value)
  }       
}

data.money.dep.add( obj1, obj2, obj3 )
data.money.setVal(500)
