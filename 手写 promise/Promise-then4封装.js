// 继续完善    pending  rejected 状态
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
    // 三种情况
        // 1. 非 Promise 实例对象值
            
        // 2. Promise 实例对象值

        // 3. 抛出错误

    Promise.prototype.then = function (onResolved, onRejected) {
        const _this = this;

        // 这样的话  向后传递一个 成功的 value
        onResolved = typeof onResolved==='function' ? onResolved : value => value;

        // reason => {}  这是一个 函数啊......  reason 是形参... 
        // 为什么不是  return reason ? 如果这样, then() 的返回的就是 一个 成功状态的 promise对象
        onRejected = typeof onRejected==='function' ? onRejected : reason => {throw reason};

        return new Promise((resolve, reject) => {

            
            function handle(callback) {
                // 封装
                // 根据执行结果, 改变return的promise的状态
                // 为什么要 写到这里呢? 写到 return 外面行不行?
                try {
                    const result = callback(_this.data);
                     if (result instanceof Promise) {
                         // Promise值
                         result.then(resolve, reject)
                     } else {
                         // 非Promise值
                         resolve(result);
                     }
                } catch(err) {
                     reject(err);
                }
            }
        
            
            if (_this.status === PENDING) {
                // pending 调用被延迟 指定先执行
                _this.callbacks.push({
                    onResolved() {
                        handle(onResolved);
                    },
                    onRejected() {
                        handle(onRejected);
                    }
                });
            } else if (_this.status === RESOLVED) {
                // resolved 异步执行 onResolved 回调函数, 并改变return的promise状态
                // 要是不嵌套到 定时器中  那就是 同步回调函数了.
                setTimeout(function() {
                    handle(onResolved);
                });
            } else {
                // rejected 异步执行 onRejected 回调函数, 并改变return的状态
                setTimeout(function() {
                    handle(onRejected);
                });
            }
        });

    }

    Promise.prototype.catch = function(onRejected) {
        this.then(undefined, onRejected);
    };




    window.Promise = Promise;
})(window)