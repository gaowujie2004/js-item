/**================================== 开始封装 **/
function asyncSleep(delay, isResolve = true, resultValue = null) {
  return new Promise((resolve, reject) => {
    let execute;

    if (typeof isResolve === 'function') {
      execute = isResolve;
    } else {
      execute = isResolve ? resolve : reject;
    }

    setTimeout(() => {
      execute(resultValue);
    }, delay);
  });
}

// 这是比较下层的函数。
requestWithinTimeout.TIME_ERR = Symbol('TIMEOUT_ERROR');
function requestWithinTimeout({ timeout, isTimeoutThrow = true }) {
  // 高阶函数，参数缓存，其实这是合理化
  return async (requestPromise) => {
    function onFulfilled(retValue) {
      if (retValue === requestWithinTimeout.TIME_ERR) {
        throw retValue;
      }
      return retValue;
    }

    function onRejectd(err) {
      if (err === requestWithinTimeout.TIME_ERR) {
        // 超时
        if (isTimeoutThrow) {
          throw err;
        } else {
          return err;
        }
      } else {
        // 接口
        throw err;
      }
    }

    try {
      const retValue = await Promise.race([requestPromise, asyncSleep(timeout, !isTimeoutThrow, requestWithinTimeout.TIME_ERR)]);
      return onFulfilled(retValue);
    } catch (err) {
      return onRejectd(err);
    }
  };
}

/**================================== 使用 **/
const requestWithin50ms = requestWithinTimeout({
  timeout: 50,
  isTimeoutThrow: true,
});

const getUserInfo = asyncSleep(100, true, '成功');
requestWithin50ms(getUserInfo)
  .then((val) => {
    console.log('success222', val);
  })
  .catch((err) => {
    if (requestWithinTimeout.TIME_ERR === err) {
      return console.log('超时错误', err);
    }
    console.log('接口错误', err);
  });

// requestWithinTimeout.TIME_ERR 进行判断，是否是超时
