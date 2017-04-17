import Meyda from 'meyda/dist/node/main.js'
import * as chroma from 'chroma-js'

import {dtwDistance} from './dtw'


export const extractMfcc = (channelData, sampleRate = 1024) => {
  // const channelData = source.buffer.getChannelData(0)
  console.log('channel data', channelData)
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
  console.log(source)
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
export const getDtwMatrix = (sample, utter) =>
  dtwDistance(sample, utter, eucledian)

const divergeScale = chroma.scale('RdYlBu').mode('hsl').domain([-12, 12])
const sequentialScale = chroma.scale('YlGn').mode('hsl').domain([0, 800])
const mapValueToColor = scale => v => scale(v).css()

export const drawSpectogram = (ctx, data) => {
  const {width: w, height: h} = ctx.canvas
  ctx.clearRect(0, 0, w, h)

  const componentStep = h / data[0].length
  const timeStep = w / data.length

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

export const drawMatrix = (ctx, data) => {
  const {width: w, height: h} = ctx.canvas
  ctx.clearRect(0, 0, w, h)

  const xStep = w / data.length
  const yStep = h / data[0].length

  for (let x = 0, i = 0; i < data.length; i++, x += xStep) {
    for (let y = h, j = 0; j < data[0].length; j++, y -= yStep) {
      ctx.beginPath()
      ctx.fillStyle = mapValueToColor(sequentialScale)(data[i][j])
      ctx.rect(x - .5, y - .5, xStep + 1, yStep + 1)
      ctx.fill()
      ctx.closePath()
    }
  }
}
