import React, { useState } from 'react'

import { useSpring, animated as a } from 'react-spring'
// import './styles.css'

import {
  // Link,
  useParams
} from "react-router-dom";

import './rooms.css'

const log = console.log

// function pickItem() {
//   console.log('pickItem')
// }

const data = [
  {
    cname: 'album',
    imgPath: '/cdn/storydata/asylum/items/album.jpg',
    headCaption: '⬆︎ close this window to go back to the game',
    footCaption: 'You take the poster off the wall and flip it over...',
    backText: [
      'Four good boys in turns did wash',
      ' ',
      'First was Hans the boy from Ansbach',
      'Next was Nick with ruddy skin',
      'While Piers did follow after him',
      'The last was Fez a swarthy chum',
      ' ',
      'He did the deed then all were done.',
    ]
  }
]

const cdnPath = (rel: string) => {
  return rel
}

export function Item() {
  const { itemName } = useParams() || 'album';
  // console.log('itemName', itemName)
  const item = data.find(one => one.cname === itemName)
  // const props = useSpring({ opacity: 1, duration: 10, from: { opacity: 0 } })

  const [flipped, setFlipped] = useState(false)
  const { transform, opacity } = useSpring({
    opacity: flipped ? 1 : 0,
    transform: `perspective(600px) rotateX(${flipped ? 180 : 0}deg)`,
    config: { mass: 20, tension: 550, friction: 120 }
  })

  const flipIt = () => {
    setFlipped(state => !state)
    log('flipped', flipped)
    log('opacity', opacity)
  }

  const backLines = item!.backText.map((line, idx) => {
    return <div key={'line-' + idx}>{line}</div>
  })

  // @ts-ignore
  // const opv = opacity.value

  // @ts-ignore
  // console.log('opacity', opacity.value)

  // const vis = flipped ? 'visible' : 'hidden'
  const vis = 'visible'

  return (
    <div onClick={flipIt}>
      <div className='brick' />
      <div className='caption head' >{item?.headCaption}</div>

      {flipped &&
        <div className='caption foot slider-left'>{item?.footCaption}</div>
      }

      <a.img
        style={{ opacity: opacity.interpolate((o: any) => 1 - o), transform }}
        className='c'
        src={cdnPath(item!.imgPath)} alt={item!.headCaption}
      />

      <a.div className="c album-back" style={{ opacity, transform: transform.interpolate(t => `${t} rotateX(180deg)`) }}>
        {backLines}
      </a.div>
    </div>
  )

  // @ts-ignore
  // console.log('item:', item)
  // return (
  //   <div className='wrapper center'>
  //     <div className='item-bg'></div>
  //     <animated.div style={props}>
  //       <img className='item-inset' src={cdnPath(item!.imgPath)} alt={item!.caption} />
  //     </animated.div>
  //     <div className='caption'>{item?.caption}</div>
  //   </div>
  // );
}

