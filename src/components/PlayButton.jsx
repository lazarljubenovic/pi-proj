import React from 'react'
import {play} from '../services/utils'

const ctx = new AudioContext()

export default ({url, title}) =>
  <button onClick={() => play(ctx, url)}>{title}</button>
