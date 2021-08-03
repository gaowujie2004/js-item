// 选择排序 - 升序
let arr = [4, 2, 10, 9,      11, 3, 100, 5]
// 选择出最小的下标, 然后 放到合适的位置.

// 趟数循环
// for (let i=0, temp=null; i<arr.length-1; i++) {
//   let minValueIndex = i
//   for (let j=i+1; j<arr.length; j++) {
//     if ( arr[j] < arr[minValueIndex] ) {
//       minValueIndex = j
//     }
//   }
//   // 第 i 趟的最小值下标 OK
//   temp = arr[i]
//   arr[i] = arr[minValueIndex]
//   arr[minValueIndex] = temp
// }
// console.log(arr)




// 插入排序 - 升序
// for (let i=1, temp=null; i<=arr.length-1; i++) {
//   for (let j=i; j>=1; j--) {
//     if (arr[j] < arr[j-1]) {
//       temp = arr[j]
//       arr[j] = arr[j-1]
//       arr[j-1] = temp
//     } else {
//       // 因为 j 前面的已经排好了, 不满足 arr[j] < arr[j-1]  就代表本趟插入OK了
//       break
//     }
//   }
// }
// console.log(arr)


// 快速排序 - 升序

// 分割数组, 分界值索引(交换后的) 
// 分界值索引左侧 - 是小于分界值 ; 右侧是大于或等于分界值
function partition(arr, lo, hi) {
  // 要操作 arr, lo起始下标.   hi 结束下标
  let left = lo
  let right = hi+1
  let middleValue = 
}