const config = require('config')

const express = require('express')
const app = express()

const pinningList = require('./pinningList')
const pinIpfs = require('./pinIpfs')

class server {
  constructor (httpPort) {
    const port = httpPort || config.get('http.port')

    app.get('/pin', (req, res) => {
      const address = req.query.address

      if (req.query.address) {
        pinningList.add(address)

        res.send(`adding... ${address}`)
      } else {
        res.send('missing \'address\' query parameter')
      }
    })

    app.get('/unpin', (req, res) => {
      const address = req.query.address

      if (req.query.address) {
        pinningList.remove(address)

        res.send(`removing... ${address}`)
      } else {
        res.send('missing \'address\' query parameter')
      }
    })

    app.get('/pin_hash', async (req, res) => {
      const cid = req.query.cid

      if (cid) {
        const cidPinned = await pinIpfs.pin(req.query.cid)

        res.send(`pined... ${cidPinned}`)
      } else {
        res.send('missing \'cid\' query parameter')
      }
    })

    app.listen(port, () => console.log(`Orbit-pinner listening on port ${port}`))
  }
}

module.exports = server
