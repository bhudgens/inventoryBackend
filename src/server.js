/** Hookup Express */
const express = require("express");
const app = express();
const fs = require('fs-extra');
const mkdirp = require('mkdirp');

const { PORT } = process.env;

const _port = PORT || 4000;
/** Configure our body Parser */
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/********************************************************************
 * Route Handlers
 ********************************************************************/

const status = { start: new Date() };

function _handleHealthCheck(res) {
  return res.status(200).json(status);
}
app.get("/diagnostic", _handleHealthCheck);
app.get("/status", _handleHealthCheck);
app.get("/healthy", _handleHealthCheck);


const _pathForDataStorage = '/tmp/inventoryStorage';
async function _handleStateSave(req, res) {
  const { inventory, locations } = req.body;
  await mkdirp(`${_pathForDataStorage}/inventory`);
  await mkdirp(`${_pathForDataStorage}/locations`);
  if (typeof inventory === "object") {
    Object.keys(inventory).forEach(inventoryId => {
      fs.writeFile(
        `${_pathForDataStorage}/inventory/${inventoryId}.json`,
        JSON.stringify(inventory[inventoryId]),
        'utf8'
      );
    });
  }
  if (typeof locations === "object") {
    Object.keys(locations).forEach(locationId => {
      fs.writeFile(
        `${_pathForDataStorage}/${locationId}.json`,
        JSON.stringify(locations[locationId]),
        'utf8'
      );
    });
  }
  await _handlePulseUpdate();
  const status = "ok";
  res.status(200).json({ status });
}
app.post('/inventory', _handleStateSave);
app.post('/locations', _handleStateSave);

const _pulseFile = `${_pathForDataStorage}/pulse.json`;

async function _handlePulseUpdate() {
  const pulse = JSON.stringify({ time: new Date() });
  await fs.writeFile(_pulseFile, pulse, 'utf8');
}

app.get('/pulse', async (_, res) => {
  const pulse = await fs.readFile(_pulseFile, 'utf8');
  res.status(200).json(pulse);
});

/********************************************************************
 * Start the Express Server
 ********************************************************************/
app.listen(_port, () => console.log(`Running on port ${_port}`));

