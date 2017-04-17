import React, {Component} from 'react'
import {drawSpectogram, drawMatrix} from '../services/utils'
import {dtwMatrix} from '../services/dtw'

export default class Comparison extends Component {
  componentDidMount() {
    const {sample, utter} = this.props
    drawSpectogram(this.refs.sample.getContext('2d'), sample)
    drawSpectogram(this.refs.utter.getContext('2d'), utter)
    drawMatrix(this.refs.matrix.getContext('2d'), dtwMatrix(sample, utter))
  }
  render() {
    return (
      <div>
        <canvas ref="sample" width="100" height="40"></canvas>
        <canvas ref="utter" width="100" height="40"></canvas>
        <canvas ref="matrix" width="100" height="100"></canvas>
      </div>
    )
  }
}
