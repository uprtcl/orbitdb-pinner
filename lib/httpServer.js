const config = require("config");

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

const pinningList = require("./pinningList");
const pinIpfs = require("./pinIpfs");

class server {
  constructor(httpPort) {
    const port = httpPort || config.get("http.port");

    app.use(cors());

    app.get("/stats", async (req, res) => {
      const num_databases = (await pinningList.getContents()).length;
      const pinners = pinningList.getPinners();
      const statsIpfs = await pinIpfs.stats();

      const pinnerStats = Object.values(pinners).map((pinner) => {
        return {
          size: pinner.estimatedSize,
        };
      });

      res.json({
        pinners: pinnerStats,
        num_databases,
        total_size: pinnerStats.reduce((a, b) => a + b.size, 0),
        statsIpfs,
      });
    });

    app.get("/includes", async (req, res) => {
      const address = req.query.address;

      if (req.query.address) {
        const includes = await pinningList.includes(address);

        res.json({
          includes,
        });
      } else {
        res.json({
          includes: false,
        });
      }
    });

    app.put("/pin", bodyParser.json(), async (req, res) => {
      const addresses = req.body.addresses;

      if (req.query.addresses) {
        await Promise.all(addresses.map((address) => pinningList.add(address)));

        res.send(`added ${JSON.stringify(addresses)}`);
      } else {
        res.send("missing 'addresses' query parameter");
      }
    });

    app.put("/pin_hash", bodyParser.json(), async (req, res) => {
      if (req.body === undefined) {
        res.send("undefined input");
        return;
      }
      const cids = req.body.cids;

      if (cids) {
        await Promise.all(cids.map((cid) => pinIpfs.pin(cid)));

        res.send(`pined... ${JSON.stringify(cids)}`);
      } else {
        res.send("missing 'cid' query parameter");
      }
    });

    app.get("/unpin", (req, res) => {
      const address = req.query.address;

      if (req.query.address) {
        // pinningList.remove(address)
        console.error(
          "remove disabled, it had an error ReadError: Database is not open"
        );

        res.send(`removing... ${address}`);
      } else {
        res.send("missing 'address' query parameter");
      }
    });

    app.get("/getAll", async (req, res) => {
      const address = req.query.address;

      if (address) {
        const latest = await pinningList.getAll(address);

        res.json({
          latest,
        });
      } else {
        res.send("missing 'address' query parameter");
      }
    });

    app.get("/getEntity", async (req, res) => {
      const cid = req.query.cid;

      if (cid) {
        const object = await pinIpfs.get(req.query.cid);

        res.json({
          object,
        });
      } else {
        res.send("missing 'cid' query parameter");
      }
    });

    app.listen(port, () =>
      console.log(`Orbit-pinner listening on port ${port}`)
    );
  }
}

module.exports = server;
