import React from "react";

import {
  Link,
  useParams
} from "react-router-dom";

import './rooms.css'

export function Room() {
  const { roomName } = useParams();
  const bgImg = `/cdn/assets/rooms/${roomName}-bg.jpg`
  return (
    <div className='wrapper'>
      <div className='caption'>The Corner Office</div>
      <img className='full-image' src={ bgImg } alt='office' />
      <Link to='/items/note'>
        <img className='note-mini clickable' src="/cdn/assets/items/note.png" alt='note' />
      </Link>

      <Link to='/items/chest'>
        <img className='chest-mini clickable' src="/cdn/assets/items/chest-closed.png" alt='note' />
      </Link>

    </div>
  );
}

