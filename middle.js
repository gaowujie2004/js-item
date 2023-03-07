class Middleware {
  middlewareFnList = [];

  // mwFn: (ctx, next) => {}
  use(mwFn) {
    this.middlewareFnList.push(mwFn);
  }

  dispatch(ctx) {
    const impl = (currentIndex) => {
      const curMw = this.middlewareFnList[currentIndex];
      if (!curMw) return;

      curMw(
        ctx, // 上下文
        () => impl(currentIndex + 1)
      );
    };

    impl(0);
  }
}

const mw = new Middleware();

mw.use((ctx, next) => {
  console.log('11 start', ctx);
  next();
  console.log('11 end');
});

mw.use((ctx, next) => {
  console.log('2222 start');

  next();
  console.log('2222 end');
});

mw.use((ctx, next) => {
  console.log('33333333 start');

  next();
  console.log('33333333 end');
});

mw.dispatch({ name: 'g' });
