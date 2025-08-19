import React from 'react'
import Spline from '@splinetool/react-spline';
import scene from '/assets/scene.splinecode';
export default function App(){
 return (
    <div className='w-full bg-black h-screen'>
      <Spline scene={scene} />
    </div>
  );
}
