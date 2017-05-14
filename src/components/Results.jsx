import React, { Component } from 'react'
import samples from '../services/mfcc-data'
import Comparison from './Comparison'
import {dtwMatrixAndDistance} from '../services/dtw'
import {minIndex} from '../services/utils'

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
    // console.log('results render', this.props, this.state)
    return (
      <section style={{display: 'flex'}}>
        {
          this.state.data.map(({sample, matrix, distance, path}, i) =>
            <article key={i}>
              <span>{i === this.state.min ? 'THIS!' : ''}</span>
              <Comparison sample={sample} utter={this.props.utter} matrix={matrix} path={path} distance={distance}/>
              {/*<pre>{ JSON.stringify(sample.length, null, 2) }</pre>*/}
            </article>
          )
        }
      </section>
    )
  }

}
