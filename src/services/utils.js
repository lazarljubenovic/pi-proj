import Meyda from 'meyda/dist/node/main.js'
import * as chroma from 'chroma-js'
import { dtwDistance } from './dtw'


export const extractMfcc = (channelData, sampleRate = 1024) => {
  // const channelData = source.buffer.getChannelData(0)
  const results = []
  for (let i = 0; i < channelData.length - sampleRate; i += sampleRate) {
    const r = Meyda.extract('mfcc', channelData.slice(i, i + sampleRate))
    results.push(r)
  }
  return results
}

export const play = async (ctx, url) => {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
  const source = ctx.createBufferSource()
  source.buffer = audioBuffer
  source.connect(ctx.destination)
  source.start()
}

const micOptions = {audio: true}
const askForMic = () => navigator.mediaDevices.getUserMedia(micOptions)
export const getSourceFromMic = async ctx => {
  const stream = await askForMic()
  const source = ctx.createMediaStreamSource(stream)
  return source
}

export const getSourceFromFile = async (ctx, url) => {
  const source = ctx.createBufferSource()
  const response = await fetch(url)
  const audioData = await response.arrayBuffer()
  console.log('audio data', audioData)
  source.buffer = await ctx.decodeAudioData(audioData)
  return source
}


export const eucledian = (a, b) => Math.hypot(...a.map((x, i) => x - b[i]))
export const getDtwMatrix = (sample, utter) => dtwDistance(sample, utter, eucledian)

export const divergeScale = chroma.scale('RdYlBu').mode('hsl').domain([-12, 12])
export const sequentialScale = chroma.scale('YlGn').mode('hsl').domain([0, 250])
export const mapValueToColor = scale => v => scale(v).css()

export const drawSpectogram = resolution => (ctx, data) => {
  const [componentStep, timeStep] = [resolution, resolution]
  const w = data.length * timeStep
  const h = data[0].length * componentStep
  ctx.canvas.width = w
  ctx.canvas.height = h
  ctx.clearRect(0, 0, w, h)

  for (let x = 0, i = 0; i < data.length; i++, x += timeStep) {
    for (let y = 0, j = 0; j < data[i].length; j++, y += componentStep) {
      ctx.beginPath()
      ctx.fillStyle = mapValueToColor(divergeScale)(data[i][j])
      ctx.rect(x - .5, y - .5, timeStep + 1, componentStep + 1)
      ctx.fill()
      ctx.closePath()
    }
  }
}

export const drawMatrix = resolution => (ctx, data, path) => {
  // data = data.slice(1).map(row => row.slice(1))
  const [xStep, yStep] = [resolution, resolution]
  const w = data[0].length * xStep
  const h = data.length * yStep
  ctx.canvas.width = w
  ctx.canvas.height = h
  console.log(w, h)
  ctx.clearRect(0, 0, w, h)

  for (let y = 0, i = 0; i < data.length; i++, y += yStep) {
    for (let x = 0, j = 0; j < data[0].length; j++, x += xStep) {
      ctx.beginPath()
      ctx.fillStyle = mapValueToColor(sequentialScale)(data[i][j])
      ctx.rect(x - .5, y - .5, xStep + 1, yStep + 1)
      ctx.fill()
      ctx.closePath()
    }
  }

  ctx.beginPath()
  ctx.strokeStyle = 'red'
  ctx.lineWidth = Math.ceil(resolution / 4)
  ctx.lineCap = 'round'
  for (const tile of path) {
    const [i, j] = tile.map(x => x - 1)
    const x = xStep * (j - .5)
    const y = yStep * (i - .5)
    ctx.lineTo(Math.floor(x) + .5, Math.floor(y) + .5)
  }
  ctx.stroke()
}

const findIndexOf = (fn, arr) => {
  let resultIndex = 0
  for (let currentIndex = 1; currentIndex < arr.length; currentIndex++) {
    if (fn(arr[currentIndex], arr[resultIndex])) {
      resultIndex = currentIndex
    }
  }
  return resultIndex
}

export const maxIndex = findIndexOf.bind(null, (curr, acc) => curr > acc)
export const minIndex = findIndexOf.bind(null, (curr, acc) => curr < acc)
