// export function encryptionOne(string) {
//   if (string.length === 0 || typeof string !== 'string') return

//   let result = ''
//   // loop to asii and then do some maths on that asii || turn back to a string and then reverse
//   for (let i = 0; i < string.length; i++) {
//     const asiiCode = string.charCodeAt(i)

//     const transformedCode = (asiiCode * 7 + i * 3) % 256

//     result += String.fromCharCode(transformedCode)
//   }

//   let resultArr = []

//   for (let i = result.length - 1; i >= 0; i--) {
//     resultArr.push(result[i])
//   }

//   return resultArr.join('')
// }

export function encryptionOne(input) {
  if (!input || typeof input !== 'string') return

  let result = ''

  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i)

    // deterministic transformation
    const transformed = (code * 13 + i * 7) % 256

    // convert to 2-digit hex
    const hex = transformed.toString(16).padStart(2, '0')

    result += hex
  }

  return result
}

console.log(encryptionOne('MasterYoda3'))
