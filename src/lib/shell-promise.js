/*eslint no-console: "off"*/
/*eslint no-confusing-arrow: "off"*/
"use strict";

const spawn = require('child_process').spawn;
const log = require('./log.js').init('shell-promise.js');
const parse = require('shell-quote').parse;

module.exports = {
  run: command => new Promise((resolve, reject) => {
    const _command = {};
    const _split = parse(command);

    _command.process = _split.shift();
    _command.args = _split;

    log.debug("Running:", _command);

    const _proc = spawn(_command.process, _command.args); //, { stdio: "inherit" });

    const stdout = [];
    _proc.stdout.on('data', data => stdout.push(data.toString('utf8')));

    const stderr = [];
    _proc.stderr.on('data', data => stderr.push(data.toString('utf8')));

    const _formatResults = code => ({
      code,
      command,
      stderr: stderr.join(''),
      stdout: stdout.join('')
    });

    _proc.on('close', code => code > 0
      ? reject(_formatResults(code))
      : resolve(_formatResults(code)));
  })
};
