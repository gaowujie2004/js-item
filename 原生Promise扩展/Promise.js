(function(window) {
    Promise.resolveDelay = function(value, time=0) {
        return new Promise((resolve, reject) => {
            setTimeout(function() {
                if (value instanceof Promise) {
                    value.then(resolve, reject);
                } else {
                    resolve(value);
                }
            }, time);
        });
    };

    Promise.rejectDelay = function(reason, time) {
        setTimeout(reason,);
    }
})(window);