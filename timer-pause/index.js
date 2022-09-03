class Timer {
  constructor(callback, delay) {
    this.callback = callback;
    this.delay = delay;
    // 初始值可以不赋值，但这样做为了让变量类型明确
    this.timerId = -1;
    // 暂停时间戳，也是清除定时器的时间戳
    this.pauseTime = 0;
    // 开始安装定时器时间戳，setTimeout(() => {},  2000)，这就是安装定时器
    this.startTime = 0;

    // 4个状态开关，让边界case更严格
    this.status = {
      // 防止pause（）被多次调用，只有在有定时器时，才能pause（）
      pause: false,
      // 防止resume（）被多次调用，只有在pause（）之后，才能resume（）
      resume: false,
      // 定时器是否安装，防止未安装时就pause（）
      install: false,
      // 防止在未初始化后，就调用pause、resume
      init: false,
    };

    // 在一次轮询中，拿轮播图举例子，就是滚动一张轮播图，定时器累计倒计时时长
    // 初始值一定要为零，因为需要累加
    // 用于resume()，时计算delay值
    this.timerUseTimeOfUnit = 0;
  }

  // 内部方法，清除定时器
  stop() {
    // 边界case
    if (!this.status.install) {
      return;
    }

    this.status.install = false;
    this.status.resume = false;
    this.status.pause = false;
    clearTimeout(this.timerId);
  }

  // 暂停
  pause() {
    // 边界case，未安装定时器或已经被暂停
    if (!this.status.install || this.status.pause) {
      return;
    }
    this.status.pause = true;

    this.pauseTime = Date.now();
    // 暂停时间点 - 定时器安装时间点，得到的是一次定时器倒计时所用时长
    // 需要将已倒计时时长，累加起来
    this.timerUseTimeOfUnit += this.pauseTime - this.startTime;
    // 清除定时器，并做一些状态处理
    this.stop();
    console.info(`%c🇨🇳定时器总共倒计时：`, 'font-size:25px;color:deeppink;', this.timerUseTimeOfUnit);
  }

  // 继续开始倒计时
  resume() {
    // 边界case，只有暂停之后，才可调用resume
    if (this.status.resume) {
      return;
    }
    this.status.resume = true;

    this.startTime = Date.now();
    // todo: 这是最关键的；定时器间隔 - 定时器累计倒计时
    const newDelay = this.delay - this.timerUseTimeOfUnit;
    this.mySetInterval(this.callback, newDelay);
    console.log('安装定时器，delay： ', newDelay);
  }

  // todo: 使用setTimeout，实现setInterval，为什么要这样做？
  mySetInterval(callback, timeout = this.delay) {
    // 定时器安装
    this.status.install = true;

    this.timerId = setTimeout(() => {
      // todo: startTime 为何要赋值？
      this.startTime = Date.now();
      this.pauseTime = 0;
      this.timerUseTimeOfUnit = 0;
      this.status.install = false;

      this.callback();
      this.mySetInterval(callback, this.delay);
    }, timeout);
  }

  init() {
    // 一个Timer实例，只能初始化一次
    if (this.status.init) {
      return;
    }
    this.status.init = true;

    // todo: pauseTime - startTime ，开头时的边界处理
    this.startTime = Date.now();
    this.mySetInterval(this.callback, this.delay);
  }
}
