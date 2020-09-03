const ipfsInstanceP = require('../ipfsInstance');
const { resolve } = require('ipfs/src/core/components');

const pin = async (cid) => {
    const ipfs = await ipfsInstanceP;  
    console.log(`trying to pin ${cid}`);

    await ipfs.pin.add(cid);

    console.log(`ipfs hash ${cid} pinned`);
    resolve(cid)
}


module.exports = {
  pin
}