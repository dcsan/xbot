import React from "react";

import {
  Link,
  useParams
} from "react-router-dom";

import './rooms.css'

export function Room() {
  const { roomName } = useParams();
  return (
    <div className='wrapper'>
      <div className='caption'>The Corner Office</div>
      <img className='full-image' src="/images/rooms/corner-office.jpg" alt='office' />
      <Link to='/items/note'>
        <img className='note-mini' src="/images/items/note.png" alt='note' />
      </Link>
    </div>
  );
}

