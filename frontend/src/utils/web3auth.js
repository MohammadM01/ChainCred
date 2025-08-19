export async function initWeb3Auth(){
  // minimal placeholder: try to use window.ethereum to get accounts
  if(window.ethereum){
    try{
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts && accounts[0];
    }catch(e){
      return null;
    }
  }
  return null;
}
