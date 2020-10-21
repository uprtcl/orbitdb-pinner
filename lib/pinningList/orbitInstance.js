const OrbitDB = require('orbit-db')

const ipfsInstanceP = require('../ipfsInstance')

const orbitInstanceP = new Promise(resolve => {
  ipfsInstanceP.then(ipfsInstance => {
    resolve(OrbitDB.createInstance(ipfsInstance, {
      directory: './orbitdb/pinner/Manifest'
    }))
  })
})

const createRootInstance = async () => {
  return createDbInstance('dbList')
}

const createDbInstance = async addr => {
  const address = addr
  const orbitInstance = await orbitInstanceP

  const pinningList = {
    create: true,
    overwrite: true,
    localOnly: false,
    type: 'feed'
  }

  const db = await orbitInstance.open(address, pinningList)

  await db.load()

  return db
}

module.exports = {
  createRootInstance,
  createDbInstance,
  orbitInstanceP
}
