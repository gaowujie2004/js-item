;(function(window) {
/*
    Promise 构造函数
        executor 执行器函数  同步回调, 就是 这个函数执行完, 才会去执行 后面的代码
    返回一个  Promise 实例对象 
*/
function Promise(executor) {
    const self = this;
    this.status = 'pending';   // 给promise对象 指定一个 状态属性, 
    this.data = undefined;     // 存储 结果数据 的属性     成功状态的结果  失败状态的结果 就是 异步操作的结果??
    this.callback = [];        // 每个元素的结构: { onResolved() {}, onRejected(){} }


    function resolve(value) {
        // 只能改变一次 状态,
        // 即便是 同一个状态  也不能多次调用

        if (self.status !== 'pending') return;

        self.status = 'resolved';
        self.data = value;
        

        // 要满足 异步执行回调函数
        // 必须是  加到  任务队列中呀.  怎么弄呢?
        // 要把 状态改变 加到 任务队列中
        if (self.callback.length > 0) {
            setTimeout(function() {
                self.callback.forEach(callbacksObj => {
                    callbacksObj.onResolved(value);
                });
                // 这是一个闭包. 闭包无处不在
            });
        }
    }

    function reject(reason) {
        if (self.status !== 'pending') return;

        self.status = 'rejected';
        self.data = reason;

        if (self.callback.length > 0) {
            setTimeout(function() {
                self.callback.forEach(callbacksObj => {
                    callbacksObj.onRejected(reason);
                });
            });
        }
    }


    try {
        // 抛错会改变 状态为  rejected 
        executor(resolve, reject);
    } catch(err) {
        reject(err);
    }
}


/*
Promise的原型对象的 then()
指定成功 和 失败的回调函数
返回一个新的  promise对象
*/
Promise.prototype.then = function(onResolved, onRejected) {
    const self = this;
    // 假设当前的状态是 pending 状态, 将回调函数保存起来  
    // 就是先 指定回调函数, 后改变状态
    self.callback.push({onResolved, onRejected});
};




window.Promise = Promise;

})(window)