/** Hookup Express */
const express = require("express");
const app = express();
const fs = require('fs-extra');
const mkdirp = require('mkdirp');

const { PORT, STORAGE_PATH } = process.env;

const _port = PORT || 4000;
/** Configure our body Parser */
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const UTF8 = 'utf8';

/********************************************************************
 * Route Handlers
 ********************************************************************/

app.use('/', express.static(`${__dirname}/../public`));
app.use('/files', express.static(`${__dirname}/../public`));

const status = { start: new Date() };

function _handleHealthCheck(res) {
  return res.status(200).json(status);
}
app.get("/diagnostic", _handleHealthCheck);
app.get("/status", _handleHealthCheck);
app.get("/healthy", _handleHealthCheck);

/********************************************************************
 * Guard
 ********************************************************************/
const _missingEnvs = ['STORAGE_PATH'].filter(env => !process.env[env]);
if (_missingEnvs.length) {
  console.error("Required Environment Vars Missing:", _missingEnvs);
  process.exit(_missingEnvs.length);
}


const _pathForDataStorage = STORAGE_PATH;
if (!fs.existsSync(STORAGE_PATH)) {
  console.error("STORAGE_PATH doesn't exists");
  process.exit(1);
}
const _pathForInventoryStorage = `${_pathForDataStorage}/inventory`;
const _pathForLocationStorage = `${_pathForDataStorage}/locations`;
mkdirp.sync(_pathForInventoryStorage);
mkdirp.sync(_pathForLocationStorage);

async function _handleStateSave(req, res) {
  console.log(`Body`, req.body);
  const { inventory, locations } = req.body;
  if (typeof inventory === "object") {
    Object.keys(inventory).forEach(inventoryId => {
      fs.writeFile(
        `${_pathForDataStorage}/inventory/${inventoryId}.json`,
        JSON.stringify(inventory[inventoryId]),
        UTF8
      );
    });
  }
  if (typeof locations === "object") {
    Object.keys(locations).forEach(locationId => {
      fs.writeFile(
        `${_pathForDataStorage}/locations/${locationId}.json`,
        JSON.stringify(locations[locationId]),
        UTF8
      );
    });
  }
  await _handlePulseUpdate();
  const status = "ok";
  res.status(200).json({ status });
}
app.post('/inventory', _handleStateSave);
app.post('/locations', _handleStateSave);

app.get('/inventory', async (_, res) => {
  const _files = await fs.readdir(_pathForInventoryStorage);
  const inventory = {};
  await Promise.all(_files.map(async file => {
    const _id = file.replace('.json', '');
    const _fileContents = await fs.readFile(`${_pathForInventoryStorage}/${file}`, UTF8);
    const _parsedContents = JSON.parse(_fileContents);
    inventory[_id] = _parsedContents;
  }));

  res.status(200).json({ inventory });
});

app.get('/locations', async (_, res) => {
  const _files = await fs.readdir(_pathForLocationStorage);
  const locations = {};
  await Promise.all(_files.map(async file => {
    const _id = file.replace('.json', '');
    const _fileContents = await fs.readFile(`${_pathForLocationStorage}/${file}`, UTF8);
    const _parsedContents = JSON.parse(_fileContents);
    locations[_id] = _parsedContents;
  }));

  res.status(200).json({ locations });
});

const _deleteFile = (path) => fs.existsSync(path) && fs.unlinkSync(path);
app.delete('/inventory/:id', async (req, res) => {
  const { id } = req.params;
  _deleteFile(`${_pathForInventoryStorage}/${id}.json`);
  await _handlePulseUpdate();
  const status = "ok";
  res.status(200).json({ status });
});

app.delete('/locations/:id', async (req, res) => {
  const { id } = req.params;
  _deleteFile(`${_pathForLocationStorage}/${id}.json`);
  await _handlePulseUpdate();
  const status = "ok";
  res.status(200).json({ status });
});

const _pulseFile = `${_pathForDataStorage}/pulse.json`;

async function _handlePulseUpdate() {
  const pulse = JSON.stringify({ time: new Date() });
  await fs.writeFile(_pulseFile, pulse, UTF8);
}

app.get('/pulse', async (_, res) => {
  try {
    if (!fs.existsSync(_pulseFile)) {
      _handlePulseUpdate();
    }
    const pulse = await fs.readFile(_pulseFile, UTF8);
    res.status(200).json(JSON.parse(pulse));
  } catch (error) {
    // No Pulse
  }
});

/********************************************************************
 * Start the Express Server
 ********************************************************************/
app.listen(_port, () => console.log(`Running on port ${_port}`));

