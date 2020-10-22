'use strict'
const OrbitDB = require('orbit-db')

const OrbitDBSet = require('@tabcat/orbit-db-set');
const { IdentityProvider } = require('@tabcat/orbit-db-identity-provider-d');
const ContextAccessController = require('./custom-stores/ContextAccessController');
const ProposalsAccessController = require('./custom-stores/ProposalsAccessController');

OrbitDB.addDatabaseType(OrbitDBSet.type, OrbitDBSet);

OrbitDB.Identities.addIdentityProvider(IdentityProvider);

if (!OrbitDB.AccessControllers.isSupported(ContextAccessController.type)) {
  OrbitDB.AccessControllers.addAccessController({ AccessController: ContextAccessController });
}

if (!OrbitDB.AccessControllers.isSupported(ProposalsAccessController.type)) {
  OrbitDB.AccessControllers.addAccessController({ AccessController: ProposalsAccessController });
}

/** Each pinner tracks a different DB.
 *  All the pinners share the same orbitdb instance */
let orbitdb;
let orbitdbQueue = {};

class Pinner {
  constructor (db, odb) {
    this.db = db
    this.address = db.id
    this.orbitdb = odb
  }

  static async create(address) {
    const ipfs = await require('./ipfsInstance')
    
    if (!orbitdb) {
      if (orbitdbQueue[address]) {
        orbitdb = orbitdbQueue[address];
      } else {
        console.log('[ORBIT-DB] Creating instance')
        orbitdb = orbitdbQueue[address] = OrbitDB.createInstance(ipfs)
      }
    }

    orbitdb = await orbitdb

    delete orbitdbQueue[address]
    
    const db = await Pinner.openDatabase(orbitdb, address)
    return Promise.resolve(new Pinner(db, orbitdb))
  }

  drop () {
    // console.log(this.orbitdb)
    // this.orbitdb.disconnect()
  }

  get estimatedSize() {
    let size = 0

    if(this.db) {
      // This is very crude
      size = JSON.stringify(this.db._oplog.values).length
    }

    return size
  }

  static async openDatabase (orbitdb, address) {
    try {
      if (!OrbitDB.isValidAddress(address)) {
        console.log(`Failed to add ${address}. This is not a valid address`)
        return
      }

      console.log(`${address} opening database`)
      const db = await orbitdb.open(address, { sync: true })

      console.log(`${address} replicated...`)
      await db.load()

      db.events.on('replicated', (address) => {
        console.log(`${address} replicated...`)
      })

      return db
    } catch (e) {
      console.error(e)
    }
  }
}

module.exports = Pinner
