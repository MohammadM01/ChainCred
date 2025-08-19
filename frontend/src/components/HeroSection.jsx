import Spline from '@splinetool/react-spline';
import scene from '/assets/scene.splinecode';

export default function HeroSection(){
  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      <Spline scene={scene} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400">Fraud-proof credentials with ChainCred 🚀</h1>
          <p className="mt-4 text-gray-200">Tamper-proof, decentralized, verifiable on opBNB + Greenfield.</p>
        </div>
      </div>
    </div>
  );
}
