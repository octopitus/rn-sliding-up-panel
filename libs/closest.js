export default function closest(n, arr) {
  let i
  let ndx
  let diff
  let best = Infinity
  let low = 0
  let high = arr.length - 1

  while (low <= high) {
    // eslint-disable-next-line no-bitwise
    i = low + ((high - low) >> 1)
    diff = arr[i] - n

    if (diff < 0) {
      low = i + 1
    } else if (diff > 0) {
      high = i - 1
    }

    diff = Math.abs(diff)

    if (diff < best) {
      best = diff
      ndx = i
    }

    if (arr[i] === n) break
  }

  return arr[ndx]
}
