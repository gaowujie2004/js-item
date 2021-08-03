console.log('cccccccccccccc')
let p = new Promise((resolve, reject) => {
  setTimeout(_ => {
    resolve(5)
  }, 0)
  console.log('bbbbbbb')
})

console.log('aaaaaaaaaa')

let p2 = p.then(val => {
  console.log(val)
  throw new Error('哈哈')
}).catch(err => console.log(err))

console.log('dddddddddd')
