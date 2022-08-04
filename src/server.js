"use strict";

/********************************************************************
 * Logging
 ********************************************************************/

const config = require("../config/config.js");

/********************************************************************
 * Libraries
 ********************************************************************/

/** Hookup Express */
const express = require("express");
const app = express();

/** Configure our body Parser */
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/********************************************************************
 * Route Handlers
 ********************************************************************/

app.get("/diagnostic", (req, res) => res.status(200).end("OK"));
app.get("/", (req, res) => res.redirect("https://github.com/Beginnerprise/node_boilerplate"));

/********************************************************************
 * Start the Express Server
 ********************************************************************/
app.listen(config.serverPort);
