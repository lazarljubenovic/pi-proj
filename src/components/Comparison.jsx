import React, { Component } from 'react'
import { drawMatrix, drawSpectogram } from '../services/utils'

const square = size => ({width: size, height: size})
const center = {display: 'flex', justifyContent: 'center', alignItems: 'center'}
const vertical = {flexDirection: 'column'}

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
        <div style={{
          position: 'relative',
          width: this.resolution * (13 + this.props.utter.length),
          height: this.resolution * (13 + this.props.sample.length),
        }}>
          <canvas style={{
            position: 'absolute',
            transform: 'rotate(90deg) translate(0%, -100%)',
            transformOrigin: 'top left',
            top: 0,
            left: 0,
          }} ref="sample"/>
          <canvas style={{position: 'absolute', bottom: 0, right: 0}} ref="utter"/>
          <canvas style={{position: 'absolute', top: 0, right: 0}} ref="matrix"/>
          <span style={{
            position: 'absolute', ...square(this.resolution * 13),
            bottom: 0,
            left: 0,
            color: 'rgba(0, 0, 0, .4)',
            fontSize: '.66em',
            fontStyle: 'italic',
            ...center, ...vertical,
          }}>
            <span style={{
              fontSize: '1.5em',
              fontStyle: 'normal',
              display: 'block',
              marginBottom: '.2rem',
              color: 'rgba(0, 0, 0, .6)',
            }}>{this.props.name}</span>
            <span>{this.props.distance && this.props.distance.toFixed(2)}</span>
          </span>
        </div>
      </div>
    )
  }

}
