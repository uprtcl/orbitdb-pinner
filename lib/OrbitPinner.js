'use strict'
const OrbitDB = require('orbit-db')

const OrbitDBSet = require('@tabcat/orbit-db-set');
const { IdentityProvider } = require('@tabcat/orbit-db-identity-provider-d');
const { ContextAccessController } = require('./custom-stores/ContextAccessController');
const ProposalsAccessController = require('./custom-stores/ProposalsAccessController');

OrbitDB.addDatabaseType(OrbitDBSet.type, OrbitDBSet);

OrbitDB.Identities.addIdentityProvider(IdentityProvider);

if (!OrbitDB.AccessControllers.isSupported(ContextAccessController.type)) {
  OrbitDB.AccessControllers.addAccessController({ AccessController: ContextAccessController });
}

if (!OrbitDB.AccessControllers.isSupported(ProposalsAccessController.type)) {
  OrbitDB.AccessControllers.addAccessController({ AccessController: ProposalsAccessController });
}


let orbitdb;

class Pinner {
  constructor (db) {
    this.db = db
    this.address = db.id
  }

  static async create(address) {
    const ipfs = await require('./ipfsInstance')
    if(!orbitdb) orbitdb = await OrbitDB.createInstance(ipfs)
    const db = await Pinner.openDatabase(orbitdb, address)
    return Promise.resolve(new Pinner(db))
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

      console.log('Listening for updates to the database...')
      await db.load()

      return db
    } catch (e) {
      console.error(e)
    }
  }
}

module.exports = Pinner
