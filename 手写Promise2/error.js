function outer(v) {
  console.log('外层')
  function inner() {
    function son() {
      x()()
    }
    v()
    son()
    
  }
  inner()
}

try {
  outer(function() {
    sdfsdfsf()
  })
}catch(err) {
  console.log('有', err)
}