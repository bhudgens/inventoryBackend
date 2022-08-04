/*eslint no-console: "off"*/

const debug = require('debug');
const colors = require('colors/safe');

/**
 * @function _sanitizeArgs
 * Used for general formatting and color application of the log output
 * @param  {object} originalArguments The special 'argument' object from
 *                                    the original call to the log functions
 * @param  {string} color             The color to the log output
 * @return {array}                    Cleaned up log output
 */
function _sanitizeArgs(originalArguments, color) {
  const args = Array.prototype.slice.call(originalArguments);
  let c = args.length;
  while (c--) {
    if (typeof args[c] === "object") {
      args[c] = "\n" + JSON.stringify(args[c], null, 2);
    }
    args[c] = color(args[c]);
  }
  return args;
}

module.exports = {
  init: (name, theme) => {
    colors.setTheme(theme || {
      input: 'grey',
      verbose: 'cyan',
      prompt: 'grey',
      info: 'green',
      data: 'blue',
      help: 'cyan',
      warn: 'yellow',
      notice: 'yellow',
      debug: 'white',
      success: 'green',
      fail: 'red',
      error: 'red'
    });
    return {
      error: debug(`${name}:error`),
      debug: debug(`${name}:debug`),
      info: debug(`${name}:info`),
      warn: debug(`${name}:warn`),
      verbose: debug(`${name}:verbose`),
      out: function(...args) {
        console.log(...args);
      },
      white: function(...args) {
        return console.log(..._sanitizeArgs(args, colors.white));
      },
      grey: function(...args) {
        return console.log(..._sanitizeArgs(args, colors.grey));
      },
      cyan: function(...args) {
        return console.log(..._sanitizeArgs(args, colors.cyan));
      },
      green: function(...args) {
        return console.log(..._sanitizeArgs(args, colors.green));
      },
      blue: function(...args) {
        return console.log(..._sanitizeArgs(args, colors.blue));
      },
      yellow: function(...args) {
        return console.log(..._sanitizeArgs(args, colors.yellow));
      },
      red: function(...args) {
        return console.log(..._sanitizeArgs(args, colors.red));
      },
      magenta: function(...args) {
        return console.log(..._sanitizeArgs(args, colors.magenta));
      },
    };
  }
};
