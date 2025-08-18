exports.generate = function(data){
  return { name: data.name || 'ChainCred', description: data.desc || '' };
}
