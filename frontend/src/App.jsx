import React from 'react'
import LandingPage from './pages/LandingPage';
import Spline from '@splinetool/react-spline';
import scene from '/assets/scene.splinecode';
export default function App(){
 return (
    <div className='h-screen w-screen'>
      <Spline scene={scene} />
      
    </div>
  );
}