import React, { Component } from 'react'
import Meyda from 'meyda/dist/node/main.js'
import { drawSpectogram, getSourceFromMic, trimMfcc } from '../services/utils'
import Results from './Results.jsx'
import './Recorder.css'

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

    const canvasWaves = this.refs['waves']
    const ctx = canvasWaves.getContext('2d')
    const {width: w, height: h} = canvasWaves

    // Let user accept if he wants to use the mic
    const source = await getSourceFromMic(audioContext)

    // we hook the source up with the meyda analyzer
    let featureBuffer = []
    const options = {
      audioContext,
      source,
      bufferSize: 1024,
      windowingFunctions: 'hamming',
      featureExtractors: 'mfcc',
      callback: features => {
        currentUtter.push(features)
        featureBuffer.push(features)
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
        ctx.lineTo(w / 2 - pos, h / 2 - frequencyData[i] * h / 512)
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
        <div style={{position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <canvas height="400" width="800" ref="waves" style={{maxWidth: '100%'}}/>
          <button autoFocus id="mic" onClick={this.toggleRecording}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58" width="120" height="120">
              <path style={{fill: 'rgba(0, 0, 0, .3)'}} d="M44 28c-.6 0-1 .4-1 1v6c0 7.7-6.3 14-14 14s-14-6.3-14-14v-6c0-.6-.4-1-1-1s-1 .4-1 1v6c0 8.5 6.6 15.4 15 16v5h-5c-.6 0-1 .4-1 1s.4 1 1 1h12c.6 0 1-.4 1-1s-.4-1-1-1h-5v-5c8.4-.6 15-7.5 15-16v-6c0-.6-.4-1-1-1z"/>
              <path style={{fill: 'rgba(0, 0, 0, .3)'}} d="M29 46c6 0 11-5 11-11V11c0-6-5-11-11-11S18 5 18 11v24c0 6 5 11 11 11zm-9-35c0-5 4-9 9-9s9 4 9 9v24c0 5-4 9-9 9s-9-4-9-9V11z"/>
            </svg>
          </button>
        </div>
        <Results utter={trimMfcc(currentUtter)}/>
      </div>
    )
  }
}
