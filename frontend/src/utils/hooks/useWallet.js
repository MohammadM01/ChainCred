import { useState } from 'react';
export default function useWallet(){
  const [addr, setAddr] = useState(null);
  return { addr, setAddr };
}
