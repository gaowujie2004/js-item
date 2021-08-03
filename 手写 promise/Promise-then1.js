;(function(window) {

    function Promise(executor) {
        // executor: 执行器函数, 是同步回调函数, 意思是: 当这个函数执行完毕时, 后面的同步代码才会执行. 

        // 1. 改状态
        // 2. 存数据
        // 3. 异步执行
        
        const _this = this;
        _this.status = 'pending';
        _this.data = 'undefined';
        _this.callbacks = [];   // 每个元素 {onResolved, onRejected};

        function resolve(value) {

            // 遵循状态只能改变一次的原则
            // 如果已经改变了状态, 那么 再调用 等于没反应;
            if (_this.status !== 'pending') return;

            // 将状态 改为 resolved
            _this.status = 'resolved';

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

            if (_this.status !== 'pending') return;

            _this.status = 'rejected';
            _this.data = reason;

            setTimeout(() => {
                _this.callbacks.forEach(callbackObj => {
                    callbackObj.onRejected(reason);
                });
            });
        }
        
        

        try {
            // 对 resolve reject 有点懵逼
            // resolve, reject(实参) 函数发送给  传递过来的 回调函数
            
            executor(resolve, reject);
        } catch(err) {
            reject(err)
        }

    }


    Promise.prototype.then = function (onResolved, onRejected) {
        // 假设 Promise 实例对象的状态是 pending
        // 先指定回调函数, 保存起来.  然会再改变状态. 
        // 其实就是, 把改变状态的 代码 放到 任务队列中. 

        // 要是不放到任务队列中, 那 resolve(...) 这是同步回调  这个时候 还没指定回调函数呢 
        const _this = this;
        _this.callbacks.push({onResolved, onRejected});

    }





    window.Promise = Promise;
})(window)