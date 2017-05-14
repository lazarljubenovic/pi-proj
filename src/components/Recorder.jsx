import React, {Component} from 'react'
import Meyda from 'meyda/dist/node/main.js'
import {getSourceFromMic, drawSpectogram} from '../services/utils'
import Results from './Results.jsx'

const audioContext = new AudioContext()

let mediaRecorder
let meydaAnalyzer

const initializeMediaDevices = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({audio: true})
  mediaRecorder = new MediaRecorder(stream)
}
setTimeout(initializeMediaDevices)

let currentUtter = []

export default class Recorder extends Component {

  constructor(props) {
    super(props)
    this.state = {
      currentUtter: [],
    }
  }

  isRecording = false
  timer

  componentDidMount = async () => {

    const canvasMfcc = this.refs['mfcc']
    const canvasWaves = this.refs['waves']
    const ctx = canvasWaves.getContext('2d')
    const {width: w, height: h} = canvasWaves

    // Let user accept if he wants to use the mic
    const source = await getSourceFromMic(audioContext)

    // we hook the source up with the meyda analyzer
    let featureBuffer = new Array(100).fill(null).map(_ => new Array(13).fill(0))
    const options = {
      audioContext,
      source,
      bufferSize: 1024,
      windowingFunctions: 'hamming',
      featureExtractors: 'mfcc',
      callback: features => {
        currentUtter.push(features)
        featureBuffer.push(features)
        featureBuffer = featureBuffer.slice(-100)
        drawSpectogram(canvasMfcc.getContext('2d'), featureBuffer)
      },
    }
    meydaAnalyzer = Meyda.createMeydaAnalyzer(options)
    // meydaAnalyzer.start()

    // Create the analyzer and extract data for the wave to be visualized
    const analyzer = audioContext.createAnalyser()
    source.connect(analyzer)
    analyzer.fftSize = 1024
    const frequencyData = new Uint8Array(analyzer.fftSize / 2)

    // Prepare gradient for the wave visualization
    const waveGradient = ctx.createLinearGradient(0, 0, w, 0)
    waveGradient.addColorStop(0, 'navy')
    waveGradient.addColorStop(.5, 'tomato')
    waveGradient.addColorStop(1, 'navy')

    const step = w / frequencyData.length / 2
    const drawWaves = () => {
      requestAnimationFrame(drawWaves)
      analyzer.getByteFrequencyData(frequencyData)

      ctx.globalCompositeOperation = 'copy'
      ctx.clearRect(0, 0, w, h)

      // Draw frequency data four times, symmetric
      ctx.beginPath()
      ctx.moveTo(w / 2, h / 2 + frequencyData[0] * h / 512)
      for (let i = 0, pos = step; i < frequencyData.length; i++, pos += step) {
        ctx.lineTo(w / 2 + pos, h / 2 + frequencyData[i] * h / 512)
      }
      for (let i = frequencyData.length - 1, pos = step; i >= 0; i--, pos += step) {
        ctx.lineTo(w - pos, h / 2 - frequencyData[i] * h / 512)
      }
      for (let i = 0, pos = step; i < frequencyData.length; i++, pos += step) {
        ctx.lineTo(w / 2- pos, h / 2 - frequencyData[i] * h / 512)
      }
      for (let i = frequencyData.length - 1, pos = step; i >= 0; i--, pos += step) {
        ctx.lineTo(pos, h / 2 + frequencyData[i] * h / 512)
      }
      ctx.fill()
      ctx.closePath()

      ctx.globalCompositeOperation = 'source-atop'
      if (this.isRecording) {
        ctx.fillStyle = waveGradient
      } else {
        ctx.fillStyle = 'rgba(0,0,0,.1)'
      }
      ctx.fillRect(0, 0, w, h)
    }
    drawWaves()

  }

  startRecording = async () => {
    mediaRecorder.start()
    currentUtter = []
    meydaAnalyzer.start()
    this.isRecording = true
    this.timer = setTimeout(() => this.stopRecording(), 2000)
  }

  stopRecording = () => {
    mediaRecorder.stop()
    meydaAnalyzer.stop()
    this.setState({currentUtter})
    clearTimeout(this.timer)
    this.isRecording = false
  }

  toggleRecording = () => !this.isRecording ? this.startRecording() : this.stopRecording()

  render() {
    return (
      <div>
        <canvas height="400" width="400" ref="waves"/>
        <canvas height="200" width="600" ref="mfcc"/>
        <button onClick={this.toggleRecording}>Toggle</button>
        <section>
          <Results utter={currentUtter}/>
        </section>
      </div>
    )
  }
}
