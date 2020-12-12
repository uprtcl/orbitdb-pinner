const CBOR = require("cbor-js");
const ipfsInstanceP = require("../ipfsInstance");

const pin = async (cid) => {
  const ipfs = await ipfsInstanceP;
  console.log(`${cid} - pinning`);
  await ipfs.pin.add(cid);
  console.log(`${cid} - pinned!`);
  return cid;
};

const get = async (cid) => {
  const ipfs = await ipfsInstanceP;
  console.log(`${cid} - getting`);
  const result = await ipfs.dag.get(cid);
  const forceBuffer = Uint8Array.from(result.value);
  const object = CBOR.decode(forceBuffer.buffer);
  console.log(`${cid}`, object);
  return object;
};

const stats = async () => {
  const ipfs = await ipfsInstanceP;
  const ls = [];
  for await (const { cid, type } of ipfs.pin.ls()) {
    ls.push(cid.toString("base58btc"));
  }
  return {
    ls,
  };
};

module.exports = {
  pin,
  get,
  stats,
};
