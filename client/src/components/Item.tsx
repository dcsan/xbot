import React from "react";

import {
  // Link,
  useParams
} from "react-router-dom";

import './rooms.css'

// function pickItem() {
//   console.log('pickItem')
// }

const data = [
  {
    cname: 'album',
    imgPath: '/cdn/storydata/asylum/items/album.jpg',
    caption: 'An album poster'
  }
]

const captions = {
  note: 'A post it note with some letters jotted down',
  chest: 'A strange antique chest. It seems out of place here.'
}

const cdnPath = (rel: string) => {
  return rel
}

export function Item() {
  const { itemName } = useParams() || 'album';
  const item = data.find(one => one.cname === itemName)
  // @ts-ignore
  console.log('item:', item)
  return (
    <div className='wrapper center'>
      <div className='item-bg'></div>
      <img className='item-full' src={cdnPath(item!.imgPath)} alt={item!.caption} />
      <div className='caption'>{item?.caption}</div>
    </div>
  );
}

