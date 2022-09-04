class SchedulerPromise {
  queue = [];
  workingNumber = 0;
  constructor(maxNumber) {
    this.maxNumber = maxNumber;
  }

  // 函数返回promise
  addTask(promiseCreator) {
    this.queue.push(promiseCreator);
  }

  doNext() {
    while (this.queue.length > 0 && this.workingNumber < this.maxNumber) {
      this.workingNumber++;
      const promiseCreator = this.queue.shift();

      promiseCreator().finally(() => {
        this.workingNumber--;
        this.doNext();
      });
    }
  }

  start() {
    this.doNext();
  }
}

const schedulerPromise = new SchedulerPromise(2);

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

function testA() {
  schedulerPromise.addTask(async () => {
    console.log('A');

    await sleep(10000);
  });
  schedulerPromise.addTask(async () => {
    console.log('B');

    await sleep(90000);
  });

  schedulerPromise.addTask(async () => {
    console.log('C');
  });
  schedulerPromise.addTask(async () => {
    console.log('D');
  });

  schedulerPromise.addTask(async () => {
    console.log('E');
  });

  schedulerPromise.start();
}
