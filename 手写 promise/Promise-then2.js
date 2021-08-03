;(function(window) {

    // 状态
    const PENDING = 'pending',
          RESOLVED = 'resolved',
          REJECTED = 'rejected';

    function Promise(executor) {
        // executor: 执行器函数, 是同步回调函数, 意思是: 当这个函数执行完毕时, 后面的同步代码才会执行. 

        // 1. 改状态
        // 2. 存数据
        // 3. 异步执行
        
        const _this = this;
        _this.status = PENDING;
        _this.data = 'undefined';
        _this.callbacks = [];   // 每个元素 {onResolved, onRejected};

        function resolve(value) {

            // 遵循状态只能改变一次的原则
            // 如果已经改变了状态, 那么 再调用 等于没反应;
            if (_this.status !== PENDING) return;

            // 将状态 改为 resolved
            _this.status = RESOLVED;

            // 保存 value 值
            _this.data = value;

            
            // 如果有待执行的 callback ,就是 then(callback)  里面那个回调函数
            // 怎么 异步执行这个回调函数,  就是  把这个回调函数 加到 任务队列?
            // 为什么要 异步执行这个 callback 因为 你是把 执行写在前面,  绑定写到后面

            if (_this.callbacks.length > 0) {
                setTimeout(function() {
                    _this.callbacks.forEach(callbackObj => {
                        callbackObj.onResolved(value);
                    });
                });
            }

        }

        function reject(reason) {

            if (_this.status !== PENDING) return;

            _this.status = REJECTED;
            _this.data = reason;

            if (_this.callbacks.length > 0) {
                setTimeout(() => {
                    _this.callbacks.forEach(callbackObj => {
                        callbackObj.onRejected(reason);
                    });
                });
            }
        }
        
        
        try {
            // 对 resolve reject 有点懵逼
            // resolve, reject(实参) 函数发送给  传递过来的 回调函数
            
            executor(resolve, reject);
        } catch(err) {
            reject(err)
        }

    }


    // 返回新的 Promise 实例对象 状态结果 由谁决定?
    // 难就难在 then() 返回值
    // 三种返回值 
        // 1. 非 Promise 实例对象值
            
        // 2. Promise 实例对象值

        // 3. 抛出错误

    Promise.prototype.then = function (onResolved, onRejected) {
        const _this = this;
        // _this -> p
        
        return new Promise((resolve, reject) => {
            // 掉用 成功 还是 失败, 跟 上面有关系(onResolved/onRejected 函数的 return 值有关)
            if (_this.status === PENDING) {
                _this.callbacks.push({
                    onResolved,
                    onRejected
                });
            } else if (_this.status === RESOLVED) {
                setTimeout(function() {
                    /*
                    1. 如果抛出异常, return 的 Promise实例对象的状态 就会变为 rejected, reason 就是 error
                    2. onResolved/onRejected return 值 为非Promise值, 那么then()返回的新的 Promise对象 的 状态为 成功, value 为 return值
                    3. onResolved/onRejected return 值 是Promise值, return 的promise结果 就是这个 promise
                    */
                   try {
                       const result = onResolved(_this.data);
                        if (result instanceof Promise) { // 是Promise对象值 这一步很难理解
                            // result.then(
                            //     value => resolve(value), // 当 result成功时,  return的 Promise对象 就会成功, value就是 返回的值
                            //     reason => reject(reason)
                            // )

                            /*
                            result.then(), 调用 then()  resolve  reject 分别是
                            实参, 传递给   onResolved  onRejected 形参
                            */
                            result.then(resolve, reject)
                        } else { // 非Promise对象值
                            resolve(result);
                        }
                   } catch(err) {
                        reject(err);
                   }
                });
            } else {
                setTimeout(function() {
                    onRejected(_this.data);
                });
            }
        });

    }





    window.Promise = Promise;
})(window)




