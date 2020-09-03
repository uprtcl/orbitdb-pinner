const ipfsInstanceP = require('../ipfsInstance');
const { resolve } = require('ipfs/src/core/components');

const pin = async (cid) => {
    const ipfs = await ipfsInstanceP;  
    console.log(`${cid} - pinning`);
    await ipfs.pin.add(cid);
    console.log(`${cid} - pinned!`);
    resolve(cid)
}


module.exports = {
  pin
}