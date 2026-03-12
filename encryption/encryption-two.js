export const encryptionTwo = (param) => {
  // sanity check so we can early return if necessary
  if (param.length === 0 || typeof param !== 'string') return

  // manual array trnasformation from string
  let input = []
  for (let i = 0; i < param.length; i++) {
    input.push(param[i])
  }

  let cleanArr = []
  for (let i = 0; i < input.length; i++) {
    let product = 1
    for (let j = 0; j < input.length; j++) {
      if (j !== i) {
        product *= input[j]
      }
    }

    cleanArr.push(product)
  }

  const threeArr = [...cleanArr, ...cleanArr, ...cleanArr]

  // manual loop through the array and convert number to hex
  for (let i = 0; i < threeArr.length; i++) {
    if (typeof threeArr[i] === 'number') {
      threeArr[i].toString(16)
    } else {
      return
    }
  }

  return threeArr.join('')
}

console.log(encryptionTwo('5936'))
