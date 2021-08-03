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
  /**
   * 穿透， 为什么这样写？
   * 成功的好理解。
  */
   onResolve = (typeof onResolve === 'function') ? onResolve : (value => value)

   // Promise.reject(-111).then(val => val).catch()  主要是 让第一个 then() 返回一个失败的promise。 
   // 因为 then() 第二个实参省略了。
   onReject = (typeof onReject === 'function') ? onReject : reason => { throw reason }

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
        setTimeout(_=> {
          try {
            let x = onReject(this.data)
            resolvePromise(x, promise2, resolve, reject)
          } catch(err) {
            reject(err)
          }
        })
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

Promise.resolve = function(val) {
  /* val 若是 Promise实例, 则直接返回 */

  if (val instanceof Promise) {
    return val
  }

  /* val 不是Promise */
  return new Promise(resolve => {
    resolve(val)
  })
}

Promise.reject = function(reason) {
  if (reason instanceof Promise) {
    return reason
  }
  
  return new Promise((resolve, reject) => {
    reject(reason)
  })
}

Promise.resolveDelay = function(value, delay=1000) {
  return new Promise((resolve) => {
    setTimeout(_ => {
      resolve(value)
    }, delay)
  })
} 

Promise.rejectDelay = function(reason, delay=1000) {
  return new Promise((resolve, reject) => {
    setTimeout(_ => {
      reject(reason)
    }, delay)
  })
} 

Promise.race = function(promiseArr) {
  /**
   * promiseArr:  迭代结构, 预期每个元素是 promise实例，
   * 也可以是其他数据类型， 自动包装
   *
   * race()  return 一个promise对象, 其结果由第一个完成(无论状态如何resolve/reject)的 promise决定
  */
  return new Promise((resolve, reject) => {
    for (let p of promiseArr) {
      // Promise 实例对象
      if (p instanceof Promise) {
        // 不怕多次执行， 因为状态只会改变一次
        p.then(resolve, reject)
      } else {
        // 非Promise实例对象 - 当成成功的Promise
        return resolve(p)
      }
    }
  })
}

Promise.all = function(promiseArr) {
  /**
   * 传递一个数组， 元素若是非 promise值则会包装
   * 若数组有一个 reject的promise，则 Promise.all() 返回一个失败promise， 值是数组里第一个失败状态的值
   * 若数组都是 reslove状态的promise， 则等到所有的 状态改变后（变成 resolve的promise）， Promise.all()  返回一个成功的 Promise，值是数组
  */
  return new Promise((resolve, reject) => {
    let resArr = []
    for (let i=0; i<promiseArr.length; i++) {
      if (promiseArr[i] instanceof Promise) {
        promiseArr[i].then(val => {
          resArr[i] = val
          // 最后一次循环
          if (i === promiseArr.length-1) {
            resolve(resArr)
          }
        }, err => {
          // 改变一次状态, 以后再次改变 没有效果
          reject(err)
        })
      } else {
        // 不是promise实例
        resArr[i] = promiseArr[i]
      }
    }
  })
}


let p = new Promise((resolve, reject) => {
  reject(123)
})

let p1 = Promise.resolve(1111)
let p2 = 222222
let p3 = new Promise((resolve, reject) => {
  setTimeout(_ => {
    reject(33)
  }, 2000)
})
let p4 = new Promise((resolve, reject) => {
  setTimeout(resolve, 3000, 33333)
})

// Promise.race([Promise.reject(-1111),p3, p2, p1])
// .then(val => {
//   console.log(val)
// })
// .catch(reason => console.log(reason))

// Promise.all([p1, p2, p4, p3]).then(vals => console.log('成功', vals), err => {
//   console.log('失败了', err)
// })


Promise.rejectDelay(1, 1500).then(val => val).catch(reason => console.log('haah'))