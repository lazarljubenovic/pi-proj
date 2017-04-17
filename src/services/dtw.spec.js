import {dtwDistance, prunedDtw} from './dtw'

const absolute = (a, b) => Math.abs(a - b)
const eucledian = (a, b) => Math.hypot(...a.map((x, i) => x - b[i]))

describe(`dtwDistance`, () => {

  it(`should work when arrays are the same`, () => {
    const first = [1, 2, 3, 4, 5, 6]
    const second = [1, 2, 3, 4, 5, 6]
    expect(dtwDistance(first, second, absolute)).toBe(0)
  })

  it(`should work when the scale is linear`, () => {
    const first = [1, 2, 3]
    const second = [1, 1, 2, 2, 3, 3]
    expect(dtwDistance(first, second, absolute)).toBe(0)
    expect(dtwDistance(second, first, absolute)).toBe(0)
  })

  it(`should work when the time is warped`, () => {
    const first = [1, 1, 1, 1, 1, 2, 3, 3, 4, 5, 5, 5]
    const second = [1, 2, 2, 3, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5]
    expect(dtwDistance(first, second, absolute)).toBe(0)
    expect(dtwDistance(second, first, absolute)).toBe(0)
  })

  it(`should return non-zero price when not perfect match`, () => {
    const first = [1, 2, 3, 4, 5, 5, 7, 8]
    const second = [1, 2, 3, 4, 5, 6, 7, 8]
    expect(dtwDistance(first, second, absolute)).toBe(1)
    expect(dtwDistance(second, first, absolute)).toBe(1)
  })

  it(`should work with a more complex comparison function`, () => {
    const first = [
      [0, 0, 0],
      [1, 1, 1],
    ]
    const second = [
      [0, 0, 0],
      [1, 1, 1],
    ]
    expect(dtwDistance(first, second, eucledian)).toBe(0)
  })

  it(`should work for two random 1000-element arrays`, () => {
    const first = Array(500).fill().map(() => Math.random())
    const second = Array(500).fill().map(() => Math.random())
    const result = dtwDistance(first, second, absolute)
    expect(typeof result).toBe('number')
    expect(isNaN(result)).toBe(false)
  })

})

describe(`prunedDtw`, () => {

  it(`should work when arrays are the same`, () => {
    const first = [1, 2, 3, 4, 5]
    const second = [1, 2, 3, 4, 5]
    expect(prunedDtw(first, second, Infinity, 1, absolute)).toBe(0)
  })

  it(`should return the same number as basic algorithm did for random`, () => {
    const first = Array(500).fill().map(() => Math.random())
    const second = Array(500).fill().map(() => Math.random())
    const r1 = dtwDistance(first, second, absolute)
    const r2 = prunedDtw(first, second, Infinity, 100, absolute)
    expect(r1).toEqual(r2)
  })

})
