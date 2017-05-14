import React, { Component } from 'react'
import { sequentialScale, drawMatrix, drawSpectogram, mapValueToColor } from '../services/utils'


export default class Comparison extends Component {

  resolution = 5

  componentDidMount() {
    const {sample, utter, matrix, path} = this.props
    if (utter.length === 0) return
    drawSpectogram(this.resolution)(this.refs.sample.getContext('2d'), sample)
    drawSpectogram(this.resolution)(this.refs.utter.getContext('2d'), utter)
    drawMatrix(this.resolution)(this.refs.matrix.getContext('2d'), matrix, path)
  }

  componentWillReceiveProps(props) {
    const {sample, utter, matrix, path} = props
    if (utter.length === 0) return
    drawSpectogram(this.resolution)(this.refs.sample.getContext('2d'), sample)
    drawSpectogram(this.resolution)(this.refs.utter.getContext('2d'), utter)
    drawMatrix(this.resolution)(this.refs.matrix.getContext('2d'), matrix, path)
  }

  render() {
    // console.log('rendering', this.props)
    return (
      <div>
        <span>{this.props.distance && this.props.distance.toFixed(2)}</span>
        <div style={{
          border: '1px solid black',
          position: 'relative',
          width: this.resolution * (13 + this.props.utter.length),
          height: this.resolution * (13 + this.props.sample.length),
        }}>
          <canvas style={{position: 'absolute', transform: 'rotate(90deg) translate(0%, -100%)', transformOrigin: 'top left', top: 0, left: 0}} ref="sample"/>
          <canvas style={{position: 'absolute', bottom: 0, right: 0}} ref="utter"/>
          <canvas style={{position: 'absolute', top: 0, right: 0}} ref="matrix"/>
        </div>

        <table style={{borderCollapse: 'collapse', display: 'none'}}>
          <tbody>
          { this.props.matrix.map((row, i) => <tr key={i}>
            { row.map((cell, j) => <td key={j}
                                       style={{
                                         backgroundColor: mapValueToColor(sequentialScale)(cell),
                                         maxWidth: 20,
                                         maxHeight: 20,
                                         fontSize: 10,
                                         textAlign: 'center',
                                       }}>{cell === Infinity ? '∞' : cell.toFixed(0)}</td>) }
          </tr>) }
          </tbody>
        </table>
      </div>
    )
  }

}
