import React, {Component} from 'react'
import Meyda from 'meyda/dist/node/main.js'
import {getSourceFromMic, getSourceFromFile, drawSpectogram, extractMfcc} from '../services/utils'

let isRecording = false
const startRecording = () => isRecording = true
const endRecording = () => isRecording = false
const toggleRecording = () => isRecording = !isRecording

const drawCurrent = (ctx, data, transformValue = x => x) => {
  const {width: w, height: h} = ctx.canvas
  ctx.clearRect(0, 0, w, h)
  const step = w / data.length
  for (let pos = 0, i = 0; i < data.length; pos += step, i++) {
    ctx.beginPath()
    ctx.rect(pos, h / 2, step, transformValue(data[i]))
    ctx.fill()
    ctx.closePath()
  }
}

const drawTimeLine = (ctx, {mfcc}) => drawSpectogram(ctx, mfcc)

const startLiveExtracting = async audioContext => {
  const source = await getSourceFromMic(audioContext)
  // const source = await getSourceFromFile(audioContext, '/one.mp3')
  // console.log(source)

  const currentCtx = document.querySelector('#current').getContext('2d')
  const timelineCtx = document.querySelector('#timeline').getContext('2d')

  const historyLength = 200
  let mfccHistory = new Array(historyLength).fill(new Array(13).fill(0))

  const liveData = []
  let lives = 10

  const options = {
    audioContext,
    source,
    bufferSize: 1024,
    featureExtractors: ['mfcc'],
    windowingFunction: 'hanning',
    callback: ({mfcc}) => {
      if (lives > 0) {
        if (mfcc.every(x => x === 0)) {
          lives--
          !lives && console.log(liveData)
        } else {
          lives = 10
          liveData.push(mfcc)
        }
      }
      drawCurrent(currentCtx, mfcc)
      mfccHistory = [...mfccHistory, mfcc].slice(-historyLength)
      drawTimeLine(timelineCtx, {mfcc: mfccHistory})
    },
  }
  const analyzer = Meyda.createMeydaAnalyzer(options)

  analyzer.setSource(source)
  analyzer.start()
}

const audioContext = new AudioContext()
setTimeout(() => startLiveExtracting(audioContext), 0)


// Save user recording

// const setUpRecorder = async ctx => {
//   const constraints = {audio: true, video: false}
//   const stream = await navigator.mediaDevices.getUserMedia(constraints)
//
//   console.log(MediaRecorder.isTypeSupported('audio/webm'))
//   const mediaRecorder = new MediaRecorder(stream, {mimeType: 'audio/webm'})
//   mediaRecorder.ondataavailable = ({data}) => {
//     const blob = new Blob([data], {type: 'audio/mp3'})
//     const recordingUrl = URL.createObjectURL(blob)
//     // console.log(blob)
//
//     const fileReader = new FileReader()
//     let arrayBuffer
//
//     fileReader.onloadend = () => {
//       arrayBuffer = fileReader.result
//       const source = ctx.createBufferSource()
//       console.log(source, arrayBuffer)
//       ctx.decodeAudioData(arrayBuffer).then(buffer => {
//         source.buffer = buffer
//       })
//     }
//
//     fileReader.readAsArrayBuffer(blob)
//
//   }
//
//   return mediaRecorder
// }
//
// const startRecorder = (mediaRecorder, duration = 2000) => {
//   mediaRecorder.start(duration)
//   setTimeout(() => {
//     if (mediaRecorder.state !== 'inactive') {
//       mediaRecorder.stop()
//     }
//   }, duration)
// }

export default class Recorder extends Component {
  // async componentDidMount() {
  //   this.mediaRecorder = await setUpRecorder(audioContext)
  // }
  render() {
    return (
      <div>
        <button onClick={toggleRecording}>Record</button>
        <canvas height="200" width="200" id="current"></canvas>
        <canvas height="120" width="800" id="timeline"></canvas>
      </div>
    )
  }
}
