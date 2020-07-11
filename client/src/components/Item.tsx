import React from "react";

import {
  Link,
  useParams
} from "react-router-dom";

import './rooms.css'

function pickItem() {
  console.log('pickItem')
}

export function Item() {
  const { itemName } = useParams();
  return (
    <div className='wrapper'>
      <div className='caption'>Note</div>
      <Link to='/rooms/office'>
        <div className='item-bg'></div>
      </Link>
      <img className='note-full' src="/cdn/assets/items/note.png" alt='note' />
    </div>
  );
}

