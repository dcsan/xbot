import React, { useState } from 'react'

import { useSpring, animated } from 'react-spring'
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
    imgPath: 'bureau/ch1/750/mj-poster-cu.png',
    headCaption: '⬆️ close this window to go back to the game',
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
  const url = `https://cbg.rik.ai/cdn/storydata/${rel}`
  return url
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
  // const vis = 'visible'

  // <div className='caption head' >{item?.headCaption}</div>

  return (
    <div onClick={flipIt}>
      <div className='brick' />


      {flipped &&
        <div className='caption foot slider-left'>{item?.footCaption}</div>
      }

      <animated.img
        style={{ opacity: opacity.interpolate((o: any) => 1 - o), transform }}
        className='fill-item'
        src={cdnPath(item!.imgPath)} alt={item!.headCaption}
      />

      <animated.div className="fill-item album-back" style={{ opacity, transform: transform.interpolate((t: any) => `${t} rotateX(180deg)`) }}>
        {backLines}
      </animated.div>
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

