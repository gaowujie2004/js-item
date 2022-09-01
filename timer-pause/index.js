class Timer {
  constructor(callback, delay) {
    this.callback = callback;
    this.delay = delay;
    this.timerId = -1;
    this.pauseTime = 0;
    this.startTime = 0;
    this.isInit = false;
    this.status = {
      pause: false,
      resume: false,
      install: false,
    };
    // 在一次生命周期中，定时器累计计时多久
    this.timerUseTimeOfUnit = 0;
  }

  // 清除定时器
  stop() {
    // 没有安装定时器并且，是暂停状态
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
    // 特殊边界case
    if (!this.status.install || this.status.pause) {
      return;
    }
    this.status.pause = true;

    this.pauseTime = Date.now();
    this.timerUseTimeOfUnit += this.pauseTime - this.startTime;
    this.stop();
    console.info(`%c🇨🇳定时器总共倒计时：`, 'font-size:25px;color:deeppink;', this.timerUseTimeOfUnit);
  }

  // 继续开始
  resume() {
    if (this.status.resume) {
      return;
    }
    this.status.resume = true;

    this.startTime = Date.now();
    const newDelay = this.delay - this.timerUseTimeOfUnit;
    this.mySetInterval(this.callback, newDelay);
    console.log(`安装定时器，delay： ${newDelay}`);
  }

  mySetInterval(callback, timeout = this.delay) {
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
    if (this.isInit) {
      return;
    }
    this.isInit = true;

    // pauseTime - startTime ，开头时的边界处理
    this.startTime = Date.now();
    this.mySetInterval(this.callback, this.delay);
  }
}
