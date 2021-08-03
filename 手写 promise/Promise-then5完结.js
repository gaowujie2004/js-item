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



    /*
    Promise原型对象的then(): 
    指定成功/失败状态下的回调函数 
    return一个新的Promise对象
    return的Promise对象结果由 onResolved/onRejected 函数的 return 决定

    then函数里面的  回调函数(onResolved, onRejected) 是异步回调.  要加到  任务队列中去执行
    */
    Promise.prototype.then = function(onResolved, onRejected) {
        const _this = this;
        
        // then函数, 传入的不是函数, 那么会穿透.  和错误类似
        
        onResolved = typeof onResolved==='function' ? onResolved : value => value;
        onRejected = typeof onRejected==='function' ? onRejected : reason => {throw reason/*这是函数体*/};

        // then 函数的返回值,  要满足链式调用
        return new Promise((resolve, reject) => {
            // 判断 _this对象的 状态
            
            function handle(callback) {
                try {
                    const result = callback(_this.data);
                    if (result instanceof Promise) {    // result返回值为 Promise

                        result.then(resolve, reject);
                    } else {                            // result返回值为 !Promise
                        resolve(result);
                    }
                } catch(err) {
                    reject(err);
                }
            }

            if (_this.status===RESOLVED) {          //resolved状态
                setTimeout(function() {
                    handle(onResolved);
                });
            } else if (_this.status===REJECTED) {   //rejected状态
                setTimeout(function() {
                    handle(onRejected)
                })
            } else {                                //pending状态, 先指定回调函数, 后调用
                _this.callbacks.push({
                    onResolved() {
                        handle(onResolved)
                    },
                    onRejected() {
                        handle(onRejected)
                    }
                })
            }
        });
    }

    Promise.prototype.catch  = function(onRejected) {
        this.then(null, onRejected);
    }

    /*
    value: 
        原始类型值: 这样的话, Promise.resolve()  返回值是 成功的 data 为 value
        Promise对象: 这样的话, Promise.resolve() 返回的 由 value决定
    */
    Promise.resolve = function(value) {
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {     //Promise值
                if (value.status === RESOLVED) {        //成功-resolved 状态
                    resolve(value.data);
                } else if (value.status === REJECTED) { //失败-rejected 状态
                    reject(value.data);
                } else {                                //等待-pending 状态
                    // 使用这种方式  我没法些 pending状态
                    value.callbacks.push({
                        onResolved: resolve,
                        onRejected: reject
                    });
                }

                // 另一种方法
                // value.then(resolve, reject);
            } else {                            //非Promise
                resolve(value);
            }
        });
    };

    Promise.reject = function(reason) {
        return new Promise((resolve, reject) => {
            reject(reason);
        })
    };


    window.Promise = Promise;
})(window)




