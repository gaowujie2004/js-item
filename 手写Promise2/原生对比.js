console.clear()

let p = new Promise((resolve, reject) => {
  resolve(999)
})
let p2 = p.then(val => {
  console.log(val)
  return 456
})

console.log(p, p2 ,'在主线程中')


setTimeout(_ => {
  console.log(p, p2 ,'<======== 定时器')
})

