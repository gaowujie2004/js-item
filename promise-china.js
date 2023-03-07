const requestChina = [];

function use(promiseCreator) {
  requestChina.push(promiseCreator);
}

function dispatch(config) {
  let promise = Promise.resolve(config);
  while (requestChina.length > 0) {
    const curFn = requestChina.shift();
    promise = promise.then(curFn, curFn);
  }
}
