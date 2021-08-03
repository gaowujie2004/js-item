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
    
    Promise.prototype.then = function(onResolved, onRejected) {
        /*
    Promise原型对象的then(): 
    指定成功/失败状态下的回调函数 
    return一个新的Promise对象
    return的Promise对象结果由 onResolved/onRejected 函数的 return 决定

    then函数里面的  回调函数(onResolved, onRejected) 是异步回调.  要加到  任务队列中去执行
    */
        
             
        const _this = this;
        onResolved = typeof onResolved==='function' ? onResolved : value => value;
        onRejected = typeof onRejected==='function' ? onRejected : reason => {throw reason};

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
        Promise对象: 这样的话, Promise.resolve() 返回的promise状态 由 value决定
    */
    Promise.resolve = function(value) {
        // 不是规范里描述的
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {     //Promise值
                value.then(resolve, reject);
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

    Promise.resolveDelay = function(value, time) {
    /*
    返回一个 promise对象, 在指定的时间之后, 才可是改变状态
    */
        return new Promise((resolve, reject) => {
            setTimeout(function() {
                if (value instanceof Promise) {
                    value.then(resolve, reject);
                } else {
                    resolve(value);
                }
            }, time);
        })
    };

    Promise.rejectDelay = function(reason, time) {
    /*
    返回一个 promise对象, 在指定时间后, 改变成 失败状态
    */
        return new Promise((resolve, reject) => {
            setTimeout(function() {
                reject(reason);
            }, time);
        })
    };


    Promise.all = function(arr) {
        // 数组 arr 的元素可以不是 promise对象, 也可以是 非promise对象

        // return 一个Promise对象 如果数组里的都成功, 那么 Promise对象的 data 为数组
        // 如果都成功, return 的promise对象的状态是  成功的
        const values = new Array(arr.length);
        let arrCount = 0;
        return new Promise((resolve, reject) => {
            arr.forEach((p, index) => {
                if (p instanceof Promise) {
                    p.then(
                        value => {
                            arrCount++;
                            values[index] = value;
    
                            if (arrCount===arr.length) {
                                resolve(values);
                                // 是values  不是value
                            }
                        },
                        reason => {
                            reject(reason);
                            // return 的promise对象的状态为 rejected , 状态只能改变一次, 
                            // 一旦改变 在执行 reject()无效
                        }
                    );
                } else {
                    values[index] = p;
                    arrCount++;
                }
                
                // 这种方式有问题  我感觉是 Promise.resolve 的'问题'
                // Promise.resolve(p).then(
                //     value => {
                //         arrCount++;
                //         values[index] = value;
                        

                //         if (values.length===arr.length) {
                //             resolve(values);
                //             // 是values 不是 value
                //         }
                //     },
                //     reason => {
                //         reject(reason);
                //     }
                // )
            });
        });
    };

    Promise.race = function(arr) {
        /*
        race()  return 一个promise对象, 其结果由第一个完成(无论状态如何)的 promise决定
        */

        
        return new Promise((resolve, reject) => {
            arr.forEach(p => {
                if (p instanceof Promise) {
                    p.then(
                        value => {
                            resolve(value);
                            // 改变的是 return 的promise的状态
    
                            // 看哪那个 异步回调函数先执行
                        },
                        reason => {
                            reject(reason);
                            // 改变的是 return 的promise的状态
                        }
                    );
                } else {
                    // 非promise对象
                    resolve(p);
                }
            });
        });

    };


    window.Promise = Promise;
})(window)





