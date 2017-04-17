import {eucledian} from './utils'

const zeroIfNaN = x => isNaN(x) ? 0 : x

const _dtw = (first, second, distance = eucledian) => {
  const n = first.length
  const m = second.length
  const dtw = Array(n + 1).fill().map(() => Array(m + 1).fill(Infinity))
  dtw[0][0] = 0

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = distance(first[i - 1], second[j - 1])
      dtw[i][j] = cost + Math.min(
        zeroIfNaN(dtw[i - 1][j]),
        zeroIfNaN(dtw[i][j - 1]),
        zeroIfNaN(dtw[i - 1][j - 1]),
      )
    }
  }

  return {
    distance: dtw[n][m],
    matrix: dtw,
  }
}

export const dtwMatrix = (first, second, distance) =>
  _dtw(first, second, distance).matrix

export const dtwDistance = (first, second, distance) =>
  _dtw(first, second, distance).distance

export const prunedDtw = (first, second, windowSize, upperBound, distance) => {
  const n = first.length
  const m = second.length
  first = [NaN, ...first]
  second = [NaN, ...second]
  let startColumn = 1
  let endColumn = 1
  const dtw = Array(n + 1).fill().map(() => Array(m + 1).fill(Infinity))
  dtw[0][0] = 0

  for (let i = 1; i <= n; i++) {
    const beg = Math.max(startColumn, i - windowSize)
    const end = Math.min(i + windowSize, second.length - 1)
    let smallerFound = false
    let endColumnNext = i

    for (let j = beg; j <= end; j++) {
      dtw[i][j] = distance(first[i], second[j]) + Math.min(
        zeroIfNaN(dtw[i - 1][j]),
        zeroIfNaN(dtw[i][j - 1]),
        zeroIfNaN(dtw[i - 1][j - 1]),
      )

      if (dtw[i][j] > upperBound) {
        if (!smallerFound) {
          startColumn = j + 1
        }
        if (j >= endColumn) {
          break
        }
      } else {
        smallerFound = true
        endColumnNext = j + 1
      }

    }
    endColumn = endColumnNext
  }

  return dtw[n][m]
}
