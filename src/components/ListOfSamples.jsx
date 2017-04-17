import React from 'react'
import PlayButton from './PlayButton'

const numbers = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
]

const sentenceCase = string => string.charAt(0).toUpperCase() + string.slice(1)

const urlWithTitle = numbers
  .map(n => ({url: `/${n}.mp3`, title: sentenceCase(n)}))

export default props =>
  <ul>
    {
      urlWithTitle.map(({url, title}) =>
        <li key={title}>
          <PlayButton url={url} title={title}/>  
        </li>
      )
    }
  </ul>
