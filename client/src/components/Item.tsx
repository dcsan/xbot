import React from "react";

import {
  Link,
  useParams
} from "react-router-dom";

import './rooms.css'

function pickItem() {
  console.log('pickItem')
}

const captions = {
  note: 'A post it note with some letters jotted down',
  chest: 'A strange antique chest. It seems out of place here.'
}

export function Item() {
  const { itemName } = useParams() || 'note';
  // @ts-ignore
  const caption = captions[itemName]
  const imgPath = `/cdn/assets/items/${ itemName }.png`
  console.log('itemName:', itemName, caption)
  return (
    <div className='wrapper center'>
      <Link to='/rooms/office'>
        <div className='item-bg'></div>
        <img className='note-full' src={ imgPath } alt='note' />
        <div className='caption'>{ caption }</div>
      </Link>
    </div>
  );
}

