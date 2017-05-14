import React, { Component } from 'react'
import samples from '../services/mfcc-data'
import Comparison from './Comparison'
import { dtwMatrixAndDistance } from '../services/dtw'
import { minIndex } from '../services/utils'

const smallShadow = '0 4px 4px rgba(0, 0, 0, .4), 0 0 12px rgba(0, 0, 0, .06)'
const largeShadow = '0 6px 6px rgba(0, 0, 0, .6), 0 0 12px rgba(0, 0, 0, .06)'

export default class Results extends Component {

  constructor(props) {
    super(props)
    this.state = {
      data: [],
      min: -1,
    }
  }

  componentWillReceiveProps({utter}) {
    // console.log('results component will receive props', utter)
    const data = samples.map(sample => ({sample, ...dtwMatrixAndDistance(sample, utter)}))
    const min = minIndex(data.map(x => x.distance))
    this.setState({data, min})
  }

  render() {
    return (
      <section style={{
        display: 'flex', flexWrap: 'wrap', width: '100%', alignItems: 'center',
        justifyContent: 'space-around',
      }}>
        {
          this.state.data.map(({sample, matrix, distance, path}, i) =>
            <article key={i} style={{
              borderRadius: '3px',
              boxShadow: i === this.state.min ? largeShadow : smallShadow,
              border: i === this.state.min ? '.2rem solid tomato' : '.2rem solid transparent',
              marginRight: i === this.state.data.length - 1 ? '1rem' : '0',
              marginBottom: '1rem',
            }}>
              <Comparison sample={sample} utter={this.props.utter} matrix={matrix} path={path}
                          distance={distance} name={i + 1}/>
            </article>,
          )
        }
      </section>
    )
  }

}
