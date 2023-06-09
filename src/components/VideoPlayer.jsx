import React, { useEffect, useRef, useState } from 'react';

import border from './images/border.gif';

export const VideoPlayer = ({ user }) => {
  const ref = useRef();

  useEffect(() => {
    user.videoTrack.play(ref.current);
    
    console.log(((ref.current).children[0]).children[0])
  });

  return (
    <div
    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'}}
    >
      <img src={border} className = "border"/>
      {/* Uid: {user.uid} */}
      <div
        className='out-video'
        ref={ref}
        style={{ width: '90%', aspectRatio: '4/3'}}
      >
      </div>
    </div>
  );
};
