'use strict';
const CBOR = require('cbor-js');
const IPFSAccessController = require('orbit-db-access-controllers/src/ipfs-access-controller');

const type = 'context';

class ContextAccessController extends IPFSAccessController {
  static get type() {
    return type;
  }

  constructor(ipfs, options) {
    super(ipfs, options);
  }

  async canAppend(entry, identityProvider) {
    // Allow if access list contain the writer's publicKey or is '*'
    const key = entry.identity.id;
    try {
      if (this.write.includes(key) || this.write.includes('*')) {
        const perspectiveId = entry.payload.value;
        const result = await this._ipfs.dag.get(perspectiveId);
        const forceBuffer = Uint8Array.from(result.value);
        const { payload: perspective } = CBOR.decode(forceBuffer.buffer);

        if (perspective.creatorId !== entry.identity.id) return false;

        // check identity is valid
        return identityProvider.verifyIdentity(entry.identity);
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  static async create(orbitdb, options = {}) {
    options = { ...options, ...{ write: options.write || [orbitdb.identity.id] } };
    return new ContextAccessController(orbitdb._ipfs, options);
  }
}

module.exports = ContextAccessController
