import { eucledian } from './utils'

const zeroIfNaN = x => isNaN(x) ? 0 : x

const _dtw = (first, second, distance = eucledian) => {
  const n = first.length
  const m = second.length
  const dtw = new Array(n + 1).fill().map(() => new Array(m + 1).fill(Infinity))
  const path = []
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

  let i = 1
  let j = 1
  while (i <= n && j <= m) {
    const a = Math.abs(dtw[i][j] - (dtw[i - 1][j - 1]))
    const b = Math.abs(dtw[i][j] - (dtw[i - 1][j]))
    const c = Math.abs(dtw[i][j] - (dtw[i][j - 1]))
    const min = Math.min(a, b, c)
    if (min === a) {
      i += 1
      j += 1
    } else if (min === b) {
      i += 1
    } else if (min === c) {
      j += 1
    }
    path.push([i, j])
  }
  while (i <= n) path.push([i++, j])
  while (j <= m) path.push([i, j++])
  path.push([n + 1, m + 1])

  return {
    distance: dtw[n][m],
    matrix: dtw.slice(1).map(row => row.slice(1)),
    path,
  }
}

export const dtwMatrix = (first, second, distance) =>
  _dtw(first, second, distance).matrix

export const dtwDistance = (first, second, distance) =>
  _dtw(first, second, distance).distance

export const dtwMatrixAndDistance = _dtw
