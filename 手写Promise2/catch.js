console.clear()
/**
 * 穿透/缺省 OK
*/

function Promise(exec) {
  // 产生3个实例属性

  this.status = 'padding'
  this.data = undefined
  this.callbackQueue = []

  let resolve = value=>{
    // 状态只能改变一次
    if (this.status !== 'padding') { return }
    this.status = 'resolved'
    this.data = value

    this.callbackQueue.forEach(obj => obj.onResolve())
  }

  let reject = reason =>{
    if (this.status !== 'padding') { return }
    this.status = 'rejected'
    this.data = reason

    this.callbackQueue.forEach(obj => obj.onReject())
  }

  try {
    exec(resolve, reject)
  } catch(err) {
    reject(err)
  }
}

function resolvePromise(x, promise2, resolve, reject) {
  /**
   * x:  then中的回调函数的返回值
   * promise: then() 返回的promise
   * resolve: promise2 的resolve,
   * reject:  promise2 的reject
  */

  /***
   * 1、返回值是 Promise实例  -  稍微麻烦
   * 2、返回值不是 Promise实例 - 都包装成 resolve状态Promise
   * 分为两种情况讨论
  */
  try {
    if (x === promise2) {
      throw Error('不能这样做')
      /**
       * let x = p.then(function(val){ return x })
      */
    }

    // 返回值是 Promise实例对象
    if (x instanceof Promise) {
      x.then(resolve, reject)
      // resolve 回调函数，   传入到 then中， 会被回调 并且传入实参值， this.data
      return
    }

    // 返回值不是 Promise实例对象
    resolve(x)
  } catch(err) {
    reject(err)
  }

}

Promise.prototype.then = function(onResolve, onReject){
  // this -> 实例Promise  ->  p.then()
  // then(callbackResolve, callbackReject) 回调函数(callbackResolve / callbackReject)的返回值是个重点
  
  /**
   * 穿透， 为什么这样写？
  */
  onResolve = (typeof onResolve === 'function') ? onResolve : (value => value)
  onReject = (typeof onReject === 'function') ? onReject : (reason => reason) 

  let promise2 = new Promise((resolve, reject) => {
    if (this.status === 'padding') {
      let Resolve = ()=>{
        setTimeout(_=> {
          try {
            let x = onResolve(this.data)
            resolvePromise(x, promise2, resolve, reject)
          } catch(err) {
            reject(err)
          }
        })
      }
      let Reject = ()=>{
        try {
          setTimeout(_=> {
            let x = onReject(this.data)
            resolvePromise(x, promise2, resolve, reject)
          })
        } catch(err) {
          reject(err)
        }
      }
      this.callbackQueue.push({onResolve: Resolve, onReject: Reject})
      return
    }

    if (this.status === 'resolved') {
      // 将 .then()回调函数放入 任务队列 - 异步的 setTimeout模拟的宏任务, 但是原生的是 微任务
      setTimeout(_ => {
        try {
          let x = onResolve(this.data)
          // let promise2 = p.then(callback1, callback2) then里面的回调函数执行了， 其promise2 的状态才会改变，状态改变调用 resolve/reject
          resolvePromise(x, promise2, resolve, reject)
        } catch(err) {
          reject(err)
        }
      })
      return 
    }

    if (this.status === 'rejected') {
      setTimeout(_ => {
        try {
          let x = onReject(this.data)
          // let promise2 = p.then(callback1, callback2) then里面的回调函数执行了， 其promise2 的状态才会改变，状态改变调用 resolve/reject
          resolvePromise(x, promise2, resolve, reject)
        } catch(err) {
          reject(err)
        }
      })
    }
  })

  return promise2
}

Promise.prototype.catch = function(onReject) {
  // catch 也会返回一个 Promise实例对象
  return this.then(null, onReject)
}


let p = new Promise((resolve, reject) => {
  reject(123)
})

let p2 = p.then(val => {
  console.log(val)
  return 456
}, reason => {
  console.log(reason)
  X()
  return 333
})

p2.then(val => console.log(val), reason => console.log('失败状态 失败值=> ', reason))
console.log('1')


