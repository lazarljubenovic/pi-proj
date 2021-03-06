import React, { Component } from 'react'
import PlayButton from './PlayButton'


// const numbers = [
//   'one',
//   'two',
//   'three',
//   'four',
//   'five',
//   'six',
//   'seven',
//   'eight',
//   'nine',
//   'ten',
// ]

const brojevi = [
  'jedan',
  'dva',
  'tri',
  'cetiri',
  'pet',
  'sest',
  'sedam',
  'osam',
  'devet',
  'deset',
]

const sentenceCase = string => string.charAt(0).toUpperCase() + string.slice(1)

const urlWithTitle = brojevi
  .map(n => ({url: `/${n}.mp3`, title: sentenceCase(n)}))

// generate mfcc
// const ctx = new AudioContext()
// Promise.all(urlWithTitle.map(async ({url, title}) => {
//   const source = await getSourceFromFile(ctx, url)
//   const channelData = source.buffer.getChannelData(0)
//   return extractMfcc(channelData)
// }))
//   .then(results => {
//     console.log(JSON.stringify(results))
//   })

export default class ListOfSamples extends Component {
  // constructor(props) {
  //   super(props)
  // }

  render() {
    return (
      <ul>
        {
          urlWithTitle.map(({url, title}) =>
            <li key={title}>
              <PlayButton url={url} title={title}/>
            </li>,
          )
        }
      </ul>
    )
  }
}
