var __commonJS = (cb, mod) =>
  function __require() {
    return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

// node_modules/@actions/core/lib/utils.js
var require_utils = __commonJS({
  'node_modules/@actions/core/lib/utils.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    function toCommandValue(input) {
      if (input === null || input === void 0) {
        return '';
      } else if (typeof input === 'string' || input instanceof String) {
        return input;
      }
      return JSON.stringify(input);
    }
    exports2.toCommandValue = toCommandValue;
  }
});

// node_modules/@actions/core/lib/command.js
var require_command = __commonJS({
  'node_modules/@actions/core/lib/command.js'(exports2) {
    'use strict';
    var __importStar =
      (exports2 && exports2.__importStar) ||
      function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        }
        result['default'] = mod;
        return result;
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    var os = __importStar(require('os'));
    var utils_1 = require_utils();
    function issueCommand(command, properties, message) {
      const cmd = new Command(command, properties, message);
      process.stdout.write(cmd.toString() + os.EOL);
    }
    exports2.issueCommand = issueCommand;
    function issue(name, message = '') {
      issueCommand(name, {}, message);
    }
    exports2.issue = issue;
    var CMD_STRING = '::';
    var Command = class {
      constructor(command, properties, message) {
        if (!command) {
          command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
      }
      toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
          cmdStr += ' ';
          let first = true;
          for (const key in this.properties) {
            if (this.properties.hasOwnProperty(key)) {
              const val = this.properties[key];
              if (val) {
                if (first) {
                  first = false;
                } else {
                  cmdStr += ',';
                }
                cmdStr += `${key}=${escapeProperty(val)}`;
              }
            }
          }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
      }
    };
    function escapeData(s) {
      return utils_1.toCommandValue(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
    }
    function escapeProperty(s) {
      return utils_1
        .toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
    }
  }
});

// node_modules/@actions/core/lib/file-command.js
var require_file_command = __commonJS({
  'node_modules/@actions/core/lib/file-command.js'(exports2) {
    'use strict';
    var __importStar =
      (exports2 && exports2.__importStar) ||
      function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        }
        result['default'] = mod;
        return result;
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    var fs = __importStar(require('fs'));
    var os = __importStar(require('os'));
    var utils_1 = require_utils();
    function issueCommand(command, message) {
      const filePath = process.env[`GITHUB_${command}`];
      if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
      }
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
      }
      fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
      });
    }
    exports2.issueCommand = issueCommand;
  }
});

// node_modules/@actions/core/lib/core.js
var require_core = __commonJS({
  'node_modules/@actions/core/lib/core.js'(exports2) {
    'use strict';
    var __awaiter =
      (exports2 && exports2.__awaiter) ||
      function (thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P
            ? value
            : new P(function (resolve) {
                resolve(value);
              });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          function rejected(value) {
            try {
              step(generator['throw'](value));
            } catch (e) {
              reject(e);
            }
          }
          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
    var __importStar =
      (exports2 && exports2.__importStar) ||
      function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        }
        result['default'] = mod;
        return result;
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    var command_1 = require_command();
    var file_command_1 = require_file_command();
    var utils_1 = require_utils();
    var os = __importStar(require('os'));
    var path = __importStar(require('path'));
    var ExitCode;
    (function (ExitCode2) {
      ExitCode2[(ExitCode2['Success'] = 0)] = 'Success';
      ExitCode2[(ExitCode2['Failure'] = 1)] = 'Failure';
    })((ExitCode = exports2.ExitCode || (exports2.ExitCode = {})));
    function exportVariable(name, val) {
      const convertedVal = utils_1.toCommandValue(val);
      process.env[name] = convertedVal;
      const filePath = process.env['GITHUB_ENV'] || '';
      if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
      } else {
        command_1.issueCommand('set-env', { name }, convertedVal);
      }
    }
    exports2.exportVariable = exportVariable;
    function setSecret(secret) {
      command_1.issueCommand('add-mask', {}, secret);
    }
    exports2.setSecret = setSecret;
    function addPath(inputPath) {
      const filePath = process.env['GITHUB_PATH'] || '';
      if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
      } else {
        command_1.issueCommand('add-path', {}, inputPath);
      }
      process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
    }
    exports2.addPath = addPath;
    function getInput(name, options) {
      const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
      if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
      }
      return val.trim();
    }
    exports2.getInput = getInput;
    function setOutput(name, value) {
      process.stdout.write(os.EOL);
      command_1.issueCommand('set-output', { name }, value);
    }
    exports2.setOutput = setOutput;
    function setCommandEcho(enabled) {
      command_1.issue('echo', enabled ? 'on' : 'off');
    }
    exports2.setCommandEcho = setCommandEcho;
    function setFailed(message) {
      process.exitCode = ExitCode.Failure;
      error(message);
    }
    exports2.setFailed = setFailed;
    function isDebug() {
      return process.env['RUNNER_DEBUG'] === '1';
    }
    exports2.isDebug = isDebug;
    function debug(message) {
      command_1.issueCommand('debug', {}, message);
    }
    exports2.debug = debug;
    function error(message) {
      command_1.issue('error', message instanceof Error ? message.toString() : message);
    }
    exports2.error = error;
    function warning(message) {
      command_1.issue('warning', message instanceof Error ? message.toString() : message);
    }
    exports2.warning = warning;
    function info(message) {
      process.stdout.write(message + os.EOL);
    }
    exports2.info = info;
    function startGroup(name) {
      command_1.issue('group', name);
    }
    exports2.startGroup = startGroup;
    function endGroup() {
      command_1.issue('endgroup');
    }
    exports2.endGroup = endGroup;
    function group(name, fn) {
      return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
          result = yield fn();
        } finally {
          endGroup();
        }
        return result;
      });
    }
    exports2.group = group;
    function saveState(name, value) {
      command_1.issueCommand('save-state', { name }, value);
    }
    exports2.saveState = saveState;
    function getState(name) {
      return process.env[`STATE_${name}`] || '';
    }
    exports2.getState = getState;
  }
});

// node_modules/fs.realpath/old.js
var require_old = __commonJS({
  'node_modules/fs.realpath/old.js'(exports2) {
    var pathModule = require('path');
    var isWindows = process.platform === 'win32';
    var fs = require('fs');
    var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);
    function rethrow() {
      var callback;
      if (DEBUG) {
        var backtrace = new Error();
        callback = debugCallback;
      } else callback = missingCallback;
      return callback;
      function debugCallback(err) {
        if (err) {
          backtrace.message = err.message;
          err = backtrace;
          missingCallback(err);
        }
      }
      function missingCallback(err) {
        if (err) {
          if (process.throwDeprecation) throw err;
          else if (!process.noDeprecation) {
            var msg = 'fs: missing callback ' + (err.stack || err.message);
            if (process.traceDeprecation) console.trace(msg);
            else console.error(msg);
          }
        }
      }
    }
    function maybeCallback(cb) {
      return typeof cb === 'function' ? cb : rethrow();
    }
    var normalize = pathModule.normalize;
    if (isWindows) {
      nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
    } else {
      nextPartRe = /(.*?)(?:[\/]+|$)/g;
    }
    var nextPartRe;
    if (isWindows) {
      splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
    } else {
      splitRootRe = /^[\/]*/;
    }
    var splitRootRe;
    exports2.realpathSync = function realpathSync(p, cache) {
      p = pathModule.resolve(p);
      if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
        return cache[p];
      }
      var original = p,
        seenLinks = {},
        knownHard = {};
      var pos;
      var current;
      var base;
      var previous;
      start();
      function start() {
        var m = splitRootRe.exec(p);
        pos = m[0].length;
        current = m[0];
        base = m[0];
        previous = '';
        if (isWindows && !knownHard[base]) {
          fs.lstatSync(base);
          knownHard[base] = true;
        }
      }
      while (pos < p.length) {
        nextPartRe.lastIndex = pos;
        var result = nextPartRe.exec(p);
        previous = current;
        current += result[0];
        base = previous + result[1];
        pos = nextPartRe.lastIndex;
        if (knownHard[base] || (cache && cache[base] === base)) {
          continue;
        }
        var resolvedLink;
        if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
          resolvedLink = cache[base];
        } else {
          var stat = fs.lstatSync(base);
          if (!stat.isSymbolicLink()) {
            knownHard[base] = true;
            if (cache) cache[base] = base;
            continue;
          }
          var linkTarget = null;
          if (!isWindows) {
            var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
            if (seenLinks.hasOwnProperty(id)) {
              linkTarget = seenLinks[id];
            }
          }
          if (linkTarget === null) {
            fs.statSync(base);
            linkTarget = fs.readlinkSync(base);
          }
          resolvedLink = pathModule.resolve(previous, linkTarget);
          if (cache) cache[base] = resolvedLink;
          if (!isWindows) seenLinks[id] = linkTarget;
        }
        p = pathModule.resolve(resolvedLink, p.slice(pos));
        start();
      }
      if (cache) cache[original] = p;
      return p;
    };
    exports2.realpath = function realpath(p, cache, cb) {
      if (typeof cb !== 'function') {
        cb = maybeCallback(cache);
        cache = null;
      }
      p = pathModule.resolve(p);
      if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
        return process.nextTick(cb.bind(null, null, cache[p]));
      }
      var original = p,
        seenLinks = {},
        knownHard = {};
      var pos;
      var current;
      var base;
      var previous;
      start();
      function start() {
        var m = splitRootRe.exec(p);
        pos = m[0].length;
        current = m[0];
        base = m[0];
        previous = '';
        if (isWindows && !knownHard[base]) {
          fs.lstat(base, function (err) {
            if (err) return cb(err);
            knownHard[base] = true;
            LOOP();
          });
        } else {
          process.nextTick(LOOP);
        }
      }
      function LOOP() {
        if (pos >= p.length) {
          if (cache) cache[original] = p;
          return cb(null, p);
        }
        nextPartRe.lastIndex = pos;
        var result = nextPartRe.exec(p);
        previous = current;
        current += result[0];
        base = previous + result[1];
        pos = nextPartRe.lastIndex;
        if (knownHard[base] || (cache && cache[base] === base)) {
          return process.nextTick(LOOP);
        }
        if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
          return gotResolvedLink(cache[base]);
        }
        return fs.lstat(base, gotStat);
      }
      function gotStat(err, stat) {
        if (err) return cb(err);
        if (!stat.isSymbolicLink()) {
          knownHard[base] = true;
          if (cache) cache[base] = base;
          return process.nextTick(LOOP);
        }
        if (!isWindows) {
          var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
          if (seenLinks.hasOwnProperty(id)) {
            return gotTarget(null, seenLinks[id], base);
          }
        }
        fs.stat(base, function (err2) {
          if (err2) return cb(err2);
          fs.readlink(base, function (err3, target) {
            if (!isWindows) seenLinks[id] = target;
            gotTarget(err3, target);
          });
        });
      }
      function gotTarget(err, target, base2) {
        if (err) return cb(err);
        var resolvedLink = pathModule.resolve(previous, target);
        if (cache) cache[base2] = resolvedLink;
        gotResolvedLink(resolvedLink);
      }
      function gotResolvedLink(resolvedLink) {
        p = pathModule.resolve(resolvedLink, p.slice(pos));
        start();
      }
    };
  }
});

// node_modules/fs.realpath/index.js
var require_fs = __commonJS({
  'node_modules/fs.realpath/index.js'(exports2, module2) {
    module2.exports = realpath;
    realpath.realpath = realpath;
    realpath.sync = realpathSync;
    realpath.realpathSync = realpathSync;
    realpath.monkeypatch = monkeypatch;
    realpath.unmonkeypatch = unmonkeypatch;
    var fs = require('fs');
    var origRealpath = fs.realpath;
    var origRealpathSync = fs.realpathSync;
    var version = process.version;
    var ok = /^v[0-5]\./.test(version);
    var old = require_old();
    function newError(er) {
      return er && er.syscall === 'realpath' && (er.code === 'ELOOP' || er.code === 'ENOMEM' || er.code === 'ENAMETOOLONG');
    }
    function realpath(p, cache, cb) {
      if (ok) {
        return origRealpath(p, cache, cb);
      }
      if (typeof cache === 'function') {
        cb = cache;
        cache = null;
      }
      origRealpath(p, cache, function (er, result) {
        if (newError(er)) {
          old.realpath(p, cache, cb);
        } else {
          cb(er, result);
        }
      });
    }
    function realpathSync(p, cache) {
      if (ok) {
        return origRealpathSync(p, cache);
      }
      try {
        return origRealpathSync(p, cache);
      } catch (er) {
        if (newError(er)) {
          return old.realpathSync(p, cache);
        } else {
          throw er;
        }
      }
    }
    function monkeypatch() {
      fs.realpath = realpath;
      fs.realpathSync = realpathSync;
    }
    function unmonkeypatch() {
      fs.realpath = origRealpath;
      fs.realpathSync = origRealpathSync;
    }
  }
});

// node_modules/concat-map/index.js
var require_concat_map = __commonJS({
  'node_modules/concat-map/index.js'(exports2, module2) {
    module2.exports = function (xs, fn) {
      var res = [];
      for (var i = 0; i < xs.length; i++) {
        var x = fn(xs[i], i);
        if (isArray(x)) res.push.apply(res, x);
        else res.push(x);
      }
      return res;
    };
    var isArray =
      Array.isArray ||
      function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]';
      };
  }
});

// node_modules/balanced-match/index.js
var require_balanced_match = __commonJS({
  'node_modules/balanced-match/index.js'(exports2, module2) {
    'use strict';
    module2.exports = balanced;
    function balanced(a, b, str) {
      if (a instanceof RegExp) a = maybeMatch(a, str);
      if (b instanceof RegExp) b = maybeMatch(b, str);
      var r = range(a, b, str);
      return (
        r && {
          start: r[0],
          end: r[1],
          pre: str.slice(0, r[0]),
          body: str.slice(r[0] + a.length, r[1]),
          post: str.slice(r[1] + b.length)
        }
      );
    }
    function maybeMatch(reg, str) {
      var m = str.match(reg);
      return m ? m[0] : null;
    }
    balanced.range = range;
    function range(a, b, str) {
      var begs, beg, left, right, result;
      var ai = str.indexOf(a);
      var bi = str.indexOf(b, ai + 1);
      var i = ai;
      if (ai >= 0 && bi > 0) {
        if (a === b) {
          return [ai, bi];
        }
        begs = [];
        left = str.length;
        while (i >= 0 && !result) {
          if (i == ai) {
            begs.push(i);
            ai = str.indexOf(a, i + 1);
          } else if (begs.length == 1) {
            result = [begs.pop(), bi];
          } else {
            beg = begs.pop();
            if (beg < left) {
              left = beg;
              right = bi;
            }
            bi = str.indexOf(b, i + 1);
          }
          i = ai < bi && ai >= 0 ? ai : bi;
        }
        if (begs.length) {
          result = [left, right];
        }
      }
      return result;
    }
  }
});

// node_modules/brace-expansion/index.js
var require_brace_expansion = __commonJS({
  'node_modules/brace-expansion/index.js'(exports2, module2) {
    var concatMap = require_concat_map();
    var balanced = require_balanced_match();
    module2.exports = expandTop;
    var escSlash = '\0SLASH' + Math.random() + '\0';
    var escOpen = '\0OPEN' + Math.random() + '\0';
    var escClose = '\0CLOSE' + Math.random() + '\0';
    var escComma = '\0COMMA' + Math.random() + '\0';
    var escPeriod = '\0PERIOD' + Math.random() + '\0';
    function numeric(str) {
      return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
    }
    function escapeBraces(str) {
      return str
        .split('\\\\')
        .join(escSlash)
        .split('\\{')
        .join(escOpen)
        .split('\\}')
        .join(escClose)
        .split('\\,')
        .join(escComma)
        .split('\\.')
        .join(escPeriod);
    }
    function unescapeBraces(str) {
      return str
        .split(escSlash)
        .join('\\')
        .split(escOpen)
        .join('{')
        .split(escClose)
        .join('}')
        .split(escComma)
        .join(',')
        .split(escPeriod)
        .join('.');
    }
    function parseCommaParts(str) {
      if (!str) return [''];
      var parts = [];
      var m = balanced('{', '}', str);
      if (!m) return str.split(',');
      var pre = m.pre;
      var body = m.body;
      var post = m.post;
      var p = pre.split(',');
      p[p.length - 1] += '{' + body + '}';
      var postParts = parseCommaParts(post);
      if (post.length) {
        p[p.length - 1] += postParts.shift();
        p.push.apply(p, postParts);
      }
      parts.push.apply(parts, p);
      return parts;
    }
    function expandTop(str) {
      if (!str) return [];
      if (str.substr(0, 2) === '{}') {
        str = '\\{\\}' + str.substr(2);
      }
      return expand(escapeBraces(str), true).map(unescapeBraces);
    }
    function embrace(str) {
      return '{' + str + '}';
    }
    function isPadded(el) {
      return /^-?0\d/.test(el);
    }
    function lte(i, y) {
      return i <= y;
    }
    function gte(i, y) {
      return i >= y;
    }
    function expand(str, isTop) {
      var expansions = [];
      var m = balanced('{', '}', str);
      if (!m || /\$$/.test(m.pre)) return [str];
      var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
      var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
      var isSequence = isNumericSequence || isAlphaSequence;
      var isOptions = m.body.indexOf(',') >= 0;
      if (!isSequence && !isOptions) {
        if (m.post.match(/,.*\}/)) {
          str = m.pre + '{' + m.body + escClose + m.post;
          return expand(str);
        }
        return [str];
      }
      var n;
      if (isSequence) {
        n = m.body.split(/\.\./);
      } else {
        n = parseCommaParts(m.body);
        if (n.length === 1) {
          n = expand(n[0], false).map(embrace);
          if (n.length === 1) {
            var post = m.post.length ? expand(m.post, false) : [''];
            return post.map(function (p) {
              return m.pre + n[0] + p;
            });
          }
        }
      }
      var pre = m.pre;
      var post = m.post.length ? expand(m.post, false) : [''];
      var N;
      if (isSequence) {
        var x = numeric(n[0]);
        var y = numeric(n[1]);
        var width = Math.max(n[0].length, n[1].length);
        var incr = n.length == 3 ? Math.abs(numeric(n[2])) : 1;
        var test = lte;
        var reverse = y < x;
        if (reverse) {
          incr *= -1;
          test = gte;
        }
        var pad = n.some(isPadded);
        N = [];
        for (var i = x; test(i, y); i += incr) {
          var c;
          if (isAlphaSequence) {
            c = String.fromCharCode(i);
            if (c === '\\') c = '';
          } else {
            c = String(i);
            if (pad) {
              var need = width - c.length;
              if (need > 0) {
                var z = new Array(need + 1).join('0');
                if (i < 0) c = '-' + z + c.slice(1);
                else c = z + c;
              }
            }
          }
          N.push(c);
        }
      } else {
        N = concatMap(n, function (el) {
          return expand(el, false);
        });
      }
      for (var j = 0; j < N.length; j++) {
        for (var k = 0; k < post.length; k++) {
          var expansion = pre + N[j] + post[k];
          if (!isTop || isSequence || expansion) expansions.push(expansion);
        }
      }
      return expansions;
    }
  }
});

// node_modules/minimatch/minimatch.js
var require_minimatch = __commonJS({
  'node_modules/minimatch/minimatch.js'(exports2, module2) {
    module2.exports = minimatch;
    minimatch.Minimatch = Minimatch;
    var path = { sep: '/' };
    try {
      path = require('path');
    } catch (er) {}
    var GLOBSTAR = (minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {});
    var expand = require_brace_expansion();
    var plTypes = {
      '!': { open: '(?:(?!(?:', close: '))[^/]*?)' },
      '?': { open: '(?:', close: ')?' },
      '+': { open: '(?:', close: ')+' },
      '*': { open: '(?:', close: ')*' },
      '@': { open: '(?:', close: ')' }
    };
    var qmark = '[^/]';
    var star = qmark + '*?';
    var twoStarDot = '(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?';
    var twoStarNoDot = '(?:(?!(?:\\/|^)\\.).)*?';
    var reSpecials = charSet('().*{}+?[]^$\\!');
    function charSet(s) {
      return s.split('').reduce(function (set, c) {
        set[c] = true;
        return set;
      }, {});
    }
    var slashSplit = /\/+/;
    minimatch.filter = filter;
    function filter(pattern, options) {
      options = options || {};
      return function (p, i, list) {
        return minimatch(p, pattern, options);
      };
    }
    function ext(a, b) {
      a = a || {};
      b = b || {};
      var t = {};
      Object.keys(b).forEach(function (k) {
        t[k] = b[k];
      });
      Object.keys(a).forEach(function (k) {
        t[k] = a[k];
      });
      return t;
    }
    minimatch.defaults = function (def) {
      if (!def || !Object.keys(def).length) return minimatch;
      var orig = minimatch;
      var m = function minimatch2(p, pattern, options) {
        return orig.minimatch(p, pattern, ext(def, options));
      };
      m.Minimatch = function Minimatch2(pattern, options) {
        return new orig.Minimatch(pattern, ext(def, options));
      };
      return m;
    };
    Minimatch.defaults = function (def) {
      if (!def || !Object.keys(def).length) return Minimatch;
      return minimatch.defaults(def).Minimatch;
    };
    function minimatch(p, pattern, options) {
      if (typeof pattern !== 'string') {
        throw new TypeError('glob pattern string required');
      }
      if (!options) options = {};
      if (!options.nocomment && pattern.charAt(0) === '#') {
        return false;
      }
      if (pattern.trim() === '') return p === '';
      return new Minimatch(pattern, options).match(p);
    }
    function Minimatch(pattern, options) {
      if (!(this instanceof Minimatch)) {
        return new Minimatch(pattern, options);
      }
      if (typeof pattern !== 'string') {
        throw new TypeError('glob pattern string required');
      }
      if (!options) options = {};
      pattern = pattern.trim();
      if (path.sep !== '/') {
        pattern = pattern.split(path.sep).join('/');
      }
      this.options = options;
      this.set = [];
      this.pattern = pattern;
      this.regexp = null;
      this.negate = false;
      this.comment = false;
      this.empty = false;
      this.make();
    }
    Minimatch.prototype.debug = function () {};
    Minimatch.prototype.make = make;
    function make() {
      if (this._made) return;
      var pattern = this.pattern;
      var options = this.options;
      if (!options.nocomment && pattern.charAt(0) === '#') {
        this.comment = true;
        return;
      }
      if (!pattern) {
        this.empty = true;
        return;
      }
      this.parseNegate();
      var set = (this.globSet = this.braceExpand());
      if (options.debug) this.debug = console.error;
      this.debug(this.pattern, set);
      set = this.globParts = set.map(function (s) {
        return s.split(slashSplit);
      });
      this.debug(this.pattern, set);
      set = set.map(function (s, si, set2) {
        return s.map(this.parse, this);
      }, this);
      this.debug(this.pattern, set);
      set = set.filter(function (s) {
        return s.indexOf(false) === -1;
      });
      this.debug(this.pattern, set);
      this.set = set;
    }
    Minimatch.prototype.parseNegate = parseNegate;
    function parseNegate() {
      var pattern = this.pattern;
      var negate = false;
      var options = this.options;
      var negateOffset = 0;
      if (options.nonegate) return;
      for (var i = 0, l = pattern.length; i < l && pattern.charAt(i) === '!'; i++) {
        negate = !negate;
        negateOffset++;
      }
      if (negateOffset) this.pattern = pattern.substr(negateOffset);
      this.negate = negate;
    }
    minimatch.braceExpand = function (pattern, options) {
      return braceExpand(pattern, options);
    };
    Minimatch.prototype.braceExpand = braceExpand;
    function braceExpand(pattern, options) {
      if (!options) {
        if (this instanceof Minimatch) {
          options = this.options;
        } else {
          options = {};
        }
      }
      pattern = typeof pattern === 'undefined' ? this.pattern : pattern;
      if (typeof pattern === 'undefined') {
        throw new TypeError('undefined pattern');
      }
      if (options.nobrace || !pattern.match(/\{.*\}/)) {
        return [pattern];
      }
      return expand(pattern);
    }
    Minimatch.prototype.parse = parse;
    var SUBPARSE = {};
    function parse(pattern, isSub) {
      if (pattern.length > 1024 * 64) {
        throw new TypeError('pattern is too long');
      }
      var options = this.options;
      if (!options.noglobstar && pattern === '**') return GLOBSTAR;
      if (pattern === '') return '';
      var re = '';
      var hasMagic = !!options.nocase;
      var escaping = false;
      var patternListStack = [];
      var negativeLists = [];
      var stateChar;
      var inClass = false;
      var reClassStart = -1;
      var classStart = -1;
      var patternStart = pattern.charAt(0) === '.' ? '' : options.dot ? '(?!(?:^|\\/)\\.{1,2}(?:$|\\/))' : '(?!\\.)';
      var self = this;
      function clearStateChar() {
        if (stateChar) {
          switch (stateChar) {
            case '*':
              re += star;
              hasMagic = true;
              break;
            case '?':
              re += qmark;
              hasMagic = true;
              break;
            default:
              re += '\\' + stateChar;
              break;
          }
          self.debug('clearStateChar %j %j', stateChar, re);
          stateChar = false;
        }
      }
      for (var i = 0, len = pattern.length, c; i < len && (c = pattern.charAt(i)); i++) {
        this.debug('%s	%s %s %j', pattern, i, re, c);
        if (escaping && reSpecials[c]) {
          re += '\\' + c;
          escaping = false;
          continue;
        }
        switch (c) {
          case '/':
            return false;
          case '\\':
            clearStateChar();
            escaping = true;
            continue;
          case '?':
          case '*':
          case '+':
          case '@':
          case '!':
            this.debug('%s	%s %s %j <-- stateChar', pattern, i, re, c);
            if (inClass) {
              this.debug('  in class');
              if (c === '!' && i === classStart + 1) c = '^';
              re += c;
              continue;
            }
            self.debug('call clearStateChar %j', stateChar);
            clearStateChar();
            stateChar = c;
            if (options.noext) clearStateChar();
            continue;
          case '(':
            if (inClass) {
              re += '(';
              continue;
            }
            if (!stateChar) {
              re += '\\(';
              continue;
            }
            patternListStack.push({
              type: stateChar,
              start: i - 1,
              reStart: re.length,
              open: plTypes[stateChar].open,
              close: plTypes[stateChar].close
            });
            re += stateChar === '!' ? '(?:(?!(?:' : '(?:';
            this.debug('plType %j %j', stateChar, re);
            stateChar = false;
            continue;
          case ')':
            if (inClass || !patternListStack.length) {
              re += '\\)';
              continue;
            }
            clearStateChar();
            hasMagic = true;
            var pl = patternListStack.pop();
            re += pl.close;
            if (pl.type === '!') {
              negativeLists.push(pl);
            }
            pl.reEnd = re.length;
            continue;
          case '|':
            if (inClass || !patternListStack.length || escaping) {
              re += '\\|';
              escaping = false;
              continue;
            }
            clearStateChar();
            re += '|';
            continue;
          case '[':
            clearStateChar();
            if (inClass) {
              re += '\\' + c;
              continue;
            }
            inClass = true;
            classStart = i;
            reClassStart = re.length;
            re += c;
            continue;
          case ']':
            if (i === classStart + 1 || !inClass) {
              re += '\\' + c;
              escaping = false;
              continue;
            }
            if (inClass) {
              var cs = pattern.substring(classStart + 1, i);
              try {
                RegExp('[' + cs + ']');
              } catch (er) {
                var sp = this.parse(cs, SUBPARSE);
                re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]';
                hasMagic = hasMagic || sp[1];
                inClass = false;
                continue;
              }
            }
            hasMagic = true;
            inClass = false;
            re += c;
            continue;
          default:
            clearStateChar();
            if (escaping) {
              escaping = false;
            } else if (reSpecials[c] && !(c === '^' && inClass)) {
              re += '\\';
            }
            re += c;
        }
      }
      if (inClass) {
        cs = pattern.substr(classStart + 1);
        sp = this.parse(cs, SUBPARSE);
        re = re.substr(0, reClassStart) + '\\[' + sp[0];
        hasMagic = hasMagic || sp[1];
      }
      for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
        var tail = re.slice(pl.reStart + pl.open.length);
        this.debug('setting tail', re, pl);
        tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
          if (!$2) {
            $2 = '\\';
          }
          return $1 + $1 + $2 + '|';
        });
        this.debug('tail=%j\n   %s', tail, tail, pl, re);
        var t = pl.type === '*' ? star : pl.type === '?' ? qmark : '\\' + pl.type;
        hasMagic = true;
        re = re.slice(0, pl.reStart) + t + '\\(' + tail;
      }
      clearStateChar();
      if (escaping) {
        re += '\\\\';
      }
      var addPatternStart = false;
      switch (re.charAt(0)) {
        case '.':
        case '[':
        case '(':
          addPatternStart = true;
      }
      for (var n = negativeLists.length - 1; n > -1; n--) {
        var nl = negativeLists[n];
        var nlBefore = re.slice(0, nl.reStart);
        var nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
        var nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
        var nlAfter = re.slice(nl.reEnd);
        nlLast += nlAfter;
        var openParensBefore = nlBefore.split('(').length - 1;
        var cleanAfter = nlAfter;
        for (i = 0; i < openParensBefore; i++) {
          cleanAfter = cleanAfter.replace(/\)[+*?]?/, '');
        }
        nlAfter = cleanAfter;
        var dollar = '';
        if (nlAfter === '' && isSub !== SUBPARSE) {
          dollar = '$';
        }
        var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
        re = newRe;
      }
      if (re !== '' && hasMagic) {
        re = '(?=.)' + re;
      }
      if (addPatternStart) {
        re = patternStart + re;
      }
      if (isSub === SUBPARSE) {
        return [re, hasMagic];
      }
      if (!hasMagic) {
        return globUnescape(pattern);
      }
      var flags = options.nocase ? 'i' : '';
      try {
        var regExp = new RegExp('^' + re + '$', flags);
      } catch (er) {
        return new RegExp('$.');
      }
      regExp._glob = pattern;
      regExp._src = re;
      return regExp;
    }
    minimatch.makeRe = function (pattern, options) {
      return new Minimatch(pattern, options || {}).makeRe();
    };
    Minimatch.prototype.makeRe = makeRe;
    function makeRe() {
      if (this.regexp || this.regexp === false) return this.regexp;
      var set = this.set;
      if (!set.length) {
        this.regexp = false;
        return this.regexp;
      }
      var options = this.options;
      var twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
      var flags = options.nocase ? 'i' : '';
      var re = set
        .map(function (pattern) {
          return pattern
            .map(function (p) {
              return p === GLOBSTAR ? twoStar : typeof p === 'string' ? regExpEscape(p) : p._src;
            })
            .join('\\/');
        })
        .join('|');
      re = '^(?:' + re + ')$';
      if (this.negate) re = '^(?!' + re + ').*$';
      try {
        this.regexp = new RegExp(re, flags);
      } catch (ex) {
        this.regexp = false;
      }
      return this.regexp;
    }
    minimatch.match = function (list, pattern, options) {
      options = options || {};
      var mm = new Minimatch(pattern, options);
      list = list.filter(function (f) {
        return mm.match(f);
      });
      if (mm.options.nonull && !list.length) {
        list.push(pattern);
      }
      return list;
    };
    Minimatch.prototype.match = match;
    function match(f, partial) {
      this.debug('match', f, this.pattern);
      if (this.comment) return false;
      if (this.empty) return f === '';
      if (f === '/' && partial) return true;
      var options = this.options;
      if (path.sep !== '/') {
        f = f.split(path.sep).join('/');
      }
      f = f.split(slashSplit);
      this.debug(this.pattern, 'split', f);
      var set = this.set;
      this.debug(this.pattern, 'set', set);
      var filename;
      var i;
      for (i = f.length - 1; i >= 0; i--) {
        filename = f[i];
        if (filename) break;
      }
      for (i = 0; i < set.length; i++) {
        var pattern = set[i];
        var file = f;
        if (options.matchBase && pattern.length === 1) {
          file = [filename];
        }
        var hit = this.matchOne(file, pattern, partial);
        if (hit) {
          if (options.flipNegate) return true;
          return !this.negate;
        }
      }
      if (options.flipNegate) return false;
      return this.negate;
    }
    Minimatch.prototype.matchOne = function (file, pattern, partial) {
      var options = this.options;
      this.debug('matchOne', { this: this, file, pattern });
      this.debug('matchOne', file.length, pattern.length);
      for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
        this.debug('matchOne loop');
        var p = pattern[pi];
        var f = file[fi];
        this.debug(pattern, p, f);
        if (p === false) return false;
        if (p === GLOBSTAR) {
          this.debug('GLOBSTAR', [pattern, p, f]);
          var fr = fi;
          var pr = pi + 1;
          if (pr === pl) {
            this.debug('** at the end');
            for (; fi < fl; fi++) {
              if (file[fi] === '.' || file[fi] === '..' || (!options.dot && file[fi].charAt(0) === '.')) return false;
            }
            return true;
          }
          while (fr < fl) {
            var swallowee = file[fr];
            this.debug('\nglobstar while', file, fr, pattern, pr, swallowee);
            if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
              this.debug('globstar found match!', fr, fl, swallowee);
              return true;
            } else {
              if (swallowee === '.' || swallowee === '..' || (!options.dot && swallowee.charAt(0) === '.')) {
                this.debug('dot detected!', file, fr, pattern, pr);
                break;
              }
              this.debug('globstar swallow a segment, and continue');
              fr++;
            }
          }
          if (partial) {
            this.debug('\n>>> no match, partial?', file, fr, pattern, pr);
            if (fr === fl) return true;
          }
          return false;
        }
        var hit;
        if (typeof p === 'string') {
          if (options.nocase) {
            hit = f.toLowerCase() === p.toLowerCase();
          } else {
            hit = f === p;
          }
          this.debug('string match', p, f, hit);
        } else {
          hit = f.match(p);
          this.debug('pattern match', p, f, hit);
        }
        if (!hit) return false;
      }
      if (fi === fl && pi === pl) {
        return true;
      } else if (fi === fl) {
        return partial;
      } else if (pi === pl) {
        var emptyFileEnd = fi === fl - 1 && file[fi] === '';
        return emptyFileEnd;
      }
      throw new Error('wtf?');
    };
    function globUnescape(s) {
      return s.replace(/\\(.)/g, '$1');
    }
    function regExpEscape(s) {
      return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }
  }
});

// node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  'node_modules/inherits/inherits_browser.js'(exports2, module2) {
    if (typeof Object.create === 'function') {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function () {};
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
  }
});

// node_modules/inherits/inherits.js
var require_inherits = __commonJS({
  'node_modules/inherits/inherits.js'(exports2, module2) {
    try {
      util = require('util');
      if (typeof util.inherits !== 'function') throw '';
      module2.exports = util.inherits;
    } catch (e) {
      module2.exports = require_inherits_browser();
    }
    var util;
  }
});

// node_modules/path-is-absolute/index.js
var require_path_is_absolute = __commonJS({
  'node_modules/path-is-absolute/index.js'(exports2, module2) {
    'use strict';
    function posix(path) {
      return path.charAt(0) === '/';
    }
    function win32(path) {
      var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
      var result = splitDeviceRe.exec(path);
      var device = result[1] || '';
      var isUnc = Boolean(device && device.charAt(1) !== ':');
      return Boolean(result[2] || isUnc);
    }
    module2.exports = process.platform === 'win32' ? win32 : posix;
    module2.exports.posix = posix;
    module2.exports.win32 = win32;
  }
});

// node_modules/glob/common.js
var require_common = __commonJS({
  'node_modules/glob/common.js'(exports2) {
    exports2.setopts = setopts;
    exports2.ownProp = ownProp;
    exports2.makeAbs = makeAbs;
    exports2.finish = finish;
    exports2.mark = mark;
    exports2.isIgnored = isIgnored;
    exports2.childrenIgnored = childrenIgnored;
    function ownProp(obj, field) {
      return Object.prototype.hasOwnProperty.call(obj, field);
    }
    var path = require('path');
    var minimatch = require_minimatch();
    var isAbsolute = require_path_is_absolute();
    var Minimatch = minimatch.Minimatch;
    function alphasort(a, b) {
      return a.localeCompare(b, 'en');
    }
    function setupIgnores(self, options) {
      self.ignore = options.ignore || [];
      if (!Array.isArray(self.ignore)) self.ignore = [self.ignore];
      if (self.ignore.length) {
        self.ignore = self.ignore.map(ignoreMap);
      }
    }
    function ignoreMap(pattern) {
      var gmatcher = null;
      if (pattern.slice(-3) === '/**') {
        var gpattern = pattern.replace(/(\/\*\*)+$/, '');
        gmatcher = new Minimatch(gpattern, { dot: true });
      }
      return {
        matcher: new Minimatch(pattern, { dot: true }),
        gmatcher
      };
    }
    function setopts(self, pattern, options) {
      if (!options) options = {};
      if (options.matchBase && pattern.indexOf('/') === -1) {
        if (options.noglobstar) {
          throw new Error('base matching requires globstar');
        }
        pattern = '**/' + pattern;
      }
      self.silent = !!options.silent;
      self.pattern = pattern;
      self.strict = options.strict !== false;
      self.realpath = !!options.realpath;
      self.realpathCache = options.realpathCache || Object.create(null);
      self.follow = !!options.follow;
      self.dot = !!options.dot;
      self.mark = !!options.mark;
      self.nodir = !!options.nodir;
      if (self.nodir) self.mark = true;
      self.sync = !!options.sync;
      self.nounique = !!options.nounique;
      self.nonull = !!options.nonull;
      self.nosort = !!options.nosort;
      self.nocase = !!options.nocase;
      self.stat = !!options.stat;
      self.noprocess = !!options.noprocess;
      self.absolute = !!options.absolute;
      self.maxLength = options.maxLength || Infinity;
      self.cache = options.cache || Object.create(null);
      self.statCache = options.statCache || Object.create(null);
      self.symlinks = options.symlinks || Object.create(null);
      setupIgnores(self, options);
      self.changedCwd = false;
      var cwd = process.cwd();
      if (!ownProp(options, 'cwd')) self.cwd = cwd;
      else {
        self.cwd = path.resolve(options.cwd);
        self.changedCwd = self.cwd !== cwd;
      }
      self.root = options.root || path.resolve(self.cwd, '/');
      self.root = path.resolve(self.root);
      if (process.platform === 'win32') self.root = self.root.replace(/\\/g, '/');
      self.cwdAbs = isAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd);
      if (process.platform === 'win32') self.cwdAbs = self.cwdAbs.replace(/\\/g, '/');
      self.nomount = !!options.nomount;
      options.nonegate = true;
      options.nocomment = true;
      self.minimatch = new Minimatch(pattern, options);
      self.options = self.minimatch.options;
    }
    function finish(self) {
      var nou = self.nounique;
      var all = nou ? [] : Object.create(null);
      for (var i = 0, l = self.matches.length; i < l; i++) {
        var matches = self.matches[i];
        if (!matches || Object.keys(matches).length === 0) {
          if (self.nonull) {
            var literal = self.minimatch.globSet[i];
            if (nou) all.push(literal);
            else all[literal] = true;
          }
        } else {
          var m = Object.keys(matches);
          if (nou) all.push.apply(all, m);
          else
            m.forEach(function (m2) {
              all[m2] = true;
            });
        }
      }
      if (!nou) all = Object.keys(all);
      if (!self.nosort) all = all.sort(alphasort);
      if (self.mark) {
        for (var i = 0; i < all.length; i++) {
          all[i] = self._mark(all[i]);
        }
        if (self.nodir) {
          all = all.filter(function (e) {
            var notDir = !/\/$/.test(e);
            var c = self.cache[e] || self.cache[makeAbs(self, e)];
            if (notDir && c) notDir = c !== 'DIR' && !Array.isArray(c);
            return notDir;
          });
        }
      }
      if (self.ignore.length)
        all = all.filter(function (m2) {
          return !isIgnored(self, m2);
        });
      self.found = all;
    }
    function mark(self, p) {
      var abs = makeAbs(self, p);
      var c = self.cache[abs];
      var m = p;
      if (c) {
        var isDir = c === 'DIR' || Array.isArray(c);
        var slash = p.slice(-1) === '/';
        if (isDir && !slash) m += '/';
        else if (!isDir && slash) m = m.slice(0, -1);
        if (m !== p) {
          var mabs = makeAbs(self, m);
          self.statCache[mabs] = self.statCache[abs];
          self.cache[mabs] = self.cache[abs];
        }
      }
      return m;
    }
    function makeAbs(self, f) {
      var abs = f;
      if (f.charAt(0) === '/') {
        abs = path.join(self.root, f);
      } else if (isAbsolute(f) || f === '') {
        abs = f;
      } else if (self.changedCwd) {
        abs = path.resolve(self.cwd, f);
      } else {
        abs = path.resolve(f);
      }
      if (process.platform === 'win32') abs = abs.replace(/\\/g, '/');
      return abs;
    }
    function isIgnored(self, path2) {
      if (!self.ignore.length) return false;
      return self.ignore.some(function (item) {
        return item.matcher.match(path2) || !!(item.gmatcher && item.gmatcher.match(path2));
      });
    }
    function childrenIgnored(self, path2) {
      if (!self.ignore.length) return false;
      return self.ignore.some(function (item) {
        return !!(item.gmatcher && item.gmatcher.match(path2));
      });
    }
  }
});

// node_modules/glob/sync.js
var require_sync = __commonJS({
  'node_modules/glob/sync.js'(exports2, module2) {
    module2.exports = globSync;
    globSync.GlobSync = GlobSync;
    var fs = require('fs');
    var rp = require_fs();
    var minimatch = require_minimatch();
    var Minimatch = minimatch.Minimatch;
    var Glob = require_glob().Glob;
    var util = require('util');
    var path = require('path');
    var assert = require('assert');
    var isAbsolute = require_path_is_absolute();
    var common = require_common();
    var setopts = common.setopts;
    var ownProp = common.ownProp;
    var childrenIgnored = common.childrenIgnored;
    var isIgnored = common.isIgnored;
    function globSync(pattern, options) {
      if (typeof options === 'function' || arguments.length === 3)
        throw new TypeError('callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167');
      return new GlobSync(pattern, options).found;
    }
    function GlobSync(pattern, options) {
      if (!pattern) throw new Error('must provide pattern');
      if (typeof options === 'function' || arguments.length === 3)
        throw new TypeError('callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167');
      if (!(this instanceof GlobSync)) return new GlobSync(pattern, options);
      setopts(this, pattern, options);
      if (this.noprocess) return this;
      var n = this.minimatch.set.length;
      this.matches = new Array(n);
      for (var i = 0; i < n; i++) {
        this._process(this.minimatch.set[i], i, false);
      }
      this._finish();
    }
    GlobSync.prototype._finish = function () {
      assert(this instanceof GlobSync);
      if (this.realpath) {
        var self = this;
        this.matches.forEach(function (matchset, index) {
          var set = (self.matches[index] = Object.create(null));
          for (var p in matchset) {
            try {
              p = self._makeAbs(p);
              var real = rp.realpathSync(p, self.realpathCache);
              set[real] = true;
            } catch (er) {
              if (er.syscall === 'stat') set[self._makeAbs(p)] = true;
              else throw er;
            }
          }
        });
      }
      common.finish(this);
    };
    GlobSync.prototype._process = function (pattern, index, inGlobStar) {
      assert(this instanceof GlobSync);
      var n = 0;
      while (typeof pattern[n] === 'string') {
        n++;
      }
      var prefix;
      switch (n) {
        case pattern.length:
          this._processSimple(pattern.join('/'), index);
          return;
        case 0:
          prefix = null;
          break;
        default:
          prefix = pattern.slice(0, n).join('/');
          break;
      }
      var remain = pattern.slice(n);
      var read;
      if (prefix === null) read = '.';
      else if (isAbsolute(prefix) || isAbsolute(pattern.join('/'))) {
        if (!prefix || !isAbsolute(prefix)) prefix = '/' + prefix;
        read = prefix;
      } else read = prefix;
      var abs = this._makeAbs(read);
      if (childrenIgnored(this, read)) return;
      var isGlobStar = remain[0] === minimatch.GLOBSTAR;
      if (isGlobStar) this._processGlobStar(prefix, read, abs, remain, index, inGlobStar);
      else this._processReaddir(prefix, read, abs, remain, index, inGlobStar);
    };
    GlobSync.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar) {
      var entries = this._readdir(abs, inGlobStar);
      if (!entries) return;
      var pn = remain[0];
      var negate = !!this.minimatch.negate;
      var rawGlob = pn._glob;
      var dotOk = this.dot || rawGlob.charAt(0) === '.';
      var matchedEntries = [];
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (e.charAt(0) !== '.' || dotOk) {
          var m;
          if (negate && !prefix) {
            m = !e.match(pn);
          } else {
            m = e.match(pn);
          }
          if (m) matchedEntries.push(e);
        }
      }
      var len = matchedEntries.length;
      if (len === 0) return;
      if (remain.length === 1 && !this.mark && !this.stat) {
        if (!this.matches[index]) this.matches[index] = Object.create(null);
        for (var i = 0; i < len; i++) {
          var e = matchedEntries[i];
          if (prefix) {
            if (prefix.slice(-1) !== '/') e = prefix + '/' + e;
            else e = prefix + e;
          }
          if (e.charAt(0) === '/' && !this.nomount) {
            e = path.join(this.root, e);
          }
          this._emitMatch(index, e);
        }
        return;
      }
      remain.shift();
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        var newPattern;
        if (prefix) newPattern = [prefix, e];
        else newPattern = [e];
        this._process(newPattern.concat(remain), index, inGlobStar);
      }
    };
    GlobSync.prototype._emitMatch = function (index, e) {
      if (isIgnored(this, e)) return;
      var abs = this._makeAbs(e);
      if (this.mark) e = this._mark(e);
      if (this.absolute) {
        e = abs;
      }
      if (this.matches[index][e]) return;
      if (this.nodir) {
        var c = this.cache[abs];
        if (c === 'DIR' || Array.isArray(c)) return;
      }
      this.matches[index][e] = true;
      if (this.stat) this._stat(e);
    };
    GlobSync.prototype._readdirInGlobStar = function (abs) {
      if (this.follow) return this._readdir(abs, false);
      var entries;
      var lstat;
      var stat;
      try {
        lstat = fs.lstatSync(abs);
      } catch (er) {
        if (er.code === 'ENOENT') {
          return null;
        }
      }
      var isSym = lstat && lstat.isSymbolicLink();
      this.symlinks[abs] = isSym;
      if (!isSym && lstat && !lstat.isDirectory()) this.cache[abs] = 'FILE';
      else entries = this._readdir(abs, false);
      return entries;
    };
    GlobSync.prototype._readdir = function (abs, inGlobStar) {
      var entries;
      if (inGlobStar && !ownProp(this.symlinks, abs)) return this._readdirInGlobStar(abs);
      if (ownProp(this.cache, abs)) {
        var c = this.cache[abs];
        if (!c || c === 'FILE') return null;
        if (Array.isArray(c)) return c;
      }
      try {
        return this._readdirEntries(abs, fs.readdirSync(abs));
      } catch (er) {
        this._readdirError(abs, er);
        return null;
      }
    };
    GlobSync.prototype._readdirEntries = function (abs, entries) {
      if (!this.mark && !this.stat) {
        for (var i = 0; i < entries.length; i++) {
          var e = entries[i];
          if (abs === '/') e = abs + e;
          else e = abs + '/' + e;
          this.cache[e] = true;
        }
      }
      this.cache[abs] = entries;
      return entries;
    };
    GlobSync.prototype._readdirError = function (f, er) {
      switch (er.code) {
        case 'ENOTSUP':
        case 'ENOTDIR':
          var abs = this._makeAbs(f);
          this.cache[abs] = 'FILE';
          if (abs === this.cwdAbs) {
            var error = new Error(er.code + ' invalid cwd ' + this.cwd);
            error.path = this.cwd;
            error.code = er.code;
            throw error;
          }
          break;
        case 'ENOENT':
        case 'ELOOP':
        case 'ENAMETOOLONG':
        case 'UNKNOWN':
          this.cache[this._makeAbs(f)] = false;
          break;
        default:
          this.cache[this._makeAbs(f)] = false;
          if (this.strict) throw er;
          if (!this.silent) console.error('glob error', er);
          break;
      }
    };
    GlobSync.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar) {
      var entries = this._readdir(abs, inGlobStar);
      if (!entries) return;
      var remainWithoutGlobStar = remain.slice(1);
      var gspref = prefix ? [prefix] : [];
      var noGlobStar = gspref.concat(remainWithoutGlobStar);
      this._process(noGlobStar, index, false);
      var len = entries.length;
      var isSym = this.symlinks[abs];
      if (isSym && inGlobStar) return;
      for (var i = 0; i < len; i++) {
        var e = entries[i];
        if (e.charAt(0) === '.' && !this.dot) continue;
        var instead = gspref.concat(entries[i], remainWithoutGlobStar);
        this._process(instead, index, true);
        var below = gspref.concat(entries[i], remain);
        this._process(below, index, true);
      }
    };
    GlobSync.prototype._processSimple = function (prefix, index) {
      var exists = this._stat(prefix);
      if (!this.matches[index]) this.matches[index] = Object.create(null);
      if (!exists) return;
      if (prefix && isAbsolute(prefix) && !this.nomount) {
        var trail = /[\/\\]$/.test(prefix);
        if (prefix.charAt(0) === '/') {
          prefix = path.join(this.root, prefix);
        } else {
          prefix = path.resolve(this.root, prefix);
          if (trail) prefix += '/';
        }
      }
      if (process.platform === 'win32') prefix = prefix.replace(/\\/g, '/');
      this._emitMatch(index, prefix);
    };
    GlobSync.prototype._stat = function (f) {
      var abs = this._makeAbs(f);
      var needDir = f.slice(-1) === '/';
      if (f.length > this.maxLength) return false;
      if (!this.stat && ownProp(this.cache, abs)) {
        var c = this.cache[abs];
        if (Array.isArray(c)) c = 'DIR';
        if (!needDir || c === 'DIR') return c;
        if (needDir && c === 'FILE') return false;
      }
      var exists;
      var stat = this.statCache[abs];
      if (!stat) {
        var lstat;
        try {
          lstat = fs.lstatSync(abs);
        } catch (er) {
          if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
            this.statCache[abs] = false;
            return false;
          }
        }
        if (lstat && lstat.isSymbolicLink()) {
          try {
            stat = fs.statSync(abs);
          } catch (er) {
            stat = lstat;
          }
        } else {
          stat = lstat;
        }
      }
      this.statCache[abs] = stat;
      var c = true;
      if (stat) c = stat.isDirectory() ? 'DIR' : 'FILE';
      this.cache[abs] = this.cache[abs] || c;
      if (needDir && c === 'FILE') return false;
      return c;
    };
    GlobSync.prototype._mark = function (p) {
      return common.mark(this, p);
    };
    GlobSync.prototype._makeAbs = function (f) {
      return common.makeAbs(this, f);
    };
  }
});

// node_modules/wrappy/wrappy.js
var require_wrappy = __commonJS({
  'node_modules/wrappy/wrappy.js'(exports2, module2) {
    module2.exports = wrappy;
    function wrappy(fn, cb) {
      if (fn && cb) return wrappy(fn)(cb);
      if (typeof fn !== 'function') throw new TypeError('need wrapper function');
      Object.keys(fn).forEach(function (k) {
        wrapper[k] = fn[k];
      });
      return wrapper;
      function wrapper() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        var ret = fn.apply(this, args);
        var cb2 = args[args.length - 1];
        if (typeof ret === 'function' && ret !== cb2) {
          Object.keys(cb2).forEach(function (k) {
            ret[k] = cb2[k];
          });
        }
        return ret;
      }
    }
  }
});

// node_modules/once/once.js
var require_once = __commonJS({
  'node_modules/once/once.js'(exports2, module2) {
    var wrappy = require_wrappy();
    module2.exports = wrappy(once);
    module2.exports.strict = wrappy(onceStrict);
    once.proto = once(function () {
      Object.defineProperty(Function.prototype, 'once', {
        value: function () {
          return once(this);
        },
        configurable: true
      });
      Object.defineProperty(Function.prototype, 'onceStrict', {
        value: function () {
          return onceStrict(this);
        },
        configurable: true
      });
    });
    function once(fn) {
      var f = function () {
        if (f.called) return f.value;
        f.called = true;
        return (f.value = fn.apply(this, arguments));
      };
      f.called = false;
      return f;
    }
    function onceStrict(fn) {
      var f = function () {
        if (f.called) throw new Error(f.onceError);
        f.called = true;
        return (f.value = fn.apply(this, arguments));
      };
      var name = fn.name || 'Function wrapped with `once`';
      f.onceError = name + " shouldn't be called more than once";
      f.called = false;
      return f;
    }
  }
});

// node_modules/inflight/inflight.js
var require_inflight = __commonJS({
  'node_modules/inflight/inflight.js'(exports2, module2) {
    var wrappy = require_wrappy();
    var reqs = Object.create(null);
    var once = require_once();
    module2.exports = wrappy(inflight);
    function inflight(key, cb) {
      if (reqs[key]) {
        reqs[key].push(cb);
        return null;
      } else {
        reqs[key] = [cb];
        return makeres(key);
      }
    }
    function makeres(key) {
      return once(function RES() {
        var cbs = reqs[key];
        var len = cbs.length;
        var args = slice(arguments);
        try {
          for (var i = 0; i < len; i++) {
            cbs[i].apply(null, args);
          }
        } finally {
          if (cbs.length > len) {
            cbs.splice(0, len);
            process.nextTick(function () {
              RES.apply(null, args);
            });
          } else {
            delete reqs[key];
          }
        }
      });
    }
    function slice(args) {
      var length = args.length;
      var array = [];
      for (var i = 0; i < length; i++) array[i] = args[i];
      return array;
    }
  }
});

// node_modules/glob/glob.js
var require_glob = __commonJS({
  'node_modules/glob/glob.js'(exports2, module2) {
    module2.exports = glob;
    var fs = require('fs');
    var rp = require_fs();
    var minimatch = require_minimatch();
    var Minimatch = minimatch.Minimatch;
    var inherits = require_inherits();
    var EE = require('events').EventEmitter;
    var path = require('path');
    var assert = require('assert');
    var isAbsolute = require_path_is_absolute();
    var globSync = require_sync();
    var common = require_common();
    var setopts = common.setopts;
    var ownProp = common.ownProp;
    var inflight = require_inflight();
    var util = require('util');
    var childrenIgnored = common.childrenIgnored;
    var isIgnored = common.isIgnored;
    var once = require_once();
    function glob(pattern, options, cb) {
      if (typeof options === 'function') (cb = options), (options = {});
      if (!options) options = {};
      if (options.sync) {
        if (cb) throw new TypeError('callback provided to sync glob');
        return globSync(pattern, options);
      }
      return new Glob(pattern, options, cb);
    }
    glob.sync = globSync;
    var GlobSync = (glob.GlobSync = globSync.GlobSync);
    glob.glob = glob;
    function extend(origin, add) {
      if (add === null || typeof add !== 'object') {
        return origin;
      }
      var keys = Object.keys(add);
      var i = keys.length;
      while (i--) {
        origin[keys[i]] = add[keys[i]];
      }
      return origin;
    }
    glob.hasMagic = function (pattern, options_) {
      var options = extend({}, options_);
      options.noprocess = true;
      var g = new Glob(pattern, options);
      var set = g.minimatch.set;
      if (!pattern) return false;
      if (set.length > 1) return true;
      for (var j = 0; j < set[0].length; j++) {
        if (typeof set[0][j] !== 'string') return true;
      }
      return false;
    };
    glob.Glob = Glob;
    inherits(Glob, EE);
    function Glob(pattern, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      if (options && options.sync) {
        if (cb) throw new TypeError('callback provided to sync glob');
        return new GlobSync(pattern, options);
      }
      if (!(this instanceof Glob)) return new Glob(pattern, options, cb);
      setopts(this, pattern, options);
      this._didRealPath = false;
      var n = this.minimatch.set.length;
      this.matches = new Array(n);
      if (typeof cb === 'function') {
        cb = once(cb);
        this.on('error', cb);
        this.on('end', function (matches) {
          cb(null, matches);
        });
      }
      var self = this;
      this._processing = 0;
      this._emitQueue = [];
      this._processQueue = [];
      this.paused = false;
      if (this.noprocess) return this;
      if (n === 0) return done();
      var sync = true;
      for (var i = 0; i < n; i++) {
        this._process(this.minimatch.set[i], i, false, done);
      }
      sync = false;
      function done() {
        --self._processing;
        if (self._processing <= 0) {
          if (sync) {
            process.nextTick(function () {
              self._finish();
            });
          } else {
            self._finish();
          }
        }
      }
    }
    Glob.prototype._finish = function () {
      assert(this instanceof Glob);
      if (this.aborted) return;
      if (this.realpath && !this._didRealpath) return this._realpath();
      common.finish(this);
      this.emit('end', this.found);
    };
    Glob.prototype._realpath = function () {
      if (this._didRealpath) return;
      this._didRealpath = true;
      var n = this.matches.length;
      if (n === 0) return this._finish();
      var self = this;
      for (var i = 0; i < this.matches.length; i++) this._realpathSet(i, next);
      function next() {
        if (--n === 0) self._finish();
      }
    };
    Glob.prototype._realpathSet = function (index, cb) {
      var matchset = this.matches[index];
      if (!matchset) return cb();
      var found = Object.keys(matchset);
      var self = this;
      var n = found.length;
      if (n === 0) return cb();
      var set = (this.matches[index] = Object.create(null));
      found.forEach(function (p, i) {
        p = self._makeAbs(p);
        rp.realpath(p, self.realpathCache, function (er, real) {
          if (!er) set[real] = true;
          else if (er.syscall === 'stat') set[p] = true;
          else self.emit('error', er);
          if (--n === 0) {
            self.matches[index] = set;
            cb();
          }
        });
      });
    };
    Glob.prototype._mark = function (p) {
      return common.mark(this, p);
    };
    Glob.prototype._makeAbs = function (f) {
      return common.makeAbs(this, f);
    };
    Glob.prototype.abort = function () {
      this.aborted = true;
      this.emit('abort');
    };
    Glob.prototype.pause = function () {
      if (!this.paused) {
        this.paused = true;
        this.emit('pause');
      }
    };
    Glob.prototype.resume = function () {
      if (this.paused) {
        this.emit('resume');
        this.paused = false;
        if (this._emitQueue.length) {
          var eq = this._emitQueue.slice(0);
          this._emitQueue.length = 0;
          for (var i = 0; i < eq.length; i++) {
            var e = eq[i];
            this._emitMatch(e[0], e[1]);
          }
        }
        if (this._processQueue.length) {
          var pq = this._processQueue.slice(0);
          this._processQueue.length = 0;
          for (var i = 0; i < pq.length; i++) {
            var p = pq[i];
            this._processing--;
            this._process(p[0], p[1], p[2], p[3]);
          }
        }
      }
    };
    Glob.prototype._process = function (pattern, index, inGlobStar, cb) {
      assert(this instanceof Glob);
      assert(typeof cb === 'function');
      if (this.aborted) return;
      this._processing++;
      if (this.paused) {
        this._processQueue.push([pattern, index, inGlobStar, cb]);
        return;
      }
      var n = 0;
      while (typeof pattern[n] === 'string') {
        n++;
      }
      var prefix;
      switch (n) {
        case pattern.length:
          this._processSimple(pattern.join('/'), index, cb);
          return;
        case 0:
          prefix = null;
          break;
        default:
          prefix = pattern.slice(0, n).join('/');
          break;
      }
      var remain = pattern.slice(n);
      var read;
      if (prefix === null) read = '.';
      else if (isAbsolute(prefix) || isAbsolute(pattern.join('/'))) {
        if (!prefix || !isAbsolute(prefix)) prefix = '/' + prefix;
        read = prefix;
      } else read = prefix;
      var abs = this._makeAbs(read);
      if (childrenIgnored(this, read)) return cb();
      var isGlobStar = remain[0] === minimatch.GLOBSTAR;
      if (isGlobStar) this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);
      else this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
    };
    Glob.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar, cb) {
      var self = this;
      this._readdir(abs, inGlobStar, function (er, entries) {
        return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
      });
    };
    Glob.prototype._processReaddir2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {
      if (!entries) return cb();
      var pn = remain[0];
      var negate = !!this.minimatch.negate;
      var rawGlob = pn._glob;
      var dotOk = this.dot || rawGlob.charAt(0) === '.';
      var matchedEntries = [];
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (e.charAt(0) !== '.' || dotOk) {
          var m;
          if (negate && !prefix) {
            m = !e.match(pn);
          } else {
            m = e.match(pn);
          }
          if (m) matchedEntries.push(e);
        }
      }
      var len = matchedEntries.length;
      if (len === 0) return cb();
      if (remain.length === 1 && !this.mark && !this.stat) {
        if (!this.matches[index]) this.matches[index] = Object.create(null);
        for (var i = 0; i < len; i++) {
          var e = matchedEntries[i];
          if (prefix) {
            if (prefix !== '/') e = prefix + '/' + e;
            else e = prefix + e;
          }
          if (e.charAt(0) === '/' && !this.nomount) {
            e = path.join(this.root, e);
          }
          this._emitMatch(index, e);
        }
        return cb();
      }
      remain.shift();
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        var newPattern;
        if (prefix) {
          if (prefix !== '/') e = prefix + '/' + e;
          else e = prefix + e;
        }
        this._process([e].concat(remain), index, inGlobStar, cb);
      }
      cb();
    };
    Glob.prototype._emitMatch = function (index, e) {
      if (this.aborted) return;
      if (isIgnored(this, e)) return;
      if (this.paused) {
        this._emitQueue.push([index, e]);
        return;
      }
      var abs = isAbsolute(e) ? e : this._makeAbs(e);
      if (this.mark) e = this._mark(e);
      if (this.absolute) e = abs;
      if (this.matches[index][e]) return;
      if (this.nodir) {
        var c = this.cache[abs];
        if (c === 'DIR' || Array.isArray(c)) return;
      }
      this.matches[index][e] = true;
      var st = this.statCache[abs];
      if (st) this.emit('stat', e, st);
      this.emit('match', e);
    };
    Glob.prototype._readdirInGlobStar = function (abs, cb) {
      if (this.aborted) return;
      if (this.follow) return this._readdir(abs, false, cb);
      var lstatkey = 'lstat\0' + abs;
      var self = this;
      var lstatcb = inflight(lstatkey, lstatcb_);
      if (lstatcb) fs.lstat(abs, lstatcb);
      function lstatcb_(er, lstat) {
        if (er && er.code === 'ENOENT') return cb();
        var isSym = lstat && lstat.isSymbolicLink();
        self.symlinks[abs] = isSym;
        if (!isSym && lstat && !lstat.isDirectory()) {
          self.cache[abs] = 'FILE';
          cb();
        } else self._readdir(abs, false, cb);
      }
    };
    Glob.prototype._readdir = function (abs, inGlobStar, cb) {
      if (this.aborted) return;
      cb = inflight('readdir\0' + abs + '\0' + inGlobStar, cb);
      if (!cb) return;
      if (inGlobStar && !ownProp(this.symlinks, abs)) return this._readdirInGlobStar(abs, cb);
      if (ownProp(this.cache, abs)) {
        var c = this.cache[abs];
        if (!c || c === 'FILE') return cb();
        if (Array.isArray(c)) return cb(null, c);
      }
      var self = this;
      fs.readdir(abs, readdirCb(this, abs, cb));
    };
    function readdirCb(self, abs, cb) {
      return function (er, entries) {
        if (er) self._readdirError(abs, er, cb);
        else self._readdirEntries(abs, entries, cb);
      };
    }
    Glob.prototype._readdirEntries = function (abs, entries, cb) {
      if (this.aborted) return;
      if (!this.mark && !this.stat) {
        for (var i = 0; i < entries.length; i++) {
          var e = entries[i];
          if (abs === '/') e = abs + e;
          else e = abs + '/' + e;
          this.cache[e] = true;
        }
      }
      this.cache[abs] = entries;
      return cb(null, entries);
    };
    Glob.prototype._readdirError = function (f, er, cb) {
      if (this.aborted) return;
      switch (er.code) {
        case 'ENOTSUP':
        case 'ENOTDIR':
          var abs = this._makeAbs(f);
          this.cache[abs] = 'FILE';
          if (abs === this.cwdAbs) {
            var error = new Error(er.code + ' invalid cwd ' + this.cwd);
            error.path = this.cwd;
            error.code = er.code;
            this.emit('error', error);
            this.abort();
          }
          break;
        case 'ENOENT':
        case 'ELOOP':
        case 'ENAMETOOLONG':
        case 'UNKNOWN':
          this.cache[this._makeAbs(f)] = false;
          break;
        default:
          this.cache[this._makeAbs(f)] = false;
          if (this.strict) {
            this.emit('error', er);
            this.abort();
          }
          if (!this.silent) console.error('glob error', er);
          break;
      }
      return cb();
    };
    Glob.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar, cb) {
      var self = this;
      this._readdir(abs, inGlobStar, function (er, entries) {
        self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
      });
    };
    Glob.prototype._processGlobStar2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {
      if (!entries) return cb();
      var remainWithoutGlobStar = remain.slice(1);
      var gspref = prefix ? [prefix] : [];
      var noGlobStar = gspref.concat(remainWithoutGlobStar);
      this._process(noGlobStar, index, false, cb);
      var isSym = this.symlinks[abs];
      var len = entries.length;
      if (isSym && inGlobStar) return cb();
      for (var i = 0; i < len; i++) {
        var e = entries[i];
        if (e.charAt(0) === '.' && !this.dot) continue;
        var instead = gspref.concat(entries[i], remainWithoutGlobStar);
        this._process(instead, index, true, cb);
        var below = gspref.concat(entries[i], remain);
        this._process(below, index, true, cb);
      }
      cb();
    };
    Glob.prototype._processSimple = function (prefix, index, cb) {
      var self = this;
      this._stat(prefix, function (er, exists) {
        self._processSimple2(prefix, index, er, exists, cb);
      });
    };
    Glob.prototype._processSimple2 = function (prefix, index, er, exists, cb) {
      if (!this.matches[index]) this.matches[index] = Object.create(null);
      if (!exists) return cb();
      if (prefix && isAbsolute(prefix) && !this.nomount) {
        var trail = /[\/\\]$/.test(prefix);
        if (prefix.charAt(0) === '/') {
          prefix = path.join(this.root, prefix);
        } else {
          prefix = path.resolve(this.root, prefix);
          if (trail) prefix += '/';
        }
      }
      if (process.platform === 'win32') prefix = prefix.replace(/\\/g, '/');
      this._emitMatch(index, prefix);
      cb();
    };
    Glob.prototype._stat = function (f, cb) {
      var abs = this._makeAbs(f);
      var needDir = f.slice(-1) === '/';
      if (f.length > this.maxLength) return cb();
      if (!this.stat && ownProp(this.cache, abs)) {
        var c = this.cache[abs];
        if (Array.isArray(c)) c = 'DIR';
        if (!needDir || c === 'DIR') return cb(null, c);
        if (needDir && c === 'FILE') return cb();
      }
      var exists;
      var stat = this.statCache[abs];
      if (stat !== void 0) {
        if (stat === false) return cb(null, stat);
        else {
          var type = stat.isDirectory() ? 'DIR' : 'FILE';
          if (needDir && type === 'FILE') return cb();
          else return cb(null, type, stat);
        }
      }
      var self = this;
      var statcb = inflight('stat\0' + abs, lstatcb_);
      if (statcb) fs.lstat(abs, statcb);
      function lstatcb_(er, lstat) {
        if (lstat && lstat.isSymbolicLink()) {
          return fs.stat(abs, function (er2, stat2) {
            if (er2) self._stat2(f, abs, null, lstat, cb);
            else self._stat2(f, abs, er2, stat2, cb);
          });
        } else {
          self._stat2(f, abs, er, lstat, cb);
        }
      }
    };
    Glob.prototype._stat2 = function (f, abs, er, stat, cb) {
      if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
        this.statCache[abs] = false;
        return cb();
      }
      var needDir = f.slice(-1) === '/';
      this.statCache[abs] = stat;
      if (abs.slice(-1) === '/' && stat && !stat.isDirectory()) return cb(null, false, stat);
      var c = true;
      if (stat) c = stat.isDirectory() ? 'DIR' : 'FILE';
      this.cache[abs] = this.cache[abs] || c;
      if (needDir && c === 'FILE') return cb();
      return cb(null, c, stat);
    };
  }
});

// node_modules/fast-xml-parser/src/util.js
var require_util = __commonJS({
  'node_modules/fast-xml-parser/src/util.js'(exports2) {
    'use strict';
    var nameStartChar =
      ':A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
    var nameChar = nameStartChar + '\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
    var nameRegexp = '[' + nameStartChar + '][' + nameChar + ']*';
    var regexName = new RegExp('^' + nameRegexp + '$');
    var getAllMatches = function (string, regex) {
      const matches = [];
      let match = regex.exec(string);
      while (match) {
        const allmatches = [];
        const len = match.length;
        for (let index = 0; index < len; index++) {
          allmatches.push(match[index]);
        }
        matches.push(allmatches);
        match = regex.exec(string);
      }
      return matches;
    };
    var isName = function (string) {
      const match = regexName.exec(string);
      return !(match === null || typeof match === 'undefined');
    };
    exports2.isExist = function (v) {
      return typeof v !== 'undefined';
    };
    exports2.isEmptyObject = function (obj) {
      return Object.keys(obj).length === 0;
    };
    exports2.merge = function (target, a, arrayMode) {
      if (a) {
        const keys = Object.keys(a);
        const len = keys.length;
        for (let i = 0; i < len; i++) {
          if (arrayMode === 'strict') {
            target[keys[i]] = [a[keys[i]]];
          } else {
            target[keys[i]] = a[keys[i]];
          }
        }
      }
    };
    exports2.getValue = function (v) {
      if (exports2.isExist(v)) {
        return v;
      } else {
        return '';
      }
    };
    exports2.buildOptions = function (options, defaultOptions, props) {
      var newOptions = {};
      if (!options) {
        return defaultOptions;
      }
      for (let i = 0; i < props.length; i++) {
        if (options[props[i]] !== void 0) {
          newOptions[props[i]] = options[props[i]];
        } else {
          newOptions[props[i]] = defaultOptions[props[i]];
        }
      }
      return newOptions;
    };
    exports2.isTagNameInArrayMode = function (tagName, arrayMode, parentTagName) {
      if (arrayMode === false) {
        return false;
      } else if (arrayMode instanceof RegExp) {
        return arrayMode.test(tagName);
      } else if (typeof arrayMode === 'function') {
        return !!arrayMode(tagName, parentTagName);
      }
      return arrayMode === 'strict';
    };
    exports2.isName = isName;
    exports2.getAllMatches = getAllMatches;
    exports2.nameRegexp = nameRegexp;
  }
});

// node_modules/fast-xml-parser/src/node2json.js
var require_node2json = __commonJS({
  'node_modules/fast-xml-parser/src/node2json.js'(exports2) {
    'use strict';
    var util = require_util();
    var convertToJson = function (node, options, parentTagName) {
      const jObj = {};
      if ((!node.child || util.isEmptyObject(node.child)) && (!node.attrsMap || util.isEmptyObject(node.attrsMap))) {
        return util.isExist(node.val) ? node.val : '';
      }
      if (
        util.isExist(node.val) &&
        !(typeof node.val === 'string' && (node.val === '' || node.val === options.cdataPositionChar))
      ) {
        const asArray = util.isTagNameInArrayMode(node.tagname, options.arrayMode, parentTagName);
        jObj[options.textNodeName] = asArray ? [node.val] : node.val;
      }
      util.merge(jObj, node.attrsMap, options.arrayMode);
      const keys = Object.keys(node.child);
      for (let index = 0; index < keys.length; index++) {
        const tagName = keys[index];
        if (node.child[tagName] && node.child[tagName].length > 1) {
          jObj[tagName] = [];
          for (let tag in node.child[tagName]) {
            if (node.child[tagName].hasOwnProperty(tag)) {
              jObj[tagName].push(convertToJson(node.child[tagName][tag], options, tagName));
            }
          }
        } else {
          const result = convertToJson(node.child[tagName][0], options, tagName);
          const asArray =
            (options.arrayMode === true && typeof result === 'object') ||
            util.isTagNameInArrayMode(tagName, options.arrayMode, parentTagName);
          jObj[tagName] = asArray ? [result] : result;
        }
      }
      return jObj;
    };
    exports2.convertToJson = convertToJson;
  }
});

// node_modules/fast-xml-parser/src/xmlNode.js
var require_xmlNode = __commonJS({
  'node_modules/fast-xml-parser/src/xmlNode.js'(exports2, module2) {
    'use strict';
    module2.exports = function (tagname, parent, val) {
      this.tagname = tagname;
      this.parent = parent;
      this.child = {};
      this.attrsMap = {};
      this.val = val;
      this.addChild = function (child) {
        if (Array.isArray(this.child[child.tagname])) {
          this.child[child.tagname].push(child);
        } else {
          this.child[child.tagname] = [child];
        }
      };
    };
  }
});

// node_modules/fast-xml-parser/src/xmlstr2xmlnode.js
var require_xmlstr2xmlnode = __commonJS({
  'node_modules/fast-xml-parser/src/xmlstr2xmlnode.js'(exports2) {
    'use strict';
    var util = require_util();
    var buildOptions = require_util().buildOptions;
    var xmlNode = require_xmlNode();
    var regx = '<((!\\[CDATA\\[([\\s\\S]*?)(]]>))|((NAME:)?(NAME))([^>]*)>|((\\/)(NAME)\\s*>))([^<]*)'.replace(
      /NAME/g,
      util.nameRegexp
    );
    if (!Number.parseInt && window.parseInt) {
      Number.parseInt = window.parseInt;
    }
    if (!Number.parseFloat && window.parseFloat) {
      Number.parseFloat = window.parseFloat;
    }
    var defaultOptions = {
      attributeNamePrefix: '@_',
      attrNodeName: false,
      textNodeName: '#text',
      ignoreAttributes: true,
      ignoreNameSpace: false,
      allowBooleanAttributes: false,
      parseNodeValue: true,
      parseAttributeValue: false,
      arrayMode: false,
      trimValues: true,
      cdataTagName: false,
      cdataPositionChar: '\\c',
      tagValueProcessor: function (a, tagName) {
        return a;
      },
      attrValueProcessor: function (a, attrName) {
        return a;
      },
      stopNodes: []
    };
    exports2.defaultOptions = defaultOptions;
    var props = [
      'attributeNamePrefix',
      'attrNodeName',
      'textNodeName',
      'ignoreAttributes',
      'ignoreNameSpace',
      'allowBooleanAttributes',
      'parseNodeValue',
      'parseAttributeValue',
      'arrayMode',
      'trimValues',
      'cdataTagName',
      'cdataPositionChar',
      'tagValueProcessor',
      'attrValueProcessor',
      'parseTrueNumberOnly',
      'stopNodes'
    ];
    exports2.props = props;
    function processTagValue(tagName, val, options) {
      if (val) {
        if (options.trimValues) {
          val = val.trim();
        }
        val = options.tagValueProcessor(val, tagName);
        val = parseValue(val, options.parseNodeValue, options.parseTrueNumberOnly);
      }
      return val;
    }
    function resolveNameSpace(tagname, options) {
      if (options.ignoreNameSpace) {
        const tags = tagname.split(':');
        const prefix = tagname.charAt(0) === '/' ? '/' : '';
        if (tags[0] === 'xmlns') {
          return '';
        }
        if (tags.length === 2) {
          tagname = prefix + tags[1];
        }
      }
      return tagname;
    }
    function parseValue(val, shouldParse, parseTrueNumberOnly) {
      if (shouldParse && typeof val === 'string') {
        let parsed;
        if (val.trim() === '' || isNaN(val)) {
          parsed = val === 'true' ? true : val === 'false' ? false : val;
        } else {
          if (val.indexOf('0x') !== -1) {
            parsed = Number.parseInt(val, 16);
          } else if (val.indexOf('.') !== -1) {
            parsed = Number.parseFloat(val);
            val = val.replace(/\.?0+$/, '');
          } else {
            parsed = Number.parseInt(val, 10);
          }
          if (parseTrueNumberOnly) {
            parsed = String(parsed) === val ? parsed : val;
          }
        }
        return parsed;
      } else {
        if (util.isExist(val)) {
          return val;
        } else {
          return '';
        }
      }
    }
    var attrsRegx = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])(.*?)\\3)?`, 'g');
    function buildAttributesMap(attrStr, options) {
      if (!options.ignoreAttributes && typeof attrStr === 'string') {
        attrStr = attrStr.replace(/\r?\n/g, ' ');
        const matches = util.getAllMatches(attrStr, attrsRegx);
        const len = matches.length;
        const attrs = {};
        for (let i = 0; i < len; i++) {
          const attrName = resolveNameSpace(matches[i][1], options);
          if (attrName.length) {
            if (matches[i][4] !== void 0) {
              if (options.trimValues) {
                matches[i][4] = matches[i][4].trim();
              }
              matches[i][4] = options.attrValueProcessor(matches[i][4], attrName);
              attrs[options.attributeNamePrefix + attrName] = parseValue(
                matches[i][4],
                options.parseAttributeValue,
                options.parseTrueNumberOnly
              );
            } else if (options.allowBooleanAttributes) {
              attrs[options.attributeNamePrefix + attrName] = true;
            }
          }
        }
        if (!Object.keys(attrs).length) {
          return;
        }
        if (options.attrNodeName) {
          const attrCollection = {};
          attrCollection[options.attrNodeName] = attrs;
          return attrCollection;
        }
        return attrs;
      }
    }
    var getTraversalObj = function (xmlData, options) {
      xmlData = xmlData.replace(/\r\n?/g, '\n');
      options = buildOptions(options, defaultOptions, props);
      const xmlObj = new xmlNode('!xml');
      let currentNode = xmlObj;
      let textData = '';
      for (let i = 0; i < xmlData.length; i++) {
        const ch = xmlData[i];
        if (ch === '<') {
          if (xmlData[i + 1] === '/') {
            const closeIndex = findClosingIndex(xmlData, '>', i, 'Closing Tag is not closed.');
            let tagName = xmlData.substring(i + 2, closeIndex).trim();
            if (options.ignoreNameSpace) {
              const colonIndex = tagName.indexOf(':');
              if (colonIndex !== -1) {
                tagName = tagName.substr(colonIndex + 1);
              }
            }
            if (currentNode) {
              if (currentNode.val) {
                currentNode.val = util.getValue(currentNode.val) + '' + processTagValue(tagName, textData, options);
              } else {
                currentNode.val = processTagValue(tagName, textData, options);
              }
            }
            if (options.stopNodes.length && options.stopNodes.includes(currentNode.tagname)) {
              currentNode.child = [];
              if (currentNode.attrsMap == void 0) {
                currentNode.attrsMap = {};
              }
              currentNode.val = xmlData.substr(currentNode.startIndex + 1, i - currentNode.startIndex - 1);
            }
            currentNode = currentNode.parent;
            textData = '';
            i = closeIndex;
          } else if (xmlData[i + 1] === '?') {
            i = findClosingIndex(xmlData, '?>', i, 'Pi Tag is not closed.');
          } else if (xmlData.substr(i + 1, 3) === '!--') {
            i = findClosingIndex(xmlData, '-->', i, 'Comment is not closed.');
          } else if (xmlData.substr(i + 1, 2) === '!D') {
            const closeIndex = findClosingIndex(xmlData, '>', i, 'DOCTYPE is not closed.');
            const tagExp = xmlData.substring(i, closeIndex);
            if (tagExp.indexOf('[') >= 0) {
              i = xmlData.indexOf(']>', i) + 1;
            } else {
              i = closeIndex;
            }
          } else if (xmlData.substr(i + 1, 2) === '![') {
            const closeIndex = findClosingIndex(xmlData, ']]>', i, 'CDATA is not closed.') - 2;
            const tagExp = xmlData.substring(i + 9, closeIndex);
            if (textData) {
              currentNode.val =
                util.getValue(currentNode.val) + '' + processTagValue(currentNode.tagname, textData, options);
              textData = '';
            }
            if (options.cdataTagName) {
              const childNode = new xmlNode(options.cdataTagName, currentNode, tagExp);
              currentNode.addChild(childNode);
              currentNode.val = util.getValue(currentNode.val) + options.cdataPositionChar;
              if (tagExp) {
                childNode.val = tagExp;
              }
            } else {
              currentNode.val = (currentNode.val || '') + (tagExp || '');
            }
            i = closeIndex + 2;
          } else {
            const result = closingIndexForOpeningTag(xmlData, i + 1);
            let tagExp = result.data;
            const closeIndex = result.index;
            const separatorIndex = tagExp.indexOf(' ');
            let tagName = tagExp;
            let shouldBuildAttributesMap = true;
            if (separatorIndex !== -1) {
              tagName = tagExp.substr(0, separatorIndex).replace(/\s\s*$/, '');
              tagExp = tagExp.substr(separatorIndex + 1);
            }
            if (options.ignoreNameSpace) {
              const colonIndex = tagName.indexOf(':');
              if (colonIndex !== -1) {
                tagName = tagName.substr(colonIndex + 1);
                shouldBuildAttributesMap = tagName !== result.data.substr(colonIndex + 1);
              }
            }
            if (currentNode && textData) {
              if (currentNode.tagname !== '!xml') {
                currentNode.val =
                  util.getValue(currentNode.val) + '' + processTagValue(currentNode.tagname, textData, options);
              }
            }
            if (tagExp.length > 0 && tagExp.lastIndexOf('/') === tagExp.length - 1) {
              if (tagName[tagName.length - 1] === '/') {
                tagName = tagName.substr(0, tagName.length - 1);
                tagExp = tagName;
              } else {
                tagExp = tagExp.substr(0, tagExp.length - 1);
              }
              const childNode = new xmlNode(tagName, currentNode, '');
              if (tagName !== tagExp) {
                childNode.attrsMap = buildAttributesMap(tagExp, options);
              }
              currentNode.addChild(childNode);
            } else {
              const childNode = new xmlNode(tagName, currentNode);
              if (options.stopNodes.length && options.stopNodes.includes(childNode.tagname)) {
                childNode.startIndex = closeIndex;
              }
              if (tagName !== tagExp && shouldBuildAttributesMap) {
                childNode.attrsMap = buildAttributesMap(tagExp, options);
              }
              currentNode.addChild(childNode);
              currentNode = childNode;
            }
            textData = '';
            i = closeIndex;
          }
        } else {
          textData += xmlData[i];
        }
      }
      return xmlObj;
    };
    function closingIndexForOpeningTag(data, i) {
      let attrBoundary;
      let tagExp = '';
      for (let index = i; index < data.length; index++) {
        let ch = data[index];
        if (attrBoundary) {
          if (ch === attrBoundary) attrBoundary = '';
        } else if (ch === '"' || ch === "'") {
          attrBoundary = ch;
        } else if (ch === '>') {
          return {
            data: tagExp,
            index
          };
        } else if (ch === '	') {
          ch = ' ';
        }
        tagExp += ch;
      }
    }
    function findClosingIndex(xmlData, str, i, errMsg) {
      const closingIndex = xmlData.indexOf(str, i);
      if (closingIndex === -1) {
        throw new Error(errMsg);
      } else {
        return closingIndex + str.length - 1;
      }
    }
    exports2.getTraversalObj = getTraversalObj;
  }
});

// node_modules/fast-xml-parser/src/validator.js
var require_validator = __commonJS({
  'node_modules/fast-xml-parser/src/validator.js'(exports2) {
    'use strict';
    var util = require_util();
    var defaultOptions = {
      allowBooleanAttributes: false
    };
    var props = ['allowBooleanAttributes'];
    exports2.validate = function (xmlData, options) {
      options = util.buildOptions(options, defaultOptions, props);
      const tags = [];
      let tagFound = false;
      let reachedRoot = false;
      if (xmlData[0] === '\uFEFF') {
        xmlData = xmlData.substr(1);
      }
      for (let i = 0; i < xmlData.length; i++) {
        if (xmlData[i] === '<' && xmlData[i + 1] === '?') {
          i += 2;
          i = readPI(xmlData, i);
          if (i.err) return i;
        } else if (xmlData[i] === '<') {
          i++;
          if (xmlData[i] === '!') {
            i = readCommentAndCDATA(xmlData, i);
            continue;
          } else {
            let closingTag = false;
            if (xmlData[i] === '/') {
              closingTag = true;
              i++;
            }
            let tagName = '';
            for (
              ;
              i < xmlData.length &&
              xmlData[i] !== '>' &&
              xmlData[i] !== ' ' &&
              xmlData[i] !== '	' &&
              xmlData[i] !== '\n' &&
              xmlData[i] !== '\r';
              i++
            ) {
              tagName += xmlData[i];
            }
            tagName = tagName.trim();
            if (tagName[tagName.length - 1] === '/') {
              tagName = tagName.substring(0, tagName.length - 1);
              i--;
            }
            if (!validateTagName(tagName)) {
              let msg;
              if (tagName.trim().length === 0) {
                msg = "There is an unnecessary space between tag name and backward slash '</ ..'.";
              } else {
                msg = "Tag '" + tagName + "' is an invalid name.";
              }
              return getErrorObject('InvalidTag', msg, getLineNumberForPosition(xmlData, i));
            }
            const result = readAttributeStr(xmlData, i);
            if (result === false) {
              return getErrorObject(
                'InvalidAttr',
                "Attributes for '" + tagName + "' have open quote.",
                getLineNumberForPosition(xmlData, i)
              );
            }
            let attrStr = result.value;
            i = result.index;
            if (attrStr[attrStr.length - 1] === '/') {
              attrStr = attrStr.substring(0, attrStr.length - 1);
              const isValid = validateAttributeString(attrStr, options);
              if (isValid === true) {
                tagFound = true;
              } else {
                return getErrorObject(
                  isValid.err.code,
                  isValid.err.msg,
                  getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line)
                );
              }
            } else if (closingTag) {
              if (!result.tagClosed) {
                return getErrorObject(
                  'InvalidTag',
                  "Closing tag '" + tagName + "' doesn't have proper closing.",
                  getLineNumberForPosition(xmlData, i)
                );
              } else if (attrStr.trim().length > 0) {
                return getErrorObject(
                  'InvalidTag',
                  "Closing tag '" + tagName + "' can't have attributes or invalid starting.",
                  getLineNumberForPosition(xmlData, i)
                );
              } else {
                const otg = tags.pop();
                if (tagName !== otg) {
                  return getErrorObject(
                    'InvalidTag',
                    "Closing tag '" + otg + "' is expected inplace of '" + tagName + "'.",
                    getLineNumberForPosition(xmlData, i)
                  );
                }
                if (tags.length == 0) {
                  reachedRoot = true;
                }
              }
            } else {
              const isValid = validateAttributeString(attrStr, options);
              if (isValid !== true) {
                return getErrorObject(
                  isValid.err.code,
                  isValid.err.msg,
                  getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line)
                );
              }
              if (reachedRoot === true) {
                return getErrorObject(
                  'InvalidXml',
                  'Multiple possible root nodes found.',
                  getLineNumberForPosition(xmlData, i)
                );
              } else {
                tags.push(tagName);
              }
              tagFound = true;
            }
            for (i++; i < xmlData.length; i++) {
              if (xmlData[i] === '<') {
                if (xmlData[i + 1] === '!') {
                  i++;
                  i = readCommentAndCDATA(xmlData, i);
                  continue;
                } else if (xmlData[i + 1] === '?') {
                  i = readPI(xmlData, ++i);
                  if (i.err) return i;
                } else {
                  break;
                }
              } else if (xmlData[i] === '&') {
                const afterAmp = validateAmpersand(xmlData, i);
                if (afterAmp == -1)
                  return getErrorObject('InvalidChar', "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
                i = afterAmp;
              }
            }
            if (xmlData[i] === '<') {
              i--;
            }
          }
        } else {
          if (xmlData[i] === ' ' || xmlData[i] === '	' || xmlData[i] === '\n' || xmlData[i] === '\r') {
            continue;
          }
          return getErrorObject(
            'InvalidChar',
            "char '" + xmlData[i] + "' is not expected.",
            getLineNumberForPosition(xmlData, i)
          );
        }
      }
      if (!tagFound) {
        return getErrorObject('InvalidXml', 'Start tag expected.', 1);
      } else if (tags.length > 0) {
        return getErrorObject(
          'InvalidXml',
          "Invalid '" + JSON.stringify(tags, null, 4).replace(/\r?\n/g, '') + "' found.",
          1
        );
      }
      return true;
    };
    function readPI(xmlData, i) {
      var start = i;
      for (; i < xmlData.length; i++) {
        if (xmlData[i] == '?' || xmlData[i] == ' ') {
          var tagname = xmlData.substr(start, i - start);
          if (i > 5 && tagname === 'xml') {
            return getErrorObject(
              'InvalidXml',
              'XML declaration allowed only at the start of the document.',
              getLineNumberForPosition(xmlData, i)
            );
          } else if (xmlData[i] == '?' && xmlData[i + 1] == '>') {
            i++;
            break;
          } else {
            continue;
          }
        }
      }
      return i;
    }
    function readCommentAndCDATA(xmlData, i) {
      if (xmlData.length > i + 5 && xmlData[i + 1] === '-' && xmlData[i + 2] === '-') {
        for (i += 3; i < xmlData.length; i++) {
          if (xmlData[i] === '-' && xmlData[i + 1] === '-' && xmlData[i + 2] === '>') {
            i += 2;
            break;
          }
        }
      } else if (
        xmlData.length > i + 8 &&
        xmlData[i + 1] === 'D' &&
        xmlData[i + 2] === 'O' &&
        xmlData[i + 3] === 'C' &&
        xmlData[i + 4] === 'T' &&
        xmlData[i + 5] === 'Y' &&
        xmlData[i + 6] === 'P' &&
        xmlData[i + 7] === 'E'
      ) {
        let angleBracketsCount = 1;
        for (i += 8; i < xmlData.length; i++) {
          if (xmlData[i] === '<') {
            angleBracketsCount++;
          } else if (xmlData[i] === '>') {
            angleBracketsCount--;
            if (angleBracketsCount === 0) {
              break;
            }
          }
        }
      } else if (
        xmlData.length > i + 9 &&
        xmlData[i + 1] === '[' &&
        xmlData[i + 2] === 'C' &&
        xmlData[i + 3] === 'D' &&
        xmlData[i + 4] === 'A' &&
        xmlData[i + 5] === 'T' &&
        xmlData[i + 6] === 'A' &&
        xmlData[i + 7] === '['
      ) {
        for (i += 8; i < xmlData.length; i++) {
          if (xmlData[i] === ']' && xmlData[i + 1] === ']' && xmlData[i + 2] === '>') {
            i += 2;
            break;
          }
        }
      }
      return i;
    }
    var doubleQuote = '"';
    var singleQuote = "'";
    function readAttributeStr(xmlData, i) {
      let attrStr = '';
      let startChar = '';
      let tagClosed = false;
      for (; i < xmlData.length; i++) {
        if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
          if (startChar === '') {
            startChar = xmlData[i];
          } else if (startChar !== xmlData[i]) {
            continue;
          } else {
            startChar = '';
          }
        } else if (xmlData[i] === '>') {
          if (startChar === '') {
            tagClosed = true;
            break;
          }
        }
        attrStr += xmlData[i];
      }
      if (startChar !== '') {
        return false;
      }
      return {
        value: attrStr,
        index: i,
        tagClosed
      };
    }
    var validAttrStrRegxp = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, 'g');
    function validateAttributeString(attrStr, options) {
      const matches = util.getAllMatches(attrStr, validAttrStrRegxp);
      const attrNames = {};
      for (let i = 0; i < matches.length; i++) {
        if (matches[i][1].length === 0) {
          return getErrorObject(
            'InvalidAttr',
            "Attribute '" + matches[i][2] + "' has no space in starting.",
            getPositionFromMatch(attrStr, matches[i][0])
          );
        } else if (matches[i][3] === void 0 && !options.allowBooleanAttributes) {
          return getErrorObject(
            'InvalidAttr',
            "boolean attribute '" + matches[i][2] + "' is not allowed.",
            getPositionFromMatch(attrStr, matches[i][0])
          );
        }
        const attrName = matches[i][2];
        if (!validateAttrName(attrName)) {
          return getErrorObject(
            'InvalidAttr',
            "Attribute '" + attrName + "' is an invalid name.",
            getPositionFromMatch(attrStr, matches[i][0])
          );
        }
        if (!attrNames.hasOwnProperty(attrName)) {
          attrNames[attrName] = 1;
        } else {
          return getErrorObject(
            'InvalidAttr',
            "Attribute '" + attrName + "' is repeated.",
            getPositionFromMatch(attrStr, matches[i][0])
          );
        }
      }
      return true;
    }
    function validateNumberAmpersand(xmlData, i) {
      let re = /\d/;
      if (xmlData[i] === 'x') {
        i++;
        re = /[\da-fA-F]/;
      }
      for (; i < xmlData.length; i++) {
        if (xmlData[i] === ';') return i;
        if (!xmlData[i].match(re)) break;
      }
      return -1;
    }
    function validateAmpersand(xmlData, i) {
      i++;
      if (xmlData[i] === ';') return -1;
      if (xmlData[i] === '#') {
        i++;
        return validateNumberAmpersand(xmlData, i);
      }
      let count = 0;
      for (; i < xmlData.length; i++, count++) {
        if (xmlData[i].match(/\w/) && count < 20) continue;
        if (xmlData[i] === ';') break;
        return -1;
      }
      return i;
    }
    function getErrorObject(code, message, lineNumber) {
      return {
        err: {
          code,
          msg: message,
          line: lineNumber
        }
      };
    }
    function validateAttrName(attrName) {
      return util.isName(attrName);
    }
    function validateTagName(tagname) {
      return util.isName(tagname);
    }
    function getLineNumberForPosition(xmlData, index) {
      var lines = xmlData.substring(0, index).split(/\r?\n/);
      return lines.length;
    }
    function getPositionFromMatch(attrStr, match) {
      return attrStr.indexOf(match) + match.length;
    }
  }
});

// node_modules/fast-xml-parser/src/nimndata.js
var require_nimndata = __commonJS({
  'node_modules/fast-xml-parser/src/nimndata.js'(exports2) {
    'use strict';
    var char = function (a) {
      return String.fromCharCode(a);
    };
    var chars = {
      nilChar: char(176),
      missingChar: char(201),
      nilPremitive: char(175),
      missingPremitive: char(200),
      emptyChar: char(178),
      emptyValue: char(177),
      boundryChar: char(179),
      objStart: char(198),
      arrStart: char(204),
      arrayEnd: char(185)
    };
    var charsArr = [
      chars.nilChar,
      chars.nilPremitive,
      chars.missingChar,
      chars.missingPremitive,
      chars.boundryChar,
      chars.emptyChar,
      chars.emptyValue,
      chars.arrayEnd,
      chars.objStart,
      chars.arrStart
    ];
    var _e = function (node, e_schema, options) {
      if (typeof e_schema === 'string') {
        if (node && node[0] && node[0].val !== void 0) {
          return getValue(node[0].val, e_schema);
        } else {
          return getValue(node, e_schema);
        }
      } else {
        const hasValidData = hasData(node);
        if (hasValidData === true) {
          let str = '';
          if (Array.isArray(e_schema)) {
            str += chars.arrStart;
            const itemSchema = e_schema[0];
            const arr_len = node.length;
            if (typeof itemSchema === 'string') {
              for (let arr_i = 0; arr_i < arr_len; arr_i++) {
                const r = getValue(node[arr_i].val, itemSchema);
                str = processValue(str, r);
              }
            } else {
              for (let arr_i = 0; arr_i < arr_len; arr_i++) {
                const r = _e(node[arr_i], itemSchema, options);
                str = processValue(str, r);
              }
            }
            str += chars.arrayEnd;
          } else {
            str += chars.objStart;
            const keys = Object.keys(e_schema);
            if (Array.isArray(node)) {
              node = node[0];
            }
            for (let i in keys) {
              const key = keys[i];
              let r;
              if (!options.ignoreAttributes && node.attrsMap && node.attrsMap[key]) {
                r = _e(node.attrsMap[key], e_schema[key], options);
              } else if (key === options.textNodeName) {
                r = _e(node.val, e_schema[key], options);
              } else {
                r = _e(node.child[key], e_schema[key], options);
              }
              str = processValue(str, r);
            }
          }
          return str;
        } else {
          return hasValidData;
        }
      }
    };
    var getValue = function (a) {
      switch (a) {
        case void 0:
          return chars.missingPremitive;
        case null:
          return chars.nilPremitive;
        case '':
          return chars.emptyValue;
        default:
          return a;
      }
    };
    var processValue = function (str, r) {
      if (!isAppChar(r[0]) && !isAppChar(str[str.length - 1])) {
        str += chars.boundryChar;
      }
      return str + r;
    };
    var isAppChar = function (ch) {
      return charsArr.indexOf(ch) !== -1;
    };
    function hasData(jObj) {
      if (jObj === void 0) {
        return chars.missingChar;
      } else if (jObj === null) {
        return chars.nilChar;
      } else if (
        jObj.child &&
        Object.keys(jObj.child).length === 0 &&
        (!jObj.attrsMap || Object.keys(jObj.attrsMap).length === 0)
      ) {
        return chars.emptyChar;
      } else {
        return true;
      }
    }
    var x2j = require_xmlstr2xmlnode();
    var buildOptions = require_util().buildOptions;
    var convert2nimn = function (node, e_schema, options) {
      options = buildOptions(options, x2j.defaultOptions, x2j.props);
      return _e(node, e_schema, options);
    };
    exports2.convert2nimn = convert2nimn;
  }
});

// node_modules/fast-xml-parser/src/node2json_str.js
var require_node2json_str = __commonJS({
  'node_modules/fast-xml-parser/src/node2json_str.js'(exports2) {
    'use strict';
    var util = require_util();
    var buildOptions = require_util().buildOptions;
    var x2j = require_xmlstr2xmlnode();
    var convertToJsonString = function (node, options) {
      options = buildOptions(options, x2j.defaultOptions, x2j.props);
      options.indentBy = options.indentBy || '';
      return _cToJsonStr(node, options, 0);
    };
    var _cToJsonStr = function (node, options, level) {
      let jObj = '{';
      const keys = Object.keys(node.child);
      for (let index = 0; index < keys.length; index++) {
        var tagname = keys[index];
        if (node.child[tagname] && node.child[tagname].length > 1) {
          jObj += '"' + tagname + '" : [ ';
          for (var tag in node.child[tagname]) {
            jObj += _cToJsonStr(node.child[tagname][tag], options) + ' , ';
          }
          jObj = jObj.substr(0, jObj.length - 1) + ' ] ';
        } else {
          jObj += '"' + tagname + '" : ' + _cToJsonStr(node.child[tagname][0], options) + ' ,';
        }
      }
      util.merge(jObj, node.attrsMap);
      if (util.isEmptyObject(jObj)) {
        return util.isExist(node.val) ? node.val : '';
      } else {
        if (util.isExist(node.val)) {
          if (!(typeof node.val === 'string' && (node.val === '' || node.val === options.cdataPositionChar))) {
            jObj += '"' + options.textNodeName + '" : ' + stringval(node.val);
          }
        }
      }
      if (jObj[jObj.length - 1] === ',') {
        jObj = jObj.substr(0, jObj.length - 2);
      }
      return jObj + '}';
    };
    function stringval(v) {
      if (v === true || v === false || !isNaN(v)) {
        return v;
      } else {
        return '"' + v + '"';
      }
    }
    exports2.convertToJsonString = convertToJsonString;
  }
});

// node_modules/fast-xml-parser/src/json2xml.js
var require_json2xml = __commonJS({
  'node_modules/fast-xml-parser/src/json2xml.js'(exports2, module2) {
    'use strict';
    var buildOptions = require_util().buildOptions;
    var defaultOptions = {
      attributeNamePrefix: '@_',
      attrNodeName: false,
      textNodeName: '#text',
      ignoreAttributes: true,
      cdataTagName: false,
      cdataPositionChar: '\\c',
      format: false,
      indentBy: '  ',
      supressEmptyNode: false,
      tagValueProcessor: function (a) {
        return a;
      },
      attrValueProcessor: function (a) {
        return a;
      }
    };
    var props = [
      'attributeNamePrefix',
      'attrNodeName',
      'textNodeName',
      'ignoreAttributes',
      'cdataTagName',
      'cdataPositionChar',
      'format',
      'indentBy',
      'supressEmptyNode',
      'tagValueProcessor',
      'attrValueProcessor'
    ];
    function Parser(options) {
      this.options = buildOptions(options, defaultOptions, props);
      if (this.options.ignoreAttributes || this.options.attrNodeName) {
        this.isAttribute = function () {
          return false;
        };
      } else {
        this.attrPrefixLen = this.options.attributeNamePrefix.length;
        this.isAttribute = isAttribute;
      }
      if (this.options.cdataTagName) {
        this.isCDATA = isCDATA;
      } else {
        this.isCDATA = function () {
          return false;
        };
      }
      this.replaceCDATAstr = replaceCDATAstr;
      this.replaceCDATAarr = replaceCDATAarr;
      if (this.options.format) {
        this.indentate = indentate;
        this.tagEndChar = '>\n';
        this.newLine = '\n';
      } else {
        this.indentate = function () {
          return '';
        };
        this.tagEndChar = '>';
        this.newLine = '';
      }
      if (this.options.supressEmptyNode) {
        this.buildTextNode = buildEmptyTextNode;
        this.buildObjNode = buildEmptyObjNode;
      } else {
        this.buildTextNode = buildTextValNode;
        this.buildObjNode = buildObjectNode;
      }
      this.buildTextValNode = buildTextValNode;
      this.buildObjectNode = buildObjectNode;
    }
    Parser.prototype.parse = function (jObj) {
      return this.j2x(jObj, 0).val;
    };
    Parser.prototype.j2x = function (jObj, level) {
      let attrStr = '';
      let val = '';
      const keys = Object.keys(jObj);
      const len = keys.length;
      for (let i = 0; i < len; i++) {
        const key = keys[i];
        if (typeof jObj[key] === 'undefined') {
        } else if (jObj[key] === null) {
          val += this.indentate(level) + '<' + key + '/' + this.tagEndChar;
        } else if (jObj[key] instanceof Date) {
          val += this.buildTextNode(jObj[key], key, '', level);
        } else if (typeof jObj[key] !== 'object') {
          const attr = this.isAttribute(key);
          if (attr) {
            attrStr += ' ' + attr + '="' + this.options.attrValueProcessor('' + jObj[key]) + '"';
          } else if (this.isCDATA(key)) {
            if (jObj[this.options.textNodeName]) {
              val += this.replaceCDATAstr(jObj[this.options.textNodeName], jObj[key]);
            } else {
              val += this.replaceCDATAstr('', jObj[key]);
            }
          } else {
            if (key === this.options.textNodeName) {
              if (jObj[this.options.cdataTagName]) {
              } else {
                val += this.options.tagValueProcessor('' + jObj[key]);
              }
            } else {
              val += this.buildTextNode(jObj[key], key, '', level);
            }
          }
        } else if (Array.isArray(jObj[key])) {
          if (this.isCDATA(key)) {
            val += this.indentate(level);
            if (jObj[this.options.textNodeName]) {
              val += this.replaceCDATAarr(jObj[this.options.textNodeName], jObj[key]);
            } else {
              val += this.replaceCDATAarr('', jObj[key]);
            }
          } else {
            const arrLen = jObj[key].length;
            for (let j = 0; j < arrLen; j++) {
              const item = jObj[key][j];
              if (typeof item === 'undefined') {
              } else if (item === null) {
                val += this.indentate(level) + '<' + key + '/' + this.tagEndChar;
              } else if (typeof item === 'object') {
                const result = this.j2x(item, level + 1);
                val += this.buildObjNode(result.val, key, result.attrStr, level);
              } else {
                val += this.buildTextNode(item, key, '', level);
              }
            }
          }
        } else {
          if (this.options.attrNodeName && key === this.options.attrNodeName) {
            const Ks = Object.keys(jObj[key]);
            const L = Ks.length;
            for (let j = 0; j < L; j++) {
              attrStr += ' ' + Ks[j] + '="' + this.options.attrValueProcessor('' + jObj[key][Ks[j]]) + '"';
            }
          } else {
            const result = this.j2x(jObj[key], level + 1);
            val += this.buildObjNode(result.val, key, result.attrStr, level);
          }
        }
      }
      return { attrStr, val };
    };
    function replaceCDATAstr(str, cdata) {
      str = this.options.tagValueProcessor('' + str);
      if (this.options.cdataPositionChar === '' || str === '') {
        return str + '<![CDATA[' + cdata + ']]' + this.tagEndChar;
      } else {
        return str.replace(this.options.cdataPositionChar, '<![CDATA[' + cdata + ']]' + this.tagEndChar);
      }
    }
    function replaceCDATAarr(str, cdata) {
      str = this.options.tagValueProcessor('' + str);
      if (this.options.cdataPositionChar === '' || str === '') {
        return str + '<![CDATA[' + cdata.join(']]><![CDATA[') + ']]' + this.tagEndChar;
      } else {
        for (let v in cdata) {
          str = str.replace(this.options.cdataPositionChar, '<![CDATA[' + cdata[v] + ']]>');
        }
        return str + this.newLine;
      }
    }
    function buildObjectNode(val, key, attrStr, level) {
      if (attrStr && !val.includes('<')) {
        return this.indentate(level) + '<' + key + attrStr + '>' + val + '</' + key + this.tagEndChar;
      } else {
        return (
          this.indentate(level) +
          '<' +
          key +
          attrStr +
          this.tagEndChar +
          val +
          this.indentate(level) +
          '</' +
          key +
          this.tagEndChar
        );
      }
    }
    function buildEmptyObjNode(val, key, attrStr, level) {
      if (val !== '') {
        return this.buildObjectNode(val, key, attrStr, level);
      } else {
        return this.indentate(level) + '<' + key + attrStr + '/' + this.tagEndChar;
      }
    }
    function buildTextValNode(val, key, attrStr, level) {
      return (
        this.indentate(level) +
        '<' +
        key +
        attrStr +
        '>' +
        this.options.tagValueProcessor(val) +
        '</' +
        key +
        this.tagEndChar
      );
    }
    function buildEmptyTextNode(val, key, attrStr, level) {
      if (val !== '') {
        return this.buildTextValNode(val, key, attrStr, level);
      } else {
        return this.indentate(level) + '<' + key + attrStr + '/' + this.tagEndChar;
      }
    }
    function indentate(level) {
      return this.options.indentBy.repeat(level);
    }
    function isAttribute(name) {
      if (name.startsWith(this.options.attributeNamePrefix)) {
        return name.substr(this.attrPrefixLen);
      } else {
        return false;
      }
    }
    function isCDATA(name) {
      return name === this.options.cdataTagName;
    }
    module2.exports = Parser;
  }
});

// node_modules/fast-xml-parser/src/parser.js
var require_parser = __commonJS({
  'node_modules/fast-xml-parser/src/parser.js'(exports2) {
    'use strict';
    var nodeToJson = require_node2json();
    var xmlToNodeobj = require_xmlstr2xmlnode();
    var x2xmlnode = require_xmlstr2xmlnode();
    var buildOptions = require_util().buildOptions;
    var validator = require_validator();
    exports2.parse = function (xmlData, options, validationOption) {
      if (validationOption) {
        if (validationOption === true) validationOption = {};
        const result = validator.validate(xmlData, validationOption);
        if (result !== true) {
          throw Error(result.err.msg);
        }
      }
      options = buildOptions(options, x2xmlnode.defaultOptions, x2xmlnode.props);
      const traversableObj = xmlToNodeobj.getTraversalObj(xmlData, options);
      return nodeToJson.convertToJson(traversableObj, options);
    };
    exports2.convertTonimn = require_nimndata().convert2nimn;
    exports2.getTraversalObj = xmlToNodeobj.getTraversalObj;
    exports2.convertToJson = nodeToJson.convertToJson;
    exports2.convertToJsonString = require_node2json_str().convertToJsonString;
    exports2.validate = validator.validate;
    exports2.j2xParser = require_json2xml();
    exports2.parseToNimn = function (xmlData, schema, options) {
      return exports2.convertTonimn(exports2.getTraversalObj(xmlData, options), schema, options);
    };
  }
});

// node_modules/he/he.js
var require_he = __commonJS({
  'node_modules/he/he.js'(exports2, module2) {
    (function (root) {
      var freeExports = typeof exports2 == 'object' && exports2;
      var freeModule = typeof module2 == 'object' && module2 && module2.exports == freeExports && module2;
      var freeGlobal = typeof global == 'object' && global;
      if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
        root = freeGlobal;
      }
      var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
      var regexAsciiWhitelist = /[\x01-\x7F]/g;
      var regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;
      var regexEncodeNonAscii =
        /<\u20D2|=\u20E5|>\u20D2|\u205F\u200A|\u219D\u0338|\u2202\u0338|\u2220\u20D2|\u2229\uFE00|\u222A\uFE00|\u223C\u20D2|\u223D\u0331|\u223E\u0333|\u2242\u0338|\u224B\u0338|\u224D\u20D2|\u224E\u0338|\u224F\u0338|\u2250\u0338|\u2261\u20E5|\u2264\u20D2|\u2265\u20D2|\u2266\u0338|\u2267\u0338|\u2268\uFE00|\u2269\uFE00|\u226A\u0338|\u226A\u20D2|\u226B\u0338|\u226B\u20D2|\u227F\u0338|\u2282\u20D2|\u2283\u20D2|\u228A\uFE00|\u228B\uFE00|\u228F\u0338|\u2290\u0338|\u2293\uFE00|\u2294\uFE00|\u22B4\u20D2|\u22B5\u20D2|\u22D8\u0338|\u22D9\u0338|\u22DA\uFE00|\u22DB\uFE00|\u22F5\u0338|\u22F9\u0338|\u2933\u0338|\u29CF\u0338|\u29D0\u0338|\u2A6D\u0338|\u2A70\u0338|\u2A7D\u0338|\u2A7E\u0338|\u2AA1\u0338|\u2AA2\u0338|\u2AAC\uFE00|\u2AAD\uFE00|\u2AAF\u0338|\u2AB0\u0338|\u2AC5\u0338|\u2AC6\u0338|\u2ACB\uFE00|\u2ACC\uFE00|\u2AFD\u20E5|[\xA0-\u0113\u0116-\u0122\u0124-\u012B\u012E-\u014D\u0150-\u017E\u0192\u01B5\u01F5\u0237\u02C6\u02C7\u02D8-\u02DD\u0311\u0391-\u03A1\u03A3-\u03A9\u03B1-\u03C9\u03D1\u03D2\u03D5\u03D6\u03DC\u03DD\u03F0\u03F1\u03F5\u03F6\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E\u045F\u2002-\u2005\u2007-\u2010\u2013-\u2016\u2018-\u201A\u201C-\u201E\u2020-\u2022\u2025\u2026\u2030-\u2035\u2039\u203A\u203E\u2041\u2043\u2044\u204F\u2057\u205F-\u2063\u20AC\u20DB\u20DC\u2102\u2105\u210A-\u2113\u2115-\u211E\u2122\u2124\u2127-\u2129\u212C\u212D\u212F-\u2131\u2133-\u2138\u2145-\u2148\u2153-\u215E\u2190-\u219B\u219D-\u21A7\u21A9-\u21AE\u21B0-\u21B3\u21B5-\u21B7\u21BA-\u21DB\u21DD\u21E4\u21E5\u21F5\u21FD-\u2205\u2207-\u2209\u220B\u220C\u220F-\u2214\u2216-\u2218\u221A\u221D-\u2238\u223A-\u2257\u2259\u225A\u225C\u225F-\u2262\u2264-\u228B\u228D-\u229B\u229D-\u22A5\u22A7-\u22B0\u22B2-\u22BB\u22BD-\u22DB\u22DE-\u22E3\u22E6-\u22F7\u22F9-\u22FE\u2305\u2306\u2308-\u2310\u2312\u2313\u2315\u2316\u231C-\u231F\u2322\u2323\u232D\u232E\u2336\u233D\u233F\u237C\u23B0\u23B1\u23B4-\u23B6\u23DC-\u23DF\u23E2\u23E7\u2423\u24C8\u2500\u2502\u250C\u2510\u2514\u2518\u251C\u2524\u252C\u2534\u253C\u2550-\u256C\u2580\u2584\u2588\u2591-\u2593\u25A1\u25AA\u25AB\u25AD\u25AE\u25B1\u25B3-\u25B5\u25B8\u25B9\u25BD-\u25BF\u25C2\u25C3\u25CA\u25CB\u25EC\u25EF\u25F8-\u25FC\u2605\u2606\u260E\u2640\u2642\u2660\u2663\u2665\u2666\u266A\u266D-\u266F\u2713\u2717\u2720\u2736\u2758\u2772\u2773\u27C8\u27C9\u27E6-\u27ED\u27F5-\u27FA\u27FC\u27FF\u2902-\u2905\u290C-\u2913\u2916\u2919-\u2920\u2923-\u292A\u2933\u2935-\u2939\u293C\u293D\u2945\u2948-\u294B\u294E-\u2976\u2978\u2979\u297B-\u297F\u2985\u2986\u298B-\u2996\u299A\u299C\u299D\u29A4-\u29B7\u29B9\u29BB\u29BC\u29BE-\u29C5\u29C9\u29CD-\u29D0\u29DC-\u29DE\u29E3-\u29E5\u29EB\u29F4\u29F6\u2A00-\u2A02\u2A04\u2A06\u2A0C\u2A0D\u2A10-\u2A17\u2A22-\u2A27\u2A29\u2A2A\u2A2D-\u2A31\u2A33-\u2A3C\u2A3F\u2A40\u2A42-\u2A4D\u2A50\u2A53-\u2A58\u2A5A-\u2A5D\u2A5F\u2A66\u2A6A\u2A6D-\u2A75\u2A77-\u2A9A\u2A9D-\u2AA2\u2AA4-\u2AB0\u2AB3-\u2AC8\u2ACB\u2ACC\u2ACF-\u2ADB\u2AE4\u2AE6-\u2AE9\u2AEB-\u2AF3\u2AFD\uFB00-\uFB04]|\uD835[\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDD6B]/g;
      var encodeMap = {
        '\xAD': 'shy',
        '\u200C': 'zwnj',
        '\u200D': 'zwj',
        '\u200E': 'lrm',
        '\u2063': 'ic',
        '\u2062': 'it',
        '\u2061': 'af',
        '\u200F': 'rlm',
        '\u200B': 'ZeroWidthSpace',
        '\u2060': 'NoBreak',
        '\u0311': 'DownBreve',
        '\u20DB': 'tdot',
        '\u20DC': 'DotDot',
        '	': 'Tab',
        '\n': 'NewLine',
        '\u2008': 'puncsp',
        '\u205F': 'MediumSpace',
        '\u2009': 'thinsp',
        '\u200A': 'hairsp',
        '\u2004': 'emsp13',
        '\u2002': 'ensp',
        '\u2005': 'emsp14',
        '\u2003': 'emsp',
        '\u2007': 'numsp',
        '\xA0': 'nbsp',
        '\u205F\u200A': 'ThickSpace',
        '\u203E': 'oline',
        _: 'lowbar',
        '\u2010': 'dash',
        '\u2013': 'ndash',
        '\u2014': 'mdash',
        '\u2015': 'horbar',
        ',': 'comma',
        ';': 'semi',
        '\u204F': 'bsemi',
        ':': 'colon',
        '\u2A74': 'Colone',
        '!': 'excl',
        '\xA1': 'iexcl',
        '?': 'quest',
        '\xBF': 'iquest',
        '.': 'period',
        '\u2025': 'nldr',
        '\u2026': 'mldr',
        '\xB7': 'middot',
        "'": 'apos',
        '\u2018': 'lsquo',
        '\u2019': 'rsquo',
        '\u201A': 'sbquo',
        '\u2039': 'lsaquo',
        '\u203A': 'rsaquo',
        '"': 'quot',
        '\u201C': 'ldquo',
        '\u201D': 'rdquo',
        '\u201E': 'bdquo',
        '\xAB': 'laquo',
        '\xBB': 'raquo',
        '(': 'lpar',
        ')': 'rpar',
        '[': 'lsqb',
        ']': 'rsqb',
        '{': 'lcub',
        '}': 'rcub',
        '\u2308': 'lceil',
        '\u2309': 'rceil',
        '\u230A': 'lfloor',
        '\u230B': 'rfloor',
        '\u2985': 'lopar',
        '\u2986': 'ropar',
        '\u298B': 'lbrke',
        '\u298C': 'rbrke',
        '\u298D': 'lbrkslu',
        '\u298E': 'rbrksld',
        '\u298F': 'lbrksld',
        '\u2990': 'rbrkslu',
        '\u2991': 'langd',
        '\u2992': 'rangd',
        '\u2993': 'lparlt',
        '\u2994': 'rpargt',
        '\u2995': 'gtlPar',
        '\u2996': 'ltrPar',
        '\u27E6': 'lobrk',
        '\u27E7': 'robrk',
        '\u27E8': 'lang',
        '\u27E9': 'rang',
        '\u27EA': 'Lang',
        '\u27EB': 'Rang',
        '\u27EC': 'loang',
        '\u27ED': 'roang',
        '\u2772': 'lbbrk',
        '\u2773': 'rbbrk',
        '\u2016': 'Vert',
        '\xA7': 'sect',
        '\xB6': 'para',
        '@': 'commat',
        '*': 'ast',
        '/': 'sol',
        undefined: null,
        '&': 'amp',
        '#': 'num',
        '%': 'percnt',
        '\u2030': 'permil',
        '\u2031': 'pertenk',
        '\u2020': 'dagger',
        '\u2021': 'Dagger',
        '\u2022': 'bull',
        '\u2043': 'hybull',
        '\u2032': 'prime',
        '\u2033': 'Prime',
        '\u2034': 'tprime',
        '\u2057': 'qprime',
        '\u2035': 'bprime',
        '\u2041': 'caret',
        '`': 'grave',
        '\xB4': 'acute',
        '\u02DC': 'tilde',
        '^': 'Hat',
        '\xAF': 'macr',
        '\u02D8': 'breve',
        '\u02D9': 'dot',
        '\xA8': 'die',
        '\u02DA': 'ring',
        '\u02DD': 'dblac',
        '\xB8': 'cedil',
        '\u02DB': 'ogon',
        '\u02C6': 'circ',
        '\u02C7': 'caron',
        '\xB0': 'deg',
        '\xA9': 'copy',
        '\xAE': 'reg',
        '\u2117': 'copysr',
        '\u2118': 'wp',
        '\u211E': 'rx',
        '\u2127': 'mho',
        '\u2129': 'iiota',
        '\u2190': 'larr',
        '\u219A': 'nlarr',
        '\u2192': 'rarr',
        '\u219B': 'nrarr',
        '\u2191': 'uarr',
        '\u2193': 'darr',
        '\u2194': 'harr',
        '\u21AE': 'nharr',
        '\u2195': 'varr',
        '\u2196': 'nwarr',
        '\u2197': 'nearr',
        '\u2198': 'searr',
        '\u2199': 'swarr',
        '\u219D': 'rarrw',
        '\u219D\u0338': 'nrarrw',
        '\u219E': 'Larr',
        '\u219F': 'Uarr',
        '\u21A0': 'Rarr',
        '\u21A1': 'Darr',
        '\u21A2': 'larrtl',
        '\u21A3': 'rarrtl',
        '\u21A4': 'mapstoleft',
        '\u21A5': 'mapstoup',
        '\u21A6': 'map',
        '\u21A7': 'mapstodown',
        '\u21A9': 'larrhk',
        '\u21AA': 'rarrhk',
        '\u21AB': 'larrlp',
        '\u21AC': 'rarrlp',
        '\u21AD': 'harrw',
        '\u21B0': 'lsh',
        '\u21B1': 'rsh',
        '\u21B2': 'ldsh',
        '\u21B3': 'rdsh',
        '\u21B5': 'crarr',
        '\u21B6': 'cularr',
        '\u21B7': 'curarr',
        '\u21BA': 'olarr',
        '\u21BB': 'orarr',
        '\u21BC': 'lharu',
        '\u21BD': 'lhard',
        '\u21BE': 'uharr',
        '\u21BF': 'uharl',
        '\u21C0': 'rharu',
        '\u21C1': 'rhard',
        '\u21C2': 'dharr',
        '\u21C3': 'dharl',
        '\u21C4': 'rlarr',
        '\u21C5': 'udarr',
        '\u21C6': 'lrarr',
        '\u21C7': 'llarr',
        '\u21C8': 'uuarr',
        '\u21C9': 'rrarr',
        '\u21CA': 'ddarr',
        '\u21CB': 'lrhar',
        '\u21CC': 'rlhar',
        '\u21D0': 'lArr',
        '\u21CD': 'nlArr',
        '\u21D1': 'uArr',
        '\u21D2': 'rArr',
        '\u21CF': 'nrArr',
        '\u21D3': 'dArr',
        '\u21D4': 'iff',
        '\u21CE': 'nhArr',
        '\u21D5': 'vArr',
        '\u21D6': 'nwArr',
        '\u21D7': 'neArr',
        '\u21D8': 'seArr',
        '\u21D9': 'swArr',
        '\u21DA': 'lAarr',
        '\u21DB': 'rAarr',
        '\u21DD': 'zigrarr',
        '\u21E4': 'larrb',
        '\u21E5': 'rarrb',
        '\u21F5': 'duarr',
        '\u21FD': 'loarr',
        '\u21FE': 'roarr',
        '\u21FF': 'hoarr',
        '\u2200': 'forall',
        '\u2201': 'comp',
        '\u2202': 'part',
        '\u2202\u0338': 'npart',
        '\u2203': 'exist',
        '\u2204': 'nexist',
        '\u2205': 'empty',
        '\u2207': 'Del',
        '\u2208': 'in',
        '\u2209': 'notin',
        '\u220B': 'ni',
        '\u220C': 'notni',
        '\u03F6': 'bepsi',
        '\u220F': 'prod',
        '\u2210': 'coprod',
        '\u2211': 'sum',
        '+': 'plus',
        '\xB1': 'pm',
        '\xF7': 'div',
        '\xD7': 'times',
        '<': 'lt',
        '\u226E': 'nlt',
        '<\u20D2': 'nvlt',
        '=': 'equals',
        '\u2260': 'ne',
        '=\u20E5': 'bne',
        '\u2A75': 'Equal',
        '>': 'gt',
        '\u226F': 'ngt',
        '>\u20D2': 'nvgt',
        '\xAC': 'not',
        '|': 'vert',
        '\xA6': 'brvbar',
        '\u2212': 'minus',
        '\u2213': 'mp',
        '\u2214': 'plusdo',
        '\u2044': 'frasl',
        '\u2216': 'setmn',
        '\u2217': 'lowast',
        '\u2218': 'compfn',
        '\u221A': 'Sqrt',
        '\u221D': 'prop',
        '\u221E': 'infin',
        '\u221F': 'angrt',
        '\u2220': 'ang',
        '\u2220\u20D2': 'nang',
        '\u2221': 'angmsd',
        '\u2222': 'angsph',
        '\u2223': 'mid',
        '\u2224': 'nmid',
        '\u2225': 'par',
        '\u2226': 'npar',
        '\u2227': 'and',
        '\u2228': 'or',
        '\u2229': 'cap',
        '\u2229\uFE00': 'caps',
        '\u222A': 'cup',
        '\u222A\uFE00': 'cups',
        '\u222B': 'int',
        '\u222C': 'Int',
        '\u222D': 'tint',
        '\u2A0C': 'qint',
        '\u222E': 'oint',
        '\u222F': 'Conint',
        '\u2230': 'Cconint',
        '\u2231': 'cwint',
        '\u2232': 'cwconint',
        '\u2233': 'awconint',
        '\u2234': 'there4',
        '\u2235': 'becaus',
        '\u2236': 'ratio',
        '\u2237': 'Colon',
        '\u2238': 'minusd',
        '\u223A': 'mDDot',
        '\u223B': 'homtht',
        '\u223C': 'sim',
        '\u2241': 'nsim',
        '\u223C\u20D2': 'nvsim',
        '\u223D': 'bsim',
        '\u223D\u0331': 'race',
        '\u223E': 'ac',
        '\u223E\u0333': 'acE',
        '\u223F': 'acd',
        '\u2240': 'wr',
        '\u2242': 'esim',
        '\u2242\u0338': 'nesim',
        '\u2243': 'sime',
        '\u2244': 'nsime',
        '\u2245': 'cong',
        '\u2247': 'ncong',
        '\u2246': 'simne',
        '\u2248': 'ap',
        '\u2249': 'nap',
        '\u224A': 'ape',
        '\u224B': 'apid',
        '\u224B\u0338': 'napid',
        '\u224C': 'bcong',
        '\u224D': 'CupCap',
        '\u226D': 'NotCupCap',
        '\u224D\u20D2': 'nvap',
        '\u224E': 'bump',
        '\u224E\u0338': 'nbump',
        '\u224F': 'bumpe',
        '\u224F\u0338': 'nbumpe',
        '\u2250': 'doteq',
        '\u2250\u0338': 'nedot',
        '\u2251': 'eDot',
        '\u2252': 'efDot',
        '\u2253': 'erDot',
        '\u2254': 'colone',
        '\u2255': 'ecolon',
        '\u2256': 'ecir',
        '\u2257': 'cire',
        '\u2259': 'wedgeq',
        '\u225A': 'veeeq',
        '\u225C': 'trie',
        '\u225F': 'equest',
        '\u2261': 'equiv',
        '\u2262': 'nequiv',
        '\u2261\u20E5': 'bnequiv',
        '\u2264': 'le',
        '\u2270': 'nle',
        '\u2264\u20D2': 'nvle',
        '\u2265': 'ge',
        '\u2271': 'nge',
        '\u2265\u20D2': 'nvge',
        '\u2266': 'lE',
        '\u2266\u0338': 'nlE',
        '\u2267': 'gE',
        '\u2267\u0338': 'ngE',
        '\u2268\uFE00': 'lvnE',
        '\u2268': 'lnE',
        '\u2269': 'gnE',
        '\u2269\uFE00': 'gvnE',
        '\u226A': 'll',
        '\u226A\u0338': 'nLtv',
        '\u226A\u20D2': 'nLt',
        '\u226B': 'gg',
        '\u226B\u0338': 'nGtv',
        '\u226B\u20D2': 'nGt',
        '\u226C': 'twixt',
        '\u2272': 'lsim',
        '\u2274': 'nlsim',
        '\u2273': 'gsim',
        '\u2275': 'ngsim',
        '\u2276': 'lg',
        '\u2278': 'ntlg',
        '\u2277': 'gl',
        '\u2279': 'ntgl',
        '\u227A': 'pr',
        '\u2280': 'npr',
        '\u227B': 'sc',
        '\u2281': 'nsc',
        '\u227C': 'prcue',
        '\u22E0': 'nprcue',
        '\u227D': 'sccue',
        '\u22E1': 'nsccue',
        '\u227E': 'prsim',
        '\u227F': 'scsim',
        '\u227F\u0338': 'NotSucceedsTilde',
        '\u2282': 'sub',
        '\u2284': 'nsub',
        '\u2282\u20D2': 'vnsub',
        '\u2283': 'sup',
        '\u2285': 'nsup',
        '\u2283\u20D2': 'vnsup',
        '\u2286': 'sube',
        '\u2288': 'nsube',
        '\u2287': 'supe',
        '\u2289': 'nsupe',
        '\u228A\uFE00': 'vsubne',
        '\u228A': 'subne',
        '\u228B\uFE00': 'vsupne',
        '\u228B': 'supne',
        '\u228D': 'cupdot',
        '\u228E': 'uplus',
        '\u228F': 'sqsub',
        '\u228F\u0338': 'NotSquareSubset',
        '\u2290': 'sqsup',
        '\u2290\u0338': 'NotSquareSuperset',
        '\u2291': 'sqsube',
        '\u22E2': 'nsqsube',
        '\u2292': 'sqsupe',
        '\u22E3': 'nsqsupe',
        '\u2293': 'sqcap',
        '\u2293\uFE00': 'sqcaps',
        '\u2294': 'sqcup',
        '\u2294\uFE00': 'sqcups',
        '\u2295': 'oplus',
        '\u2296': 'ominus',
        '\u2297': 'otimes',
        '\u2298': 'osol',
        '\u2299': 'odot',
        '\u229A': 'ocir',
        '\u229B': 'oast',
        '\u229D': 'odash',
        '\u229E': 'plusb',
        '\u229F': 'minusb',
        '\u22A0': 'timesb',
        '\u22A1': 'sdotb',
        '\u22A2': 'vdash',
        '\u22AC': 'nvdash',
        '\u22A3': 'dashv',
        '\u22A4': 'top',
        '\u22A5': 'bot',
        '\u22A7': 'models',
        '\u22A8': 'vDash',
        '\u22AD': 'nvDash',
        '\u22A9': 'Vdash',
        '\u22AE': 'nVdash',
        '\u22AA': 'Vvdash',
        '\u22AB': 'VDash',
        '\u22AF': 'nVDash',
        '\u22B0': 'prurel',
        '\u22B2': 'vltri',
        '\u22EA': 'nltri',
        '\u22B3': 'vrtri',
        '\u22EB': 'nrtri',
        '\u22B4': 'ltrie',
        '\u22EC': 'nltrie',
        '\u22B4\u20D2': 'nvltrie',
        '\u22B5': 'rtrie',
        '\u22ED': 'nrtrie',
        '\u22B5\u20D2': 'nvrtrie',
        '\u22B6': 'origof',
        '\u22B7': 'imof',
        '\u22B8': 'mumap',
        '\u22B9': 'hercon',
        '\u22BA': 'intcal',
        '\u22BB': 'veebar',
        '\u22BD': 'barvee',
        '\u22BE': 'angrtvb',
        '\u22BF': 'lrtri',
        '\u22C0': 'Wedge',
        '\u22C1': 'Vee',
        '\u22C2': 'xcap',
        '\u22C3': 'xcup',
        '\u22C4': 'diam',
        '\u22C5': 'sdot',
        '\u22C6': 'Star',
        '\u22C7': 'divonx',
        '\u22C8': 'bowtie',
        '\u22C9': 'ltimes',
        '\u22CA': 'rtimes',
        '\u22CB': 'lthree',
        '\u22CC': 'rthree',
        '\u22CD': 'bsime',
        '\u22CE': 'cuvee',
        '\u22CF': 'cuwed',
        '\u22D0': 'Sub',
        '\u22D1': 'Sup',
        '\u22D2': 'Cap',
        '\u22D3': 'Cup',
        '\u22D4': 'fork',
        '\u22D5': 'epar',
        '\u22D6': 'ltdot',
        '\u22D7': 'gtdot',
        '\u22D8': 'Ll',
        '\u22D8\u0338': 'nLl',
        '\u22D9': 'Gg',
        '\u22D9\u0338': 'nGg',
        '\u22DA\uFE00': 'lesg',
        '\u22DA': 'leg',
        '\u22DB': 'gel',
        '\u22DB\uFE00': 'gesl',
        '\u22DE': 'cuepr',
        '\u22DF': 'cuesc',
        '\u22E6': 'lnsim',
        '\u22E7': 'gnsim',
        '\u22E8': 'prnsim',
        '\u22E9': 'scnsim',
        '\u22EE': 'vellip',
        '\u22EF': 'ctdot',
        '\u22F0': 'utdot',
        '\u22F1': 'dtdot',
        '\u22F2': 'disin',
        '\u22F3': 'isinsv',
        '\u22F4': 'isins',
        '\u22F5': 'isindot',
        '\u22F5\u0338': 'notindot',
        '\u22F6': 'notinvc',
        '\u22F7': 'notinvb',
        '\u22F9': 'isinE',
        '\u22F9\u0338': 'notinE',
        '\u22FA': 'nisd',
        '\u22FB': 'xnis',
        '\u22FC': 'nis',
        '\u22FD': 'notnivc',
        '\u22FE': 'notnivb',
        '\u2305': 'barwed',
        '\u2306': 'Barwed',
        '\u230C': 'drcrop',
        '\u230D': 'dlcrop',
        '\u230E': 'urcrop',
        '\u230F': 'ulcrop',
        '\u2310': 'bnot',
        '\u2312': 'profline',
        '\u2313': 'profsurf',
        '\u2315': 'telrec',
        '\u2316': 'target',
        '\u231C': 'ulcorn',
        '\u231D': 'urcorn',
        '\u231E': 'dlcorn',
        '\u231F': 'drcorn',
        '\u2322': 'frown',
        '\u2323': 'smile',
        '\u232D': 'cylcty',
        '\u232E': 'profalar',
        '\u2336': 'topbot',
        '\u233D': 'ovbar',
        '\u233F': 'solbar',
        '\u237C': 'angzarr',
        '\u23B0': 'lmoust',
        '\u23B1': 'rmoust',
        '\u23B4': 'tbrk',
        '\u23B5': 'bbrk',
        '\u23B6': 'bbrktbrk',
        '\u23DC': 'OverParenthesis',
        '\u23DD': 'UnderParenthesis',
        '\u23DE': 'OverBrace',
        '\u23DF': 'UnderBrace',
        '\u23E2': 'trpezium',
        '\u23E7': 'elinters',
        '\u2423': 'blank',
        '\u2500': 'boxh',
        '\u2502': 'boxv',
        '\u250C': 'boxdr',
        '\u2510': 'boxdl',
        '\u2514': 'boxur',
        '\u2518': 'boxul',
        '\u251C': 'boxvr',
        '\u2524': 'boxvl',
        '\u252C': 'boxhd',
        '\u2534': 'boxhu',
        '\u253C': 'boxvh',
        '\u2550': 'boxH',
        '\u2551': 'boxV',
        '\u2552': 'boxdR',
        '\u2553': 'boxDr',
        '\u2554': 'boxDR',
        '\u2555': 'boxdL',
        '\u2556': 'boxDl',
        '\u2557': 'boxDL',
        '\u2558': 'boxuR',
        '\u2559': 'boxUr',
        '\u255A': 'boxUR',
        '\u255B': 'boxuL',
        '\u255C': 'boxUl',
        '\u255D': 'boxUL',
        '\u255E': 'boxvR',
        '\u255F': 'boxVr',
        '\u2560': 'boxVR',
        '\u2561': 'boxvL',
        '\u2562': 'boxVl',
        '\u2563': 'boxVL',
        '\u2564': 'boxHd',
        '\u2565': 'boxhD',
        '\u2566': 'boxHD',
        '\u2567': 'boxHu',
        '\u2568': 'boxhU',
        '\u2569': 'boxHU',
        '\u256A': 'boxvH',
        '\u256B': 'boxVh',
        '\u256C': 'boxVH',
        '\u2580': 'uhblk',
        '\u2584': 'lhblk',
        '\u2588': 'block',
        '\u2591': 'blk14',
        '\u2592': 'blk12',
        '\u2593': 'blk34',
        '\u25A1': 'squ',
        '\u25AA': 'squf',
        '\u25AB': 'EmptyVerySmallSquare',
        '\u25AD': 'rect',
        '\u25AE': 'marker',
        '\u25B1': 'fltns',
        '\u25B3': 'xutri',
        '\u25B4': 'utrif',
        '\u25B5': 'utri',
        '\u25B8': 'rtrif',
        '\u25B9': 'rtri',
        '\u25BD': 'xdtri',
        '\u25BE': 'dtrif',
        '\u25BF': 'dtri',
        '\u25C2': 'ltrif',
        '\u25C3': 'ltri',
        '\u25CA': 'loz',
        '\u25CB': 'cir',
        '\u25EC': 'tridot',
        '\u25EF': 'xcirc',
        '\u25F8': 'ultri',
        '\u25F9': 'urtri',
        '\u25FA': 'lltri',
        '\u25FB': 'EmptySmallSquare',
        '\u25FC': 'FilledSmallSquare',
        '\u2605': 'starf',
        '\u2606': 'star',
        '\u260E': 'phone',
        '\u2640': 'female',
        '\u2642': 'male',
        '\u2660': 'spades',
        '\u2663': 'clubs',
        '\u2665': 'hearts',
        '\u2666': 'diams',
        '\u266A': 'sung',
        '\u2713': 'check',
        '\u2717': 'cross',
        '\u2720': 'malt',
        '\u2736': 'sext',
        '\u2758': 'VerticalSeparator',
        '\u27C8': 'bsolhsub',
        '\u27C9': 'suphsol',
        '\u27F5': 'xlarr',
        '\u27F6': 'xrarr',
        '\u27F7': 'xharr',
        '\u27F8': 'xlArr',
        '\u27F9': 'xrArr',
        '\u27FA': 'xhArr',
        '\u27FC': 'xmap',
        '\u27FF': 'dzigrarr',
        '\u2902': 'nvlArr',
        '\u2903': 'nvrArr',
        '\u2904': 'nvHarr',
        '\u2905': 'Map',
        '\u290C': 'lbarr',
        '\u290D': 'rbarr',
        '\u290E': 'lBarr',
        '\u290F': 'rBarr',
        '\u2910': 'RBarr',
        '\u2911': 'DDotrahd',
        '\u2912': 'UpArrowBar',
        '\u2913': 'DownArrowBar',
        '\u2916': 'Rarrtl',
        '\u2919': 'latail',
        '\u291A': 'ratail',
        '\u291B': 'lAtail',
        '\u291C': 'rAtail',
        '\u291D': 'larrfs',
        '\u291E': 'rarrfs',
        '\u291F': 'larrbfs',
        '\u2920': 'rarrbfs',
        '\u2923': 'nwarhk',
        '\u2924': 'nearhk',
        '\u2925': 'searhk',
        '\u2926': 'swarhk',
        '\u2927': 'nwnear',
        '\u2928': 'toea',
        '\u2929': 'tosa',
        '\u292A': 'swnwar',
        '\u2933': 'rarrc',
        '\u2933\u0338': 'nrarrc',
        '\u2935': 'cudarrr',
        '\u2936': 'ldca',
        '\u2937': 'rdca',
        '\u2938': 'cudarrl',
        '\u2939': 'larrpl',
        '\u293C': 'curarrm',
        '\u293D': 'cularrp',
        '\u2945': 'rarrpl',
        '\u2948': 'harrcir',
        '\u2949': 'Uarrocir',
        '\u294A': 'lurdshar',
        '\u294B': 'ldrushar',
        '\u294E': 'LeftRightVector',
        '\u294F': 'RightUpDownVector',
        '\u2950': 'DownLeftRightVector',
        '\u2951': 'LeftUpDownVector',
        '\u2952': 'LeftVectorBar',
        '\u2953': 'RightVectorBar',
        '\u2954': 'RightUpVectorBar',
        '\u2955': 'RightDownVectorBar',
        '\u2956': 'DownLeftVectorBar',
        '\u2957': 'DownRightVectorBar',
        '\u2958': 'LeftUpVectorBar',
        '\u2959': 'LeftDownVectorBar',
        '\u295A': 'LeftTeeVector',
        '\u295B': 'RightTeeVector',
        '\u295C': 'RightUpTeeVector',
        '\u295D': 'RightDownTeeVector',
        '\u295E': 'DownLeftTeeVector',
        '\u295F': 'DownRightTeeVector',
        '\u2960': 'LeftUpTeeVector',
        '\u2961': 'LeftDownTeeVector',
        '\u2962': 'lHar',
        '\u2963': 'uHar',
        '\u2964': 'rHar',
        '\u2965': 'dHar',
        '\u2966': 'luruhar',
        '\u2967': 'ldrdhar',
        '\u2968': 'ruluhar',
        '\u2969': 'rdldhar',
        '\u296A': 'lharul',
        '\u296B': 'llhard',
        '\u296C': 'rharul',
        '\u296D': 'lrhard',
        '\u296E': 'udhar',
        '\u296F': 'duhar',
        '\u2970': 'RoundImplies',
        '\u2971': 'erarr',
        '\u2972': 'simrarr',
        '\u2973': 'larrsim',
        '\u2974': 'rarrsim',
        '\u2975': 'rarrap',
        '\u2976': 'ltlarr',
        '\u2978': 'gtrarr',
        '\u2979': 'subrarr',
        '\u297B': 'suplarr',
        '\u297C': 'lfisht',
        '\u297D': 'rfisht',
        '\u297E': 'ufisht',
        '\u297F': 'dfisht',
        '\u299A': 'vzigzag',
        '\u299C': 'vangrt',
        '\u299D': 'angrtvbd',
        '\u29A4': 'ange',
        '\u29A5': 'range',
        '\u29A6': 'dwangle',
        '\u29A7': 'uwangle',
        '\u29A8': 'angmsdaa',
        '\u29A9': 'angmsdab',
        '\u29AA': 'angmsdac',
        '\u29AB': 'angmsdad',
        '\u29AC': 'angmsdae',
        '\u29AD': 'angmsdaf',
        '\u29AE': 'angmsdag',
        '\u29AF': 'angmsdah',
        '\u29B0': 'bemptyv',
        '\u29B1': 'demptyv',
        '\u29B2': 'cemptyv',
        '\u29B3': 'raemptyv',
        '\u29B4': 'laemptyv',
        '\u29B5': 'ohbar',
        '\u29B6': 'omid',
        '\u29B7': 'opar',
        '\u29B9': 'operp',
        '\u29BB': 'olcross',
        '\u29BC': 'odsold',
        '\u29BE': 'olcir',
        '\u29BF': 'ofcir',
        '\u29C0': 'olt',
        '\u29C1': 'ogt',
        '\u29C2': 'cirscir',
        '\u29C3': 'cirE',
        '\u29C4': 'solb',
        '\u29C5': 'bsolb',
        '\u29C9': 'boxbox',
        '\u29CD': 'trisb',
        '\u29CE': 'rtriltri',
        '\u29CF': 'LeftTriangleBar',
        '\u29CF\u0338': 'NotLeftTriangleBar',
        '\u29D0': 'RightTriangleBar',
        '\u29D0\u0338': 'NotRightTriangleBar',
        '\u29DC': 'iinfin',
        '\u29DD': 'infintie',
        '\u29DE': 'nvinfin',
        '\u29E3': 'eparsl',
        '\u29E4': 'smeparsl',
        '\u29E5': 'eqvparsl',
        '\u29EB': 'lozf',
        '\u29F4': 'RuleDelayed',
        '\u29F6': 'dsol',
        '\u2A00': 'xodot',
        '\u2A01': 'xoplus',
        '\u2A02': 'xotime',
        '\u2A04': 'xuplus',
        '\u2A06': 'xsqcup',
        '\u2A0D': 'fpartint',
        '\u2A10': 'cirfnint',
        '\u2A11': 'awint',
        '\u2A12': 'rppolint',
        '\u2A13': 'scpolint',
        '\u2A14': 'npolint',
        '\u2A15': 'pointint',
        '\u2A16': 'quatint',
        '\u2A17': 'intlarhk',
        '\u2A22': 'pluscir',
        '\u2A23': 'plusacir',
        '\u2A24': 'simplus',
        '\u2A25': 'plusdu',
        '\u2A26': 'plussim',
        '\u2A27': 'plustwo',
        '\u2A29': 'mcomma',
        '\u2A2A': 'minusdu',
        '\u2A2D': 'loplus',
        '\u2A2E': 'roplus',
        '\u2A2F': 'Cross',
        '\u2A30': 'timesd',
        '\u2A31': 'timesbar',
        '\u2A33': 'smashp',
        '\u2A34': 'lotimes',
        '\u2A35': 'rotimes',
        '\u2A36': 'otimesas',
        '\u2A37': 'Otimes',
        '\u2A38': 'odiv',
        '\u2A39': 'triplus',
        '\u2A3A': 'triminus',
        '\u2A3B': 'tritime',
        '\u2A3C': 'iprod',
        '\u2A3F': 'amalg',
        '\u2A40': 'capdot',
        '\u2A42': 'ncup',
        '\u2A43': 'ncap',
        '\u2A44': 'capand',
        '\u2A45': 'cupor',
        '\u2A46': 'cupcap',
        '\u2A47': 'capcup',
        '\u2A48': 'cupbrcap',
        '\u2A49': 'capbrcup',
        '\u2A4A': 'cupcup',
        '\u2A4B': 'capcap',
        '\u2A4C': 'ccups',
        '\u2A4D': 'ccaps',
        '\u2A50': 'ccupssm',
        '\u2A53': 'And',
        '\u2A54': 'Or',
        '\u2A55': 'andand',
        '\u2A56': 'oror',
        '\u2A57': 'orslope',
        '\u2A58': 'andslope',
        '\u2A5A': 'andv',
        '\u2A5B': 'orv',
        '\u2A5C': 'andd',
        '\u2A5D': 'ord',
        '\u2A5F': 'wedbar',
        '\u2A66': 'sdote',
        '\u2A6A': 'simdot',
        '\u2A6D': 'congdot',
        '\u2A6D\u0338': 'ncongdot',
        '\u2A6E': 'easter',
        '\u2A6F': 'apacir',
        '\u2A70': 'apE',
        '\u2A70\u0338': 'napE',
        '\u2A71': 'eplus',
        '\u2A72': 'pluse',
        '\u2A73': 'Esim',
        '\u2A77': 'eDDot',
        '\u2A78': 'equivDD',
        '\u2A79': 'ltcir',
        '\u2A7A': 'gtcir',
        '\u2A7B': 'ltquest',
        '\u2A7C': 'gtquest',
        '\u2A7D': 'les',
        '\u2A7D\u0338': 'nles',
        '\u2A7E': 'ges',
        '\u2A7E\u0338': 'nges',
        '\u2A7F': 'lesdot',
        '\u2A80': 'gesdot',
        '\u2A81': 'lesdoto',
        '\u2A82': 'gesdoto',
        '\u2A83': 'lesdotor',
        '\u2A84': 'gesdotol',
        '\u2A85': 'lap',
        '\u2A86': 'gap',
        '\u2A87': 'lne',
        '\u2A88': 'gne',
        '\u2A89': 'lnap',
        '\u2A8A': 'gnap',
        '\u2A8B': 'lEg',
        '\u2A8C': 'gEl',
        '\u2A8D': 'lsime',
        '\u2A8E': 'gsime',
        '\u2A8F': 'lsimg',
        '\u2A90': 'gsiml',
        '\u2A91': 'lgE',
        '\u2A92': 'glE',
        '\u2A93': 'lesges',
        '\u2A94': 'gesles',
        '\u2A95': 'els',
        '\u2A96': 'egs',
        '\u2A97': 'elsdot',
        '\u2A98': 'egsdot',
        '\u2A99': 'el',
        '\u2A9A': 'eg',
        '\u2A9D': 'siml',
        '\u2A9E': 'simg',
        '\u2A9F': 'simlE',
        '\u2AA0': 'simgE',
        '\u2AA1': 'LessLess',
        '\u2AA1\u0338': 'NotNestedLessLess',
        '\u2AA2': 'GreaterGreater',
        '\u2AA2\u0338': 'NotNestedGreaterGreater',
        '\u2AA4': 'glj',
        '\u2AA5': 'gla',
        '\u2AA6': 'ltcc',
        '\u2AA7': 'gtcc',
        '\u2AA8': 'lescc',
        '\u2AA9': 'gescc',
        '\u2AAA': 'smt',
        '\u2AAB': 'lat',
        '\u2AAC': 'smte',
        '\u2AAC\uFE00': 'smtes',
        '\u2AAD': 'late',
        '\u2AAD\uFE00': 'lates',
        '\u2AAE': 'bumpE',
        '\u2AAF': 'pre',
        '\u2AAF\u0338': 'npre',
        '\u2AB0': 'sce',
        '\u2AB0\u0338': 'nsce',
        '\u2AB3': 'prE',
        '\u2AB4': 'scE',
        '\u2AB5': 'prnE',
        '\u2AB6': 'scnE',
        '\u2AB7': 'prap',
        '\u2AB8': 'scap',
        '\u2AB9': 'prnap',
        '\u2ABA': 'scnap',
        '\u2ABB': 'Pr',
        '\u2ABC': 'Sc',
        '\u2ABD': 'subdot',
        '\u2ABE': 'supdot',
        '\u2ABF': 'subplus',
        '\u2AC0': 'supplus',
        '\u2AC1': 'submult',
        '\u2AC2': 'supmult',
        '\u2AC3': 'subedot',
        '\u2AC4': 'supedot',
        '\u2AC5': 'subE',
        '\u2AC5\u0338': 'nsubE',
        '\u2AC6': 'supE',
        '\u2AC6\u0338': 'nsupE',
        '\u2AC7': 'subsim',
        '\u2AC8': 'supsim',
        '\u2ACB\uFE00': 'vsubnE',
        '\u2ACB': 'subnE',
        '\u2ACC\uFE00': 'vsupnE',
        '\u2ACC': 'supnE',
        '\u2ACF': 'csub',
        '\u2AD0': 'csup',
        '\u2AD1': 'csube',
        '\u2AD2': 'csupe',
        '\u2AD3': 'subsup',
        '\u2AD4': 'supsub',
        '\u2AD5': 'subsub',
        '\u2AD6': 'supsup',
        '\u2AD7': 'suphsub',
        '\u2AD8': 'supdsub',
        '\u2AD9': 'forkv',
        '\u2ADA': 'topfork',
        '\u2ADB': 'mlcp',
        '\u2AE4': 'Dashv',
        '\u2AE6': 'Vdashl',
        '\u2AE7': 'Barv',
        '\u2AE8': 'vBar',
        '\u2AE9': 'vBarv',
        '\u2AEB': 'Vbar',
        '\u2AEC': 'Not',
        '\u2AED': 'bNot',
        '\u2AEE': 'rnmid',
        '\u2AEF': 'cirmid',
        '\u2AF0': 'midcir',
        '\u2AF1': 'topcir',
        '\u2AF2': 'nhpar',
        '\u2AF3': 'parsim',
        '\u2AFD': 'parsl',
        '\u2AFD\u20E5': 'nparsl',
        '\u266D': 'flat',
        '\u266E': 'natur',
        '\u266F': 'sharp',
        '\xA4': 'curren',
        '\xA2': 'cent',
        $: 'dollar',
        '\xA3': 'pound',
        '\xA5': 'yen',
        '\u20AC': 'euro',
        '\xB9': 'sup1',
        '\xBD': 'half',
        '\u2153': 'frac13',
        '\xBC': 'frac14',
        '\u2155': 'frac15',
        '\u2159': 'frac16',
        '\u215B': 'frac18',
        '\xB2': 'sup2',
        '\u2154': 'frac23',
        '\u2156': 'frac25',
        '\xB3': 'sup3',
        '\xBE': 'frac34',
        '\u2157': 'frac35',
        '\u215C': 'frac38',
        '\u2158': 'frac45',
        '\u215A': 'frac56',
        '\u215D': 'frac58',
        '\u215E': 'frac78',
        '\u{1D4B6}': 'ascr',
        '\u{1D552}': 'aopf',
        '\u{1D51E}': 'afr',
        '\u{1D538}': 'Aopf',
        '\u{1D504}': 'Afr',
        '\u{1D49C}': 'Ascr',
        '\xAA': 'ordf',
        '\xE1': 'aacute',
        '\xC1': 'Aacute',
        '\xE0': 'agrave',
        '\xC0': 'Agrave',
        '\u0103': 'abreve',
        '\u0102': 'Abreve',
        '\xE2': 'acirc',
        '\xC2': 'Acirc',
        '\xE5': 'aring',
        '\xC5': 'angst',
        '\xE4': 'auml',
        '\xC4': 'Auml',
        '\xE3': 'atilde',
        '\xC3': 'Atilde',
        '\u0105': 'aogon',
        '\u0104': 'Aogon',
        '\u0101': 'amacr',
        '\u0100': 'Amacr',
        '\xE6': 'aelig',
        '\xC6': 'AElig',
        '\u{1D4B7}': 'bscr',
        '\u{1D553}': 'bopf',
        '\u{1D51F}': 'bfr',
        '\u{1D539}': 'Bopf',
        '\u212C': 'Bscr',
        '\u{1D505}': 'Bfr',
        '\u{1D520}': 'cfr',
        '\u{1D4B8}': 'cscr',
        '\u{1D554}': 'copf',
        '\u212D': 'Cfr',
        '\u{1D49E}': 'Cscr',
        '\u2102': 'Copf',
        '\u0107': 'cacute',
        '\u0106': 'Cacute',
        '\u0109': 'ccirc',
        '\u0108': 'Ccirc',
        '\u010D': 'ccaron',
        '\u010C': 'Ccaron',
        '\u010B': 'cdot',
        '\u010A': 'Cdot',
        '\xE7': 'ccedil',
        '\xC7': 'Ccedil',
        '\u2105': 'incare',
        '\u{1D521}': 'dfr',
        '\u2146': 'dd',
        '\u{1D555}': 'dopf',
        '\u{1D4B9}': 'dscr',
        '\u{1D49F}': 'Dscr',
        '\u{1D507}': 'Dfr',
        '\u2145': 'DD',
        '\u{1D53B}': 'Dopf',
        '\u010F': 'dcaron',
        '\u010E': 'Dcaron',
        '\u0111': 'dstrok',
        '\u0110': 'Dstrok',
        '\xF0': 'eth',
        '\xD0': 'ETH',
        '\u2147': 'ee',
        '\u212F': 'escr',
        '\u{1D522}': 'efr',
        '\u{1D556}': 'eopf',
        '\u2130': 'Escr',
        '\u{1D508}': 'Efr',
        '\u{1D53C}': 'Eopf',
        '\xE9': 'eacute',
        '\xC9': 'Eacute',
        '\xE8': 'egrave',
        '\xC8': 'Egrave',
        '\xEA': 'ecirc',
        '\xCA': 'Ecirc',
        '\u011B': 'ecaron',
        '\u011A': 'Ecaron',
        '\xEB': 'euml',
        '\xCB': 'Euml',
        '\u0117': 'edot',
        '\u0116': 'Edot',
        '\u0119': 'eogon',
        '\u0118': 'Eogon',
        '\u0113': 'emacr',
        '\u0112': 'Emacr',
        '\u{1D523}': 'ffr',
        '\u{1D557}': 'fopf',
        '\u{1D4BB}': 'fscr',
        '\u{1D509}': 'Ffr',
        '\u{1D53D}': 'Fopf',
        '\u2131': 'Fscr',
        '\uFB00': 'fflig',
        '\uFB03': 'ffilig',
        '\uFB04': 'ffllig',
        '\uFB01': 'filig',
        fj: 'fjlig',
        '\uFB02': 'fllig',
        '\u0192': 'fnof',
        '\u210A': 'gscr',
        '\u{1D558}': 'gopf',
        '\u{1D524}': 'gfr',
        '\u{1D4A2}': 'Gscr',
        '\u{1D53E}': 'Gopf',
        '\u{1D50A}': 'Gfr',
        '\u01F5': 'gacute',
        '\u011F': 'gbreve',
        '\u011E': 'Gbreve',
        '\u011D': 'gcirc',
        '\u011C': 'Gcirc',
        '\u0121': 'gdot',
        '\u0120': 'Gdot',
        '\u0122': 'Gcedil',
        '\u{1D525}': 'hfr',
        '\u210E': 'planckh',
        '\u{1D4BD}': 'hscr',
        '\u{1D559}': 'hopf',
        '\u210B': 'Hscr',
        '\u210C': 'Hfr',
        '\u210D': 'Hopf',
        '\u0125': 'hcirc',
        '\u0124': 'Hcirc',
        '\u210F': 'hbar',
        '\u0127': 'hstrok',
        '\u0126': 'Hstrok',
        '\u{1D55A}': 'iopf',
        '\u{1D526}': 'ifr',
        '\u{1D4BE}': 'iscr',
        '\u2148': 'ii',
        '\u{1D540}': 'Iopf',
        '\u2110': 'Iscr',
        '\u2111': 'Im',
        '\xED': 'iacute',
        '\xCD': 'Iacute',
        '\xEC': 'igrave',
        '\xCC': 'Igrave',
        '\xEE': 'icirc',
        '\xCE': 'Icirc',
        '\xEF': 'iuml',
        '\xCF': 'Iuml',
        '\u0129': 'itilde',
        '\u0128': 'Itilde',
        '\u0130': 'Idot',
        '\u012F': 'iogon',
        '\u012E': 'Iogon',
        '\u012B': 'imacr',
        '\u012A': 'Imacr',
        '\u0133': 'ijlig',
        '\u0132': 'IJlig',
        '\u0131': 'imath',
        '\u{1D4BF}': 'jscr',
        '\u{1D55B}': 'jopf',
        '\u{1D527}': 'jfr',
        '\u{1D4A5}': 'Jscr',
        '\u{1D50D}': 'Jfr',
        '\u{1D541}': 'Jopf',
        '\u0135': 'jcirc',
        '\u0134': 'Jcirc',
        '\u0237': 'jmath',
        '\u{1D55C}': 'kopf',
        '\u{1D4C0}': 'kscr',
        '\u{1D528}': 'kfr',
        '\u{1D4A6}': 'Kscr',
        '\u{1D542}': 'Kopf',
        '\u{1D50E}': 'Kfr',
        '\u0137': 'kcedil',
        '\u0136': 'Kcedil',
        '\u{1D529}': 'lfr',
        '\u{1D4C1}': 'lscr',
        '\u2113': 'ell',
        '\u{1D55D}': 'lopf',
        '\u2112': 'Lscr',
        '\u{1D50F}': 'Lfr',
        '\u{1D543}': 'Lopf',
        '\u013A': 'lacute',
        '\u0139': 'Lacute',
        '\u013E': 'lcaron',
        '\u013D': 'Lcaron',
        '\u013C': 'lcedil',
        '\u013B': 'Lcedil',
        '\u0142': 'lstrok',
        '\u0141': 'Lstrok',
        '\u0140': 'lmidot',
        '\u013F': 'Lmidot',
        '\u{1D52A}': 'mfr',
        '\u{1D55E}': 'mopf',
        '\u{1D4C2}': 'mscr',
        '\u{1D510}': 'Mfr',
        '\u{1D544}': 'Mopf',
        '\u2133': 'Mscr',
        '\u{1D52B}': 'nfr',
        '\u{1D55F}': 'nopf',
        '\u{1D4C3}': 'nscr',
        '\u2115': 'Nopf',
        '\u{1D4A9}': 'Nscr',
        '\u{1D511}': 'Nfr',
        '\u0144': 'nacute',
        '\u0143': 'Nacute',
        '\u0148': 'ncaron',
        '\u0147': 'Ncaron',
        '\xF1': 'ntilde',
        '\xD1': 'Ntilde',
        '\u0146': 'ncedil',
        '\u0145': 'Ncedil',
        '\u2116': 'numero',
        '\u014B': 'eng',
        '\u014A': 'ENG',
        '\u{1D560}': 'oopf',
        '\u{1D52C}': 'ofr',
        '\u2134': 'oscr',
        '\u{1D4AA}': 'Oscr',
        '\u{1D512}': 'Ofr',
        '\u{1D546}': 'Oopf',
        '\xBA': 'ordm',
        '\xF3': 'oacute',
        '\xD3': 'Oacute',
        '\xF2': 'ograve',
        '\xD2': 'Ograve',
        '\xF4': 'ocirc',
        '\xD4': 'Ocirc',
        '\xF6': 'ouml',
        '\xD6': 'Ouml',
        '\u0151': 'odblac',
        '\u0150': 'Odblac',
        '\xF5': 'otilde',
        '\xD5': 'Otilde',
        '\xF8': 'oslash',
        '\xD8': 'Oslash',
        '\u014D': 'omacr',
        '\u014C': 'Omacr',
        '\u0153': 'oelig',
        '\u0152': 'OElig',
        '\u{1D52D}': 'pfr',
        '\u{1D4C5}': 'pscr',
        '\u{1D561}': 'popf',
        '\u2119': 'Popf',
        '\u{1D513}': 'Pfr',
        '\u{1D4AB}': 'Pscr',
        '\u{1D562}': 'qopf',
        '\u{1D52E}': 'qfr',
        '\u{1D4C6}': 'qscr',
        '\u{1D4AC}': 'Qscr',
        '\u{1D514}': 'Qfr',
        '\u211A': 'Qopf',
        '\u0138': 'kgreen',
        '\u{1D52F}': 'rfr',
        '\u{1D563}': 'ropf',
        '\u{1D4C7}': 'rscr',
        '\u211B': 'Rscr',
        '\u211C': 'Re',
        '\u211D': 'Ropf',
        '\u0155': 'racute',
        '\u0154': 'Racute',
        '\u0159': 'rcaron',
        '\u0158': 'Rcaron',
        '\u0157': 'rcedil',
        '\u0156': 'Rcedil',
        '\u{1D564}': 'sopf',
        '\u{1D4C8}': 'sscr',
        '\u{1D530}': 'sfr',
        '\u{1D54A}': 'Sopf',
        '\u{1D516}': 'Sfr',
        '\u{1D4AE}': 'Sscr',
        '\u24C8': 'oS',
        '\u015B': 'sacute',
        '\u015A': 'Sacute',
        '\u015D': 'scirc',
        '\u015C': 'Scirc',
        '\u0161': 'scaron',
        '\u0160': 'Scaron',
        '\u015F': 'scedil',
        '\u015E': 'Scedil',
        '\xDF': 'szlig',
        '\u{1D531}': 'tfr',
        '\u{1D4C9}': 'tscr',
        '\u{1D565}': 'topf',
        '\u{1D4AF}': 'Tscr',
        '\u{1D517}': 'Tfr',
        '\u{1D54B}': 'Topf',
        '\u0165': 'tcaron',
        '\u0164': 'Tcaron',
        '\u0163': 'tcedil',
        '\u0162': 'Tcedil',
        '\u2122': 'trade',
        '\u0167': 'tstrok',
        '\u0166': 'Tstrok',
        '\u{1D4CA}': 'uscr',
        '\u{1D566}': 'uopf',
        '\u{1D532}': 'ufr',
        '\u{1D54C}': 'Uopf',
        '\u{1D518}': 'Ufr',
        '\u{1D4B0}': 'Uscr',
        '\xFA': 'uacute',
        '\xDA': 'Uacute',
        '\xF9': 'ugrave',
        '\xD9': 'Ugrave',
        '\u016D': 'ubreve',
        '\u016C': 'Ubreve',
        '\xFB': 'ucirc',
        '\xDB': 'Ucirc',
        '\u016F': 'uring',
        '\u016E': 'Uring',
        '\xFC': 'uuml',
        '\xDC': 'Uuml',
        '\u0171': 'udblac',
        '\u0170': 'Udblac',
        '\u0169': 'utilde',
        '\u0168': 'Utilde',
        '\u0173': 'uogon',
        '\u0172': 'Uogon',
        '\u016B': 'umacr',
        '\u016A': 'Umacr',
        '\u{1D533}': 'vfr',
        '\u{1D567}': 'vopf',
        '\u{1D4CB}': 'vscr',
        '\u{1D519}': 'Vfr',
        '\u{1D54D}': 'Vopf',
        '\u{1D4B1}': 'Vscr',
        '\u{1D568}': 'wopf',
        '\u{1D4CC}': 'wscr',
        '\u{1D534}': 'wfr',
        '\u{1D4B2}': 'Wscr',
        '\u{1D54E}': 'Wopf',
        '\u{1D51A}': 'Wfr',
        '\u0175': 'wcirc',
        '\u0174': 'Wcirc',
        '\u{1D535}': 'xfr',
        '\u{1D4CD}': 'xscr',
        '\u{1D569}': 'xopf',
        '\u{1D54F}': 'Xopf',
        '\u{1D51B}': 'Xfr',
        '\u{1D4B3}': 'Xscr',
        '\u{1D536}': 'yfr',
        '\u{1D4CE}': 'yscr',
        '\u{1D56A}': 'yopf',
        '\u{1D4B4}': 'Yscr',
        '\u{1D51C}': 'Yfr',
        '\u{1D550}': 'Yopf',
        '\xFD': 'yacute',
        '\xDD': 'Yacute',
        '\u0177': 'ycirc',
        '\u0176': 'Ycirc',
        '\xFF': 'yuml',
        '\u0178': 'Yuml',
        '\u{1D4CF}': 'zscr',
        '\u{1D537}': 'zfr',
        '\u{1D56B}': 'zopf',
        '\u2128': 'Zfr',
        '\u2124': 'Zopf',
        '\u{1D4B5}': 'Zscr',
        '\u017A': 'zacute',
        '\u0179': 'Zacute',
        '\u017E': 'zcaron',
        '\u017D': 'Zcaron',
        '\u017C': 'zdot',
        '\u017B': 'Zdot',
        '\u01B5': 'imped',
        '\xFE': 'thorn',
        '\xDE': 'THORN',
        '\u0149': 'napos',
        '\u03B1': 'alpha',
        '\u0391': 'Alpha',
        '\u03B2': 'beta',
        '\u0392': 'Beta',
        '\u03B3': 'gamma',
        '\u0393': 'Gamma',
        '\u03B4': 'delta',
        '\u0394': 'Delta',
        '\u03B5': 'epsi',
        '\u03F5': 'epsiv',
        '\u0395': 'Epsilon',
        '\u03DD': 'gammad',
        '\u03DC': 'Gammad',
        '\u03B6': 'zeta',
        '\u0396': 'Zeta',
        '\u03B7': 'eta',
        '\u0397': 'Eta',
        '\u03B8': 'theta',
        '\u03D1': 'thetav',
        '\u0398': 'Theta',
        '\u03B9': 'iota',
        '\u0399': 'Iota',
        '\u03BA': 'kappa',
        '\u03F0': 'kappav',
        '\u039A': 'Kappa',
        '\u03BB': 'lambda',
        '\u039B': 'Lambda',
        '\u03BC': 'mu',
        '\xB5': 'micro',
        '\u039C': 'Mu',
        '\u03BD': 'nu',
        '\u039D': 'Nu',
        '\u03BE': 'xi',
        '\u039E': 'Xi',
        '\u03BF': 'omicron',
        '\u039F': 'Omicron',
        '\u03C0': 'pi',
        '\u03D6': 'piv',
        '\u03A0': 'Pi',
        '\u03C1': 'rho',
        '\u03F1': 'rhov',
        '\u03A1': 'Rho',
        '\u03C3': 'sigma',
        '\u03A3': 'Sigma',
        '\u03C2': 'sigmaf',
        '\u03C4': 'tau',
        '\u03A4': 'Tau',
        '\u03C5': 'upsi',
        '\u03A5': 'Upsilon',
        '\u03D2': 'Upsi',
        '\u03C6': 'phi',
        '\u03D5': 'phiv',
        '\u03A6': 'Phi',
        '\u03C7': 'chi',
        '\u03A7': 'Chi',
        '\u03C8': 'psi',
        '\u03A8': 'Psi',
        '\u03C9': 'omega',
        '\u03A9': 'ohm',
        '\u0430': 'acy',
        '\u0410': 'Acy',
        '\u0431': 'bcy',
        '\u0411': 'Bcy',
        '\u0432': 'vcy',
        '\u0412': 'Vcy',
        '\u0433': 'gcy',
        '\u0413': 'Gcy',
        '\u0453': 'gjcy',
        '\u0403': 'GJcy',
        '\u0434': 'dcy',
        '\u0414': 'Dcy',
        '\u0452': 'djcy',
        '\u0402': 'DJcy',
        '\u0435': 'iecy',
        '\u0415': 'IEcy',
        '\u0451': 'iocy',
        '\u0401': 'IOcy',
        '\u0454': 'jukcy',
        '\u0404': 'Jukcy',
        '\u0436': 'zhcy',
        '\u0416': 'ZHcy',
        '\u0437': 'zcy',
        '\u0417': 'Zcy',
        '\u0455': 'dscy',
        '\u0405': 'DScy',
        '\u0438': 'icy',
        '\u0418': 'Icy',
        '\u0456': 'iukcy',
        '\u0406': 'Iukcy',
        '\u0457': 'yicy',
        '\u0407': 'YIcy',
        '\u0439': 'jcy',
        '\u0419': 'Jcy',
        '\u0458': 'jsercy',
        '\u0408': 'Jsercy',
        '\u043A': 'kcy',
        '\u041A': 'Kcy',
        '\u045C': 'kjcy',
        '\u040C': 'KJcy',
        '\u043B': 'lcy',
        '\u041B': 'Lcy',
        '\u0459': 'ljcy',
        '\u0409': 'LJcy',
        '\u043C': 'mcy',
        '\u041C': 'Mcy',
        '\u043D': 'ncy',
        '\u041D': 'Ncy',
        '\u045A': 'njcy',
        '\u040A': 'NJcy',
        '\u043E': 'ocy',
        '\u041E': 'Ocy',
        '\u043F': 'pcy',
        '\u041F': 'Pcy',
        '\u0440': 'rcy',
        '\u0420': 'Rcy',
        '\u0441': 'scy',
        '\u0421': 'Scy',
        '\u0442': 'tcy',
        '\u0422': 'Tcy',
        '\u045B': 'tshcy',
        '\u040B': 'TSHcy',
        '\u0443': 'ucy',
        '\u0423': 'Ucy',
        '\u045E': 'ubrcy',
        '\u040E': 'Ubrcy',
        '\u0444': 'fcy',
        '\u0424': 'Fcy',
        '\u0445': 'khcy',
        '\u0425': 'KHcy',
        '\u0446': 'tscy',
        '\u0426': 'TScy',
        '\u0447': 'chcy',
        '\u0427': 'CHcy',
        '\u045F': 'dzcy',
        '\u040F': 'DZcy',
        '\u0448': 'shcy',
        '\u0428': 'SHcy',
        '\u0449': 'shchcy',
        '\u0429': 'SHCHcy',
        '\u044A': 'hardcy',
        '\u042A': 'HARDcy',
        '\u044B': 'ycy',
        '\u042B': 'Ycy',
        '\u044C': 'softcy',
        '\u042C': 'SOFTcy',
        '\u044D': 'ecy',
        '\u042D': 'Ecy',
        '\u044E': 'yucy',
        '\u042E': 'YUcy',
        '\u044F': 'yacy',
        '\u042F': 'YAcy',
        '\u2135': 'aleph',
        '\u2136': 'beth',
        '\u2137': 'gimel',
        '\u2138': 'daleth'
      };
      var regexEscape = /["&'<>`]/g;
      var escapeMap = {
        '"': '&quot;',
        '&': '&amp;',
        "'": '&#x27;',
        '<': '&lt;',
        '>': '&gt;',
        '`': '&#x60;'
      };
      var regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
      var regexInvalidRawCodePoint =
        /[\0-\x08\x0B\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
      var regexDecode =
        /&(CounterClockwiseContourIntegral|DoubleLongLeftRightArrow|ClockwiseContourIntegral|NotNestedGreaterGreater|NotSquareSupersetEqual|DiacriticalDoubleAcute|NotRightTriangleEqual|NotSucceedsSlantEqual|NotPrecedesSlantEqual|CloseCurlyDoubleQuote|NegativeVeryThinSpace|DoubleContourIntegral|FilledVerySmallSquare|CapitalDifferentialD|OpenCurlyDoubleQuote|EmptyVerySmallSquare|NestedGreaterGreater|DoubleLongRightArrow|NotLeftTriangleEqual|NotGreaterSlantEqual|ReverseUpEquilibrium|DoubleLeftRightArrow|NotSquareSubsetEqual|NotDoubleVerticalBar|RightArrowLeftArrow|NotGreaterFullEqual|NotRightTriangleBar|SquareSupersetEqual|DownLeftRightVector|DoubleLongLeftArrow|leftrightsquigarrow|LeftArrowRightArrow|NegativeMediumSpace|blacktriangleright|RightDownVectorBar|PrecedesSlantEqual|RightDoubleBracket|SucceedsSlantEqual|NotLeftTriangleBar|RightTriangleEqual|SquareIntersection|RightDownTeeVector|ReverseEquilibrium|NegativeThickSpace|longleftrightarrow|Longleftrightarrow|LongLeftRightArrow|DownRightTeeVector|DownRightVectorBar|GreaterSlantEqual|SquareSubsetEqual|LeftDownVectorBar|LeftDoubleBracket|VerticalSeparator|rightleftharpoons|NotGreaterGreater|NotSquareSuperset|blacktriangleleft|blacktriangledown|NegativeThinSpace|LeftDownTeeVector|NotLessSlantEqual|leftrightharpoons|DoubleUpDownArrow|DoubleVerticalBar|LeftTriangleEqual|FilledSmallSquare|twoheadrightarrow|NotNestedLessLess|DownLeftTeeVector|DownLeftVectorBar|RightAngleBracket|NotTildeFullEqual|NotReverseElement|RightUpDownVector|DiacriticalTilde|NotSucceedsTilde|circlearrowright|NotPrecedesEqual|rightharpoondown|DoubleRightArrow|NotSucceedsEqual|NonBreakingSpace|NotRightTriangle|LessEqualGreater|RightUpTeeVector|LeftAngleBracket|GreaterFullEqual|DownArrowUpArrow|RightUpVectorBar|twoheadleftarrow|GreaterEqualLess|downharpoonright|RightTriangleBar|ntrianglerighteq|NotSupersetEqual|LeftUpDownVector|DiacriticalAcute|rightrightarrows|vartriangleright|UpArrowDownArrow|DiacriticalGrave|UnderParenthesis|EmptySmallSquare|LeftUpVectorBar|leftrightarrows|DownRightVector|downharpoonleft|trianglerighteq|ShortRightArrow|OverParenthesis|DoubleLeftArrow|DoubleDownArrow|NotSquareSubset|bigtriangledown|ntrianglelefteq|UpperRightArrow|curvearrowright|vartriangleleft|NotLeftTriangle|nleftrightarrow|LowerRightArrow|NotHumpDownHump|NotGreaterTilde|rightthreetimes|LeftUpTeeVector|NotGreaterEqual|straightepsilon|LeftTriangleBar|rightsquigarrow|ContourIntegral|rightleftarrows|CloseCurlyQuote|RightDownVector|LeftRightVector|nLeftrightarrow|leftharpoondown|circlearrowleft|SquareSuperset|OpenCurlyQuote|hookrightarrow|HorizontalLine|DiacriticalDot|NotLessGreater|ntriangleright|DoubleRightTee|InvisibleComma|InvisibleTimes|LowerLeftArrow|DownLeftVector|NotSubsetEqual|curvearrowleft|trianglelefteq|NotVerticalBar|TildeFullEqual|downdownarrows|NotGreaterLess|RightTeeVector|ZeroWidthSpace|looparrowright|LongRightArrow|doublebarwedge|ShortLeftArrow|ShortDownArrow|RightVectorBar|GreaterGreater|ReverseElement|rightharpoonup|LessSlantEqual|leftthreetimes|upharpoonright|rightarrowtail|LeftDownVector|Longrightarrow|NestedLessLess|UpperLeftArrow|nshortparallel|leftleftarrows|leftrightarrow|Leftrightarrow|LeftRightArrow|longrightarrow|upharpoonleft|RightArrowBar|ApplyFunction|LeftTeeVector|leftarrowtail|NotEqualTilde|varsubsetneqq|varsupsetneqq|RightTeeArrow|SucceedsEqual|SucceedsTilde|LeftVectorBar|SupersetEqual|hookleftarrow|DifferentialD|VerticalTilde|VeryThinSpace|blacktriangle|bigtriangleup|LessFullEqual|divideontimes|leftharpoonup|UpEquilibrium|ntriangleleft|RightTriangle|measuredangle|shortparallel|longleftarrow|Longleftarrow|LongLeftArrow|DoubleLeftTee|Poincareplane|PrecedesEqual|triangleright|DoubleUpArrow|RightUpVector|fallingdotseq|looparrowleft|PrecedesTilde|NotTildeEqual|NotTildeTilde|smallsetminus|Proportional|triangleleft|triangledown|UnderBracket|NotHumpEqual|exponentiale|ExponentialE|NotLessTilde|HilbertSpace|RightCeiling|blacklozenge|varsupsetneq|HumpDownHump|GreaterEqual|VerticalLine|LeftTeeArrow|NotLessEqual|DownTeeArrow|LeftTriangle|varsubsetneq|Intersection|NotCongruent|DownArrowBar|LeftUpVector|LeftArrowBar|risingdotseq|GreaterTilde|RoundImplies|SquareSubset|ShortUpArrow|NotSuperset|quaternions|precnapprox|backepsilon|preccurlyeq|OverBracket|blacksquare|MediumSpace|VerticalBar|circledcirc|circleddash|CircleMinus|CircleTimes|LessGreater|curlyeqprec|curlyeqsucc|diamondsuit|UpDownArrow|Updownarrow|RuleDelayed|Rrightarrow|updownarrow|RightVector|nRightarrow|nrightarrow|eqslantless|LeftCeiling|Equilibrium|SmallCircle|expectation|NotSucceeds|thickapprox|GreaterLess|SquareUnion|NotPrecedes|NotLessLess|straightphi|succnapprox|succcurlyeq|SubsetEqual|sqsupseteq|Proportion|Laplacetrf|ImaginaryI|supsetneqq|NotGreater|gtreqqless|NotElement|ThickSpace|TildeEqual|TildeTilde|Fouriertrf|rmoustache|EqualTilde|eqslantgtr|UnderBrace|LeftVector|UpArrowBar|nLeftarrow|nsubseteqq|subsetneqq|nsupseteqq|nleftarrow|succapprox|lessapprox|UpTeeArrow|upuparrows|curlywedge|lesseqqgtr|varepsilon|varnothing|RightFloor|complement|CirclePlus|sqsubseteq|Lleftarrow|circledast|RightArrow|Rightarrow|rightarrow|lmoustache|Bernoullis|precapprox|mapstoleft|mapstodown|longmapsto|dotsquare|downarrow|DoubleDot|nsubseteq|supsetneq|leftarrow|nsupseteq|subsetneq|ThinSpace|ngeqslant|subseteqq|HumpEqual|NotSubset|triangleq|NotCupCap|lesseqgtr|heartsuit|TripleDot|Leftarrow|Coproduct|Congruent|varpropto|complexes|gvertneqq|LeftArrow|LessTilde|supseteqq|MinusPlus|CircleDot|nleqslant|NotExists|gtreqless|nparallel|UnionPlus|LeftFloor|checkmark|CenterDot|centerdot|Mellintrf|gtrapprox|bigotimes|OverBrace|spadesuit|therefore|pitchfork|rationals|PlusMinus|Backslash|Therefore|DownBreve|backsimeq|backprime|DownArrow|nshortmid|Downarrow|lvertneqq|eqvparsl|imagline|imagpart|infintie|integers|Integral|intercal|LessLess|Uarrocir|intlarhk|sqsupset|angmsdaf|sqsubset|llcorner|vartheta|cupbrcap|lnapprox|Superset|SuchThat|succnsim|succneqq|angmsdag|biguplus|curlyvee|trpezium|Succeeds|NotTilde|bigwedge|angmsdah|angrtvbd|triminus|cwconint|fpartint|lrcorner|smeparsl|subseteq|urcorner|lurdshar|laemptyv|DDotrahd|approxeq|ldrushar|awconint|mapstoup|backcong|shortmid|triangle|geqslant|gesdotol|timesbar|circledR|circledS|setminus|multimap|naturals|scpolint|ncongdot|RightTee|boxminus|gnapprox|boxtimes|andslope|thicksim|angmsdaa|varsigma|cirfnint|rtriltri|angmsdab|rppolint|angmsdac|barwedge|drbkarow|clubsuit|thetasym|bsolhsub|capbrcup|dzigrarr|doteqdot|DotEqual|dotminus|UnderBar|NotEqual|realpart|otimesas|ulcorner|hksearow|hkswarow|parallel|PartialD|elinters|emptyset|plusacir|bbrktbrk|angmsdad|pointint|bigoplus|angmsdae|Precedes|bigsqcup|varkappa|notindot|supseteq|precneqq|precnsim|profalar|profline|profsurf|leqslant|lesdotor|raemptyv|subplus|notnivb|notnivc|subrarr|zigrarr|vzigzag|submult|subedot|Element|between|cirscir|larrbfs|larrsim|lotimes|lbrksld|lbrkslu|lozenge|ldrdhar|dbkarow|bigcirc|epsilon|simrarr|simplus|ltquest|Epsilon|luruhar|gtquest|maltese|npolint|eqcolon|npreceq|bigodot|ddagger|gtrless|bnequiv|harrcir|ddotseq|equivDD|backsim|demptyv|nsqsube|nsqsupe|Upsilon|nsubset|upsilon|minusdu|nsucceq|swarrow|nsupset|coloneq|searrow|boxplus|napprox|natural|asympeq|alefsym|congdot|nearrow|bigstar|diamond|supplus|tritime|LeftTee|nvinfin|triplus|NewLine|nvltrie|nvrtrie|nwarrow|nexists|Diamond|ruluhar|Implies|supmult|angzarr|suplarr|suphsub|questeq|because|digamma|Because|olcross|bemptyv|omicron|Omicron|rotimes|NoBreak|intprod|angrtvb|orderof|uwangle|suphsol|lesdoto|orslope|DownTee|realine|cudarrl|rdldhar|OverBar|supedot|lessdot|supdsub|topfork|succsim|rbrkslu|rbrksld|pertenk|cudarrr|isindot|planckh|lessgtr|pluscir|gesdoto|plussim|plustwo|lesssim|cularrp|rarrsim|Cayleys|notinva|notinvb|notinvc|UpArrow|Uparrow|uparrow|NotLess|dwangle|precsim|Product|curarrm|Cconint|dotplus|rarrbfs|ccupssm|Cedilla|cemptyv|notniva|quatint|frac35|frac38|frac45|frac56|frac58|frac78|tridot|xoplus|gacute|gammad|Gammad|lfisht|lfloor|bigcup|sqsupe|gbreve|Gbreve|lharul|sqsube|sqcups|Gcedil|apacir|llhard|lmidot|Lmidot|lmoust|andand|sqcaps|approx|Abreve|spades|circeq|tprime|divide|topcir|Assign|topbot|gesdot|divonx|xuplus|timesd|gesles|atilde|solbar|SOFTcy|loplus|timesb|lowast|lowbar|dlcorn|dlcrop|softcy|dollar|lparlt|thksim|lrhard|Atilde|lsaquo|smashp|bigvee|thinsp|wreath|bkarow|lsquor|lstrok|Lstrok|lthree|ltimes|ltlarr|DotDot|simdot|ltrPar|weierp|xsqcup|angmsd|sigmav|sigmaf|zeetrf|Zcaron|zcaron|mapsto|vsupne|thetav|cirmid|marker|mcomma|Zacute|vsubnE|there4|gtlPar|vsubne|bottom|gtrarr|SHCHcy|shchcy|midast|midcir|middot|minusb|minusd|gtrdot|bowtie|sfrown|mnplus|models|colone|seswar|Colone|mstpos|searhk|gtrsim|nacute|Nacute|boxbox|telrec|hairsp|Tcedil|nbumpe|scnsim|ncaron|Ncaron|ncedil|Ncedil|hamilt|Scedil|nearhk|hardcy|HARDcy|tcedil|Tcaron|commat|nequiv|nesear|tcaron|target|hearts|nexist|varrho|scedil|Scaron|scaron|hellip|Sacute|sacute|hercon|swnwar|compfn|rtimes|rthree|rsquor|rsaquo|zacute|wedgeq|homtht|barvee|barwed|Barwed|rpargt|horbar|conint|swarhk|roplus|nltrie|hslash|hstrok|Hstrok|rmoust|Conint|bprime|hybull|hyphen|iacute|Iacute|supsup|supsub|supsim|varphi|coprod|brvbar|agrave|Supset|supset|igrave|Igrave|notinE|Agrave|iiiint|iinfin|copysr|wedbar|Verbar|vangrt|becaus|incare|verbar|inodot|bullet|drcorn|intcal|drcrop|cularr|vellip|Utilde|bumpeq|cupcap|dstrok|Dstrok|CupCap|cupcup|cupdot|eacute|Eacute|supdot|iquest|easter|ecaron|Ecaron|ecolon|isinsv|utilde|itilde|Itilde|curarr|succeq|Bumpeq|cacute|ulcrop|nparsl|Cacute|nprcue|egrave|Egrave|nrarrc|nrarrw|subsup|subsub|nrtrie|jsercy|nsccue|Jsercy|kappav|kcedil|Kcedil|subsim|ulcorn|nsimeq|egsdot|veebar|kgreen|capand|elsdot|Subset|subset|curren|aacute|lacute|Lacute|emptyv|ntilde|Ntilde|lagran|lambda|Lambda|capcap|Ugrave|langle|subdot|emsp13|numero|emsp14|nvdash|nvDash|nVdash|nVDash|ugrave|ufisht|nvHarr|larrfs|nvlArr|larrhk|larrlp|larrpl|nvrArr|Udblac|nwarhk|larrtl|nwnear|oacute|Oacute|latail|lAtail|sstarf|lbrace|odblac|Odblac|lbrack|udblac|odsold|eparsl|lcaron|Lcaron|ograve|Ograve|lcedil|Lcedil|Aacute|ssmile|ssetmn|squarf|ldquor|capcup|ominus|cylcty|rharul|eqcirc|dagger|rfloor|rfisht|Dagger|daleth|equals|origof|capdot|equest|dcaron|Dcaron|rdquor|oslash|Oslash|otilde|Otilde|otimes|Otimes|urcrop|Ubreve|ubreve|Yacute|Uacute|uacute|Rcedil|rcedil|urcorn|parsim|Rcaron|Vdashl|rcaron|Tstrok|percnt|period|permil|Exists|yacute|rbrack|rbrace|phmmat|ccaron|Ccaron|planck|ccedil|plankv|tstrok|female|plusdo|plusdu|ffilig|plusmn|ffllig|Ccedil|rAtail|dfisht|bernou|ratail|Rarrtl|rarrtl|angsph|rarrpl|rarrlp|rarrhk|xwedge|xotime|forall|ForAll|Vvdash|vsupnE|preceq|bigcap|frac12|frac13|frac14|primes|rarrfs|prnsim|frac15|Square|frac16|square|lesdot|frac18|frac23|propto|prurel|rarrap|rangle|puncsp|frac25|Racute|qprime|racute|lesges|frac34|abreve|AElig|eqsim|utdot|setmn|urtri|Equal|Uring|seArr|uring|searr|dashv|Dashv|mumap|nabla|iogon|Iogon|sdote|sdotb|scsim|napid|napos|equiv|natur|Acirc|dblac|erarr|nbump|iprod|erDot|ucirc|awint|esdot|angrt|ncong|isinE|scnap|Scirc|scirc|ndash|isins|Ubrcy|nearr|neArr|isinv|nedot|ubrcy|acute|Ycirc|iukcy|Iukcy|xutri|nesim|caret|jcirc|Jcirc|caron|twixt|ddarr|sccue|exist|jmath|sbquo|ngeqq|angst|ccaps|lceil|ngsim|UpTee|delta|Delta|rtrif|nharr|nhArr|nhpar|rtrie|jukcy|Jukcy|kappa|rsquo|Kappa|nlarr|nlArr|TSHcy|rrarr|aogon|Aogon|fflig|xrarr|tshcy|ccirc|nleqq|filig|upsih|nless|dharl|nlsim|fjlig|ropar|nltri|dharr|robrk|roarr|fllig|fltns|roang|rnmid|subnE|subne|lAarr|trisb|Ccirc|acirc|ccups|blank|VDash|forkv|Vdash|langd|cedil|blk12|blk14|laquo|strns|diams|notin|vDash|larrb|blk34|block|disin|uplus|vdash|vBarv|aelig|starf|Wedge|check|xrArr|lates|lbarr|lBarr|notni|lbbrk|bcong|frasl|lbrke|frown|vrtri|vprop|vnsup|gamma|Gamma|wedge|xodot|bdquo|srarr|doteq|ldquo|boxdl|boxdL|gcirc|Gcirc|boxDl|boxDL|boxdr|boxdR|boxDr|TRADE|trade|rlhar|boxDR|vnsub|npart|vltri|rlarr|boxhd|boxhD|nprec|gescc|nrarr|nrArr|boxHd|boxHD|boxhu|boxhU|nrtri|boxHu|clubs|boxHU|times|colon|Colon|gimel|xlArr|Tilde|nsime|tilde|nsmid|nspar|THORN|thorn|xlarr|nsube|nsubE|thkap|xhArr|comma|nsucc|boxul|boxuL|nsupe|nsupE|gneqq|gnsim|boxUl|boxUL|grave|boxur|boxuR|boxUr|boxUR|lescc|angle|bepsi|boxvh|varpi|boxvH|numsp|Theta|gsime|gsiml|theta|boxVh|boxVH|boxvl|gtcir|gtdot|boxvL|boxVl|boxVL|crarr|cross|Cross|nvsim|boxvr|nwarr|nwArr|sqsup|dtdot|Uogon|lhard|lharu|dtrif|ocirc|Ocirc|lhblk|duarr|odash|sqsub|Hacek|sqcup|llarr|duhar|oelig|OElig|ofcir|boxvR|uogon|lltri|boxVr|csube|uuarr|ohbar|csupe|ctdot|olarr|olcir|harrw|oline|sqcap|omacr|Omacr|omega|Omega|boxVR|aleph|lneqq|lnsim|loang|loarr|rharu|lobrk|hcirc|operp|oplus|rhard|Hcirc|orarr|Union|order|ecirc|Ecirc|cuepr|szlig|cuesc|breve|reals|eDDot|Breve|hoarr|lopar|utrif|rdquo|Umacr|umacr|efDot|swArr|ultri|alpha|rceil|ovbar|swarr|Wcirc|wcirc|smtes|smile|bsemi|lrarr|aring|parsl|lrhar|bsime|uhblk|lrtri|cupor|Aring|uharr|uharl|slarr|rbrke|bsolb|lsime|rbbrk|RBarr|lsimg|phone|rBarr|rbarr|icirc|lsquo|Icirc|emacr|Emacr|ratio|simne|plusb|simlE|simgE|simeq|pluse|ltcir|ltdot|empty|xharr|xdtri|iexcl|Alpha|ltrie|rarrw|pound|ltrif|xcirc|bumpe|prcue|bumpE|asymp|amacr|cuvee|Sigma|sigma|iiint|udhar|iiota|ijlig|IJlig|supnE|imacr|Imacr|prime|Prime|image|prnap|eogon|Eogon|rarrc|mdash|mDDot|cuwed|imath|supne|imped|Amacr|udarr|prsim|micro|rarrb|cwint|raquo|infin|eplus|range|rangd|Ucirc|radic|minus|amalg|veeeq|rAarr|epsiv|ycirc|quest|sharp|quot|zwnj|Qscr|race|qscr|Qopf|qopf|qint|rang|Rang|Zscr|zscr|Zopf|zopf|rarr|rArr|Rarr|Pscr|pscr|prop|prod|prnE|prec|ZHcy|zhcy|prap|Zeta|zeta|Popf|popf|Zdot|plus|zdot|Yuml|yuml|phiv|YUcy|yucy|Yscr|yscr|perp|Yopf|yopf|part|para|YIcy|Ouml|rcub|yicy|YAcy|rdca|ouml|osol|Oscr|rdsh|yacy|real|oscr|xvee|andd|rect|andv|Xscr|oror|ordm|ordf|xscr|ange|aopf|Aopf|rHar|Xopf|opar|Oopf|xopf|xnis|rhov|oopf|omid|xmap|oint|apid|apos|ogon|ascr|Ascr|odot|odiv|xcup|xcap|ocir|oast|nvlt|nvle|nvgt|nvge|nvap|Wscr|wscr|auml|ntlg|ntgl|nsup|nsub|nsim|Nscr|nscr|nsce|Wopf|ring|npre|wopf|npar|Auml|Barv|bbrk|Nopf|nopf|nmid|nLtv|beta|ropf|Ropf|Beta|beth|nles|rpar|nleq|bnot|bNot|nldr|NJcy|rscr|Rscr|Vscr|vscr|rsqb|njcy|bopf|nisd|Bopf|rtri|Vopf|nGtv|ngtr|vopf|boxh|boxH|boxv|nges|ngeq|boxV|bscr|scap|Bscr|bsim|Vert|vert|bsol|bull|bump|caps|cdot|ncup|scnE|ncap|nbsp|napE|Cdot|cent|sdot|Vbar|nang|vBar|chcy|Mscr|mscr|sect|semi|CHcy|Mopf|mopf|sext|circ|cire|mldr|mlcp|cirE|comp|shcy|SHcy|vArr|varr|cong|copf|Copf|copy|COPY|malt|male|macr|lvnE|cscr|ltri|sime|ltcc|simg|Cscr|siml|csub|Uuml|lsqb|lsim|uuml|csup|Lscr|lscr|utri|smid|lpar|cups|smte|lozf|darr|Lopf|Uscr|solb|lopf|sopf|Sopf|lneq|uscr|spar|dArr|lnap|Darr|dash|Sqrt|LJcy|ljcy|lHar|dHar|Upsi|upsi|diam|lesg|djcy|DJcy|leqq|dopf|Dopf|dscr|Dscr|dscy|ldsh|ldca|squf|DScy|sscr|Sscr|dsol|lcub|late|star|Star|Uopf|Larr|lArr|larr|uopf|dtri|dzcy|sube|subE|Lang|lang|Kscr|kscr|Kopf|kopf|KJcy|kjcy|KHcy|khcy|DZcy|ecir|edot|eDot|Jscr|jscr|succ|Jopf|jopf|Edot|uHar|emsp|ensp|Iuml|iuml|eopf|isin|Iscr|iscr|Eopf|epar|sung|epsi|escr|sup1|sup2|sup3|Iota|iota|supe|supE|Iopf|iopf|IOcy|iocy|Escr|esim|Esim|imof|Uarr|QUOT|uArr|uarr|euml|IEcy|iecy|Idot|Euml|euro|excl|Hscr|hscr|Hopf|hopf|TScy|tscy|Tscr|hbar|tscr|flat|tbrk|fnof|hArr|harr|half|fopf|Fopf|tdot|gvnE|fork|trie|gtcc|fscr|Fscr|gdot|gsim|Gscr|gscr|Gopf|gopf|gneq|Gdot|tosa|gnap|Topf|topf|geqq|toea|GJcy|gjcy|tint|gesl|mid|Sfr|ggg|top|ges|gla|glE|glj|geq|gne|gEl|gel|gnE|Gcy|gcy|gap|Tfr|tfr|Tcy|tcy|Hat|Tau|Ffr|tau|Tab|hfr|Hfr|ffr|Fcy|fcy|icy|Icy|iff|ETH|eth|ifr|Ifr|Eta|eta|int|Int|Sup|sup|ucy|Ucy|Sum|sum|jcy|ENG|ufr|Ufr|eng|Jcy|jfr|els|ell|egs|Efr|efr|Jfr|uml|kcy|Kcy|Ecy|ecy|kfr|Kfr|lap|Sub|sub|lat|lcy|Lcy|leg|Dot|dot|lEg|leq|les|squ|div|die|lfr|Lfr|lgE|Dfr|dfr|Del|deg|Dcy|dcy|lne|lnE|sol|loz|smt|Cup|lrm|cup|lsh|Lsh|sim|shy|map|Map|mcy|Mcy|mfr|Mfr|mho|gfr|Gfr|sfr|cir|Chi|chi|nap|Cfr|vcy|Vcy|cfr|Scy|scy|ncy|Ncy|vee|Vee|Cap|cap|nfr|scE|sce|Nfr|nge|ngE|nGg|vfr|Vfr|ngt|bot|nGt|nis|niv|Rsh|rsh|nle|nlE|bne|Bfr|bfr|nLl|nlt|nLt|Bcy|bcy|not|Not|rlm|wfr|Wfr|npr|nsc|num|ocy|ast|Ocy|ofr|xfr|Xfr|Ofr|ogt|ohm|apE|olt|Rho|ape|rho|Rfr|rfr|ord|REG|ang|reg|orv|And|and|AMP|Rcy|amp|Afr|ycy|Ycy|yen|yfr|Yfr|rcy|par|pcy|Pcy|pfr|Pfr|phi|Phi|afr|Acy|acy|zcy|Zcy|piv|acE|acd|zfr|Zfr|pre|prE|psi|Psi|qfr|Qfr|zwj|Or|ge|Gg|gt|gg|el|oS|lt|Lt|LT|Re|lg|gl|eg|ne|Im|it|le|DD|wp|wr|nu|Nu|dd|lE|Sc|sc|pi|Pi|ee|af|ll|Ll|rx|gE|xi|pm|Xi|ic|pr|Pr|in|ni|mp|mu|ac|Mu|or|ap|Gt|GT|ii);|&(Aacute|Agrave|Atilde|Ccedil|Eacute|Egrave|Iacute|Igrave|Ntilde|Oacute|Ograve|Oslash|Otilde|Uacute|Ugrave|Yacute|aacute|agrave|atilde|brvbar|ccedil|curren|divide|eacute|egrave|frac12|frac14|frac34|iacute|igrave|iquest|middot|ntilde|oacute|ograve|oslash|otilde|plusmn|uacute|ugrave|yacute|AElig|Acirc|Aring|Ecirc|Icirc|Ocirc|THORN|Ucirc|acirc|acute|aelig|aring|cedil|ecirc|icirc|iexcl|laquo|micro|ocirc|pound|raquo|szlig|thorn|times|ucirc|Auml|COPY|Euml|Iuml|Ouml|QUOT|Uuml|auml|cent|copy|euml|iuml|macr|nbsp|ordf|ordm|ouml|para|quot|sect|sup1|sup2|sup3|uuml|yuml|AMP|ETH|REG|amp|deg|eth|not|reg|shy|uml|yen|GT|LT|gt|lt)(?!;)([=a-zA-Z0-9]?)|&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+)/g;
      var decodeMap = {
        aacute: '\xE1',
        Aacute: '\xC1',
        abreve: '\u0103',
        Abreve: '\u0102',
        ac: '\u223E',
        acd: '\u223F',
        acE: '\u223E\u0333',
        acirc: '\xE2',
        Acirc: '\xC2',
        acute: '\xB4',
        acy: '\u0430',
        Acy: '\u0410',
        aelig: '\xE6',
        AElig: '\xC6',
        af: '\u2061',
        afr: '\u{1D51E}',
        Afr: '\u{1D504}',
        agrave: '\xE0',
        Agrave: '\xC0',
        alefsym: '\u2135',
        aleph: '\u2135',
        alpha: '\u03B1',
        Alpha: '\u0391',
        amacr: '\u0101',
        Amacr: '\u0100',
        amalg: '\u2A3F',
        amp: '&',
        AMP: '&',
        and: '\u2227',
        And: '\u2A53',
        andand: '\u2A55',
        andd: '\u2A5C',
        andslope: '\u2A58',
        andv: '\u2A5A',
        ang: '\u2220',
        ange: '\u29A4',
        angle: '\u2220',
        angmsd: '\u2221',
        angmsdaa: '\u29A8',
        angmsdab: '\u29A9',
        angmsdac: '\u29AA',
        angmsdad: '\u29AB',
        angmsdae: '\u29AC',
        angmsdaf: '\u29AD',
        angmsdag: '\u29AE',
        angmsdah: '\u29AF',
        angrt: '\u221F',
        angrtvb: '\u22BE',
        angrtvbd: '\u299D',
        angsph: '\u2222',
        angst: '\xC5',
        angzarr: '\u237C',
        aogon: '\u0105',
        Aogon: '\u0104',
        aopf: '\u{1D552}',
        Aopf: '\u{1D538}',
        ap: '\u2248',
        apacir: '\u2A6F',
        ape: '\u224A',
        apE: '\u2A70',
        apid: '\u224B',
        apos: "'",
        ApplyFunction: '\u2061',
        approx: '\u2248',
        approxeq: '\u224A',
        aring: '\xE5',
        Aring: '\xC5',
        ascr: '\u{1D4B6}',
        Ascr: '\u{1D49C}',
        Assign: '\u2254',
        ast: '*',
        asymp: '\u2248',
        asympeq: '\u224D',
        atilde: '\xE3',
        Atilde: '\xC3',
        auml: '\xE4',
        Auml: '\xC4',
        awconint: '\u2233',
        awint: '\u2A11',
        backcong: '\u224C',
        backepsilon: '\u03F6',
        backprime: '\u2035',
        backsim: '\u223D',
        backsimeq: '\u22CD',
        Backslash: '\u2216',
        Barv: '\u2AE7',
        barvee: '\u22BD',
        barwed: '\u2305',
        Barwed: '\u2306',
        barwedge: '\u2305',
        bbrk: '\u23B5',
        bbrktbrk: '\u23B6',
        bcong: '\u224C',
        bcy: '\u0431',
        Bcy: '\u0411',
        bdquo: '\u201E',
        becaus: '\u2235',
        because: '\u2235',
        Because: '\u2235',
        bemptyv: '\u29B0',
        bepsi: '\u03F6',
        bernou: '\u212C',
        Bernoullis: '\u212C',
        beta: '\u03B2',
        Beta: '\u0392',
        beth: '\u2136',
        between: '\u226C',
        bfr: '\u{1D51F}',
        Bfr: '\u{1D505}',
        bigcap: '\u22C2',
        bigcirc: '\u25EF',
        bigcup: '\u22C3',
        bigodot: '\u2A00',
        bigoplus: '\u2A01',
        bigotimes: '\u2A02',
        bigsqcup: '\u2A06',
        bigstar: '\u2605',
        bigtriangledown: '\u25BD',
        bigtriangleup: '\u25B3',
        biguplus: '\u2A04',
        bigvee: '\u22C1',
        bigwedge: '\u22C0',
        bkarow: '\u290D',
        blacklozenge: '\u29EB',
        blacksquare: '\u25AA',
        blacktriangle: '\u25B4',
        blacktriangledown: '\u25BE',
        blacktriangleleft: '\u25C2',
        blacktriangleright: '\u25B8',
        blank: '\u2423',
        blk12: '\u2592',
        blk14: '\u2591',
        blk34: '\u2593',
        block: '\u2588',
        bne: '=\u20E5',
        bnequiv: '\u2261\u20E5',
        bnot: '\u2310',
        bNot: '\u2AED',
        bopf: '\u{1D553}',
        Bopf: '\u{1D539}',
        bot: '\u22A5',
        bottom: '\u22A5',
        bowtie: '\u22C8',
        boxbox: '\u29C9',
        boxdl: '\u2510',
        boxdL: '\u2555',
        boxDl: '\u2556',
        boxDL: '\u2557',
        boxdr: '\u250C',
        boxdR: '\u2552',
        boxDr: '\u2553',
        boxDR: '\u2554',
        boxh: '\u2500',
        boxH: '\u2550',
        boxhd: '\u252C',
        boxhD: '\u2565',
        boxHd: '\u2564',
        boxHD: '\u2566',
        boxhu: '\u2534',
        boxhU: '\u2568',
        boxHu: '\u2567',
        boxHU: '\u2569',
        boxminus: '\u229F',
        boxplus: '\u229E',
        boxtimes: '\u22A0',
        boxul: '\u2518',
        boxuL: '\u255B',
        boxUl: '\u255C',
        boxUL: '\u255D',
        boxur: '\u2514',
        boxuR: '\u2558',
        boxUr: '\u2559',
        boxUR: '\u255A',
        boxv: '\u2502',
        boxV: '\u2551',
        boxvh: '\u253C',
        boxvH: '\u256A',
        boxVh: '\u256B',
        boxVH: '\u256C',
        boxvl: '\u2524',
        boxvL: '\u2561',
        boxVl: '\u2562',
        boxVL: '\u2563',
        boxvr: '\u251C',
        boxvR: '\u255E',
        boxVr: '\u255F',
        boxVR: '\u2560',
        bprime: '\u2035',
        breve: '\u02D8',
        Breve: '\u02D8',
        brvbar: '\xA6',
        bscr: '\u{1D4B7}',
        Bscr: '\u212C',
        bsemi: '\u204F',
        bsim: '\u223D',
        bsime: '\u22CD',
        bsol: '\\',
        bsolb: '\u29C5',
        bsolhsub: '\u27C8',
        bull: '\u2022',
        bullet: '\u2022',
        bump: '\u224E',
        bumpe: '\u224F',
        bumpE: '\u2AAE',
        bumpeq: '\u224F',
        Bumpeq: '\u224E',
        cacute: '\u0107',
        Cacute: '\u0106',
        cap: '\u2229',
        Cap: '\u22D2',
        capand: '\u2A44',
        capbrcup: '\u2A49',
        capcap: '\u2A4B',
        capcup: '\u2A47',
        capdot: '\u2A40',
        CapitalDifferentialD: '\u2145',
        caps: '\u2229\uFE00',
        caret: '\u2041',
        caron: '\u02C7',
        Cayleys: '\u212D',
        ccaps: '\u2A4D',
        ccaron: '\u010D',
        Ccaron: '\u010C',
        ccedil: '\xE7',
        Ccedil: '\xC7',
        ccirc: '\u0109',
        Ccirc: '\u0108',
        Cconint: '\u2230',
        ccups: '\u2A4C',
        ccupssm: '\u2A50',
        cdot: '\u010B',
        Cdot: '\u010A',
        cedil: '\xB8',
        Cedilla: '\xB8',
        cemptyv: '\u29B2',
        cent: '\xA2',
        centerdot: '\xB7',
        CenterDot: '\xB7',
        cfr: '\u{1D520}',
        Cfr: '\u212D',
        chcy: '\u0447',
        CHcy: '\u0427',
        check: '\u2713',
        checkmark: '\u2713',
        chi: '\u03C7',
        Chi: '\u03A7',
        cir: '\u25CB',
        circ: '\u02C6',
        circeq: '\u2257',
        circlearrowleft: '\u21BA',
        circlearrowright: '\u21BB',
        circledast: '\u229B',
        circledcirc: '\u229A',
        circleddash: '\u229D',
        CircleDot: '\u2299',
        circledR: '\xAE',
        circledS: '\u24C8',
        CircleMinus: '\u2296',
        CirclePlus: '\u2295',
        CircleTimes: '\u2297',
        cire: '\u2257',
        cirE: '\u29C3',
        cirfnint: '\u2A10',
        cirmid: '\u2AEF',
        cirscir: '\u29C2',
        ClockwiseContourIntegral: '\u2232',
        CloseCurlyDoubleQuote: '\u201D',
        CloseCurlyQuote: '\u2019',
        clubs: '\u2663',
        clubsuit: '\u2663',
        colon: ':',
        Colon: '\u2237',
        colone: '\u2254',
        Colone: '\u2A74',
        coloneq: '\u2254',
        comma: ',',
        commat: '@',
        comp: '\u2201',
        compfn: '\u2218',
        complement: '\u2201',
        complexes: '\u2102',
        cong: '\u2245',
        congdot: '\u2A6D',
        Congruent: '\u2261',
        conint: '\u222E',
        Conint: '\u222F',
        ContourIntegral: '\u222E',
        copf: '\u{1D554}',
        Copf: '\u2102',
        coprod: '\u2210',
        Coproduct: '\u2210',
        copy: '\xA9',
        COPY: '\xA9',
        copysr: '\u2117',
        CounterClockwiseContourIntegral: '\u2233',
        crarr: '\u21B5',
        cross: '\u2717',
        Cross: '\u2A2F',
        cscr: '\u{1D4B8}',
        Cscr: '\u{1D49E}',
        csub: '\u2ACF',
        csube: '\u2AD1',
        csup: '\u2AD0',
        csupe: '\u2AD2',
        ctdot: '\u22EF',
        cudarrl: '\u2938',
        cudarrr: '\u2935',
        cuepr: '\u22DE',
        cuesc: '\u22DF',
        cularr: '\u21B6',
        cularrp: '\u293D',
        cup: '\u222A',
        Cup: '\u22D3',
        cupbrcap: '\u2A48',
        cupcap: '\u2A46',
        CupCap: '\u224D',
        cupcup: '\u2A4A',
        cupdot: '\u228D',
        cupor: '\u2A45',
        cups: '\u222A\uFE00',
        curarr: '\u21B7',
        curarrm: '\u293C',
        curlyeqprec: '\u22DE',
        curlyeqsucc: '\u22DF',
        curlyvee: '\u22CE',
        curlywedge: '\u22CF',
        curren: '\xA4',
        curvearrowleft: '\u21B6',
        curvearrowright: '\u21B7',
        cuvee: '\u22CE',
        cuwed: '\u22CF',
        cwconint: '\u2232',
        cwint: '\u2231',
        cylcty: '\u232D',
        dagger: '\u2020',
        Dagger: '\u2021',
        daleth: '\u2138',
        darr: '\u2193',
        dArr: '\u21D3',
        Darr: '\u21A1',
        dash: '\u2010',
        dashv: '\u22A3',
        Dashv: '\u2AE4',
        dbkarow: '\u290F',
        dblac: '\u02DD',
        dcaron: '\u010F',
        Dcaron: '\u010E',
        dcy: '\u0434',
        Dcy: '\u0414',
        dd: '\u2146',
        DD: '\u2145',
        ddagger: '\u2021',
        ddarr: '\u21CA',
        DDotrahd: '\u2911',
        ddotseq: '\u2A77',
        deg: '\xB0',
        Del: '\u2207',
        delta: '\u03B4',
        Delta: '\u0394',
        demptyv: '\u29B1',
        dfisht: '\u297F',
        dfr: '\u{1D521}',
        Dfr: '\u{1D507}',
        dHar: '\u2965',
        dharl: '\u21C3',
        dharr: '\u21C2',
        DiacriticalAcute: '\xB4',
        DiacriticalDot: '\u02D9',
        DiacriticalDoubleAcute: '\u02DD',
        DiacriticalGrave: '`',
        DiacriticalTilde: '\u02DC',
        diam: '\u22C4',
        diamond: '\u22C4',
        Diamond: '\u22C4',
        diamondsuit: '\u2666',
        diams: '\u2666',
        die: '\xA8',
        DifferentialD: '\u2146',
        digamma: '\u03DD',
        disin: '\u22F2',
        div: '\xF7',
        divide: '\xF7',
        divideontimes: '\u22C7',
        divonx: '\u22C7',
        djcy: '\u0452',
        DJcy: '\u0402',
        dlcorn: '\u231E',
        dlcrop: '\u230D',
        dollar: '$',
        dopf: '\u{1D555}',
        Dopf: '\u{1D53B}',
        dot: '\u02D9',
        Dot: '\xA8',
        DotDot: '\u20DC',
        doteq: '\u2250',
        doteqdot: '\u2251',
        DotEqual: '\u2250',
        dotminus: '\u2238',
        dotplus: '\u2214',
        dotsquare: '\u22A1',
        doublebarwedge: '\u2306',
        DoubleContourIntegral: '\u222F',
        DoubleDot: '\xA8',
        DoubleDownArrow: '\u21D3',
        DoubleLeftArrow: '\u21D0',
        DoubleLeftRightArrow: '\u21D4',
        DoubleLeftTee: '\u2AE4',
        DoubleLongLeftArrow: '\u27F8',
        DoubleLongLeftRightArrow: '\u27FA',
        DoubleLongRightArrow: '\u27F9',
        DoubleRightArrow: '\u21D2',
        DoubleRightTee: '\u22A8',
        DoubleUpArrow: '\u21D1',
        DoubleUpDownArrow: '\u21D5',
        DoubleVerticalBar: '\u2225',
        downarrow: '\u2193',
        Downarrow: '\u21D3',
        DownArrow: '\u2193',
        DownArrowBar: '\u2913',
        DownArrowUpArrow: '\u21F5',
        DownBreve: '\u0311',
        downdownarrows: '\u21CA',
        downharpoonleft: '\u21C3',
        downharpoonright: '\u21C2',
        DownLeftRightVector: '\u2950',
        DownLeftTeeVector: '\u295E',
        DownLeftVector: '\u21BD',
        DownLeftVectorBar: '\u2956',
        DownRightTeeVector: '\u295F',
        DownRightVector: '\u21C1',
        DownRightVectorBar: '\u2957',
        DownTee: '\u22A4',
        DownTeeArrow: '\u21A7',
        drbkarow: '\u2910',
        drcorn: '\u231F',
        drcrop: '\u230C',
        dscr: '\u{1D4B9}',
        Dscr: '\u{1D49F}',
        dscy: '\u0455',
        DScy: '\u0405',
        dsol: '\u29F6',
        dstrok: '\u0111',
        Dstrok: '\u0110',
        dtdot: '\u22F1',
        dtri: '\u25BF',
        dtrif: '\u25BE',
        duarr: '\u21F5',
        duhar: '\u296F',
        dwangle: '\u29A6',
        dzcy: '\u045F',
        DZcy: '\u040F',
        dzigrarr: '\u27FF',
        eacute: '\xE9',
        Eacute: '\xC9',
        easter: '\u2A6E',
        ecaron: '\u011B',
        Ecaron: '\u011A',
        ecir: '\u2256',
        ecirc: '\xEA',
        Ecirc: '\xCA',
        ecolon: '\u2255',
        ecy: '\u044D',
        Ecy: '\u042D',
        eDDot: '\u2A77',
        edot: '\u0117',
        eDot: '\u2251',
        Edot: '\u0116',
        ee: '\u2147',
        efDot: '\u2252',
        efr: '\u{1D522}',
        Efr: '\u{1D508}',
        eg: '\u2A9A',
        egrave: '\xE8',
        Egrave: '\xC8',
        egs: '\u2A96',
        egsdot: '\u2A98',
        el: '\u2A99',
        Element: '\u2208',
        elinters: '\u23E7',
        ell: '\u2113',
        els: '\u2A95',
        elsdot: '\u2A97',
        emacr: '\u0113',
        Emacr: '\u0112',
        empty: '\u2205',
        emptyset: '\u2205',
        EmptySmallSquare: '\u25FB',
        emptyv: '\u2205',
        EmptyVerySmallSquare: '\u25AB',
        emsp: '\u2003',
        emsp13: '\u2004',
        emsp14: '\u2005',
        eng: '\u014B',
        ENG: '\u014A',
        ensp: '\u2002',
        eogon: '\u0119',
        Eogon: '\u0118',
        eopf: '\u{1D556}',
        Eopf: '\u{1D53C}',
        epar: '\u22D5',
        eparsl: '\u29E3',
        eplus: '\u2A71',
        epsi: '\u03B5',
        epsilon: '\u03B5',
        Epsilon: '\u0395',
        epsiv: '\u03F5',
        eqcirc: '\u2256',
        eqcolon: '\u2255',
        eqsim: '\u2242',
        eqslantgtr: '\u2A96',
        eqslantless: '\u2A95',
        Equal: '\u2A75',
        equals: '=',
        EqualTilde: '\u2242',
        equest: '\u225F',
        Equilibrium: '\u21CC',
        equiv: '\u2261',
        equivDD: '\u2A78',
        eqvparsl: '\u29E5',
        erarr: '\u2971',
        erDot: '\u2253',
        escr: '\u212F',
        Escr: '\u2130',
        esdot: '\u2250',
        esim: '\u2242',
        Esim: '\u2A73',
        eta: '\u03B7',
        Eta: '\u0397',
        eth: '\xF0',
        ETH: '\xD0',
        euml: '\xEB',
        Euml: '\xCB',
        euro: '\u20AC',
        excl: '!',
        exist: '\u2203',
        Exists: '\u2203',
        expectation: '\u2130',
        exponentiale: '\u2147',
        ExponentialE: '\u2147',
        fallingdotseq: '\u2252',
        fcy: '\u0444',
        Fcy: '\u0424',
        female: '\u2640',
        ffilig: '\uFB03',
        fflig: '\uFB00',
        ffllig: '\uFB04',
        ffr: '\u{1D523}',
        Ffr: '\u{1D509}',
        filig: '\uFB01',
        FilledSmallSquare: '\u25FC',
        FilledVerySmallSquare: '\u25AA',
        fjlig: 'fj',
        flat: '\u266D',
        fllig: '\uFB02',
        fltns: '\u25B1',
        fnof: '\u0192',
        fopf: '\u{1D557}',
        Fopf: '\u{1D53D}',
        forall: '\u2200',
        ForAll: '\u2200',
        fork: '\u22D4',
        forkv: '\u2AD9',
        Fouriertrf: '\u2131',
        fpartint: '\u2A0D',
        frac12: '\xBD',
        frac13: '\u2153',
        frac14: '\xBC',
        frac15: '\u2155',
        frac16: '\u2159',
        frac18: '\u215B',
        frac23: '\u2154',
        frac25: '\u2156',
        frac34: '\xBE',
        frac35: '\u2157',
        frac38: '\u215C',
        frac45: '\u2158',
        frac56: '\u215A',
        frac58: '\u215D',
        frac78: '\u215E',
        frasl: '\u2044',
        frown: '\u2322',
        fscr: '\u{1D4BB}',
        Fscr: '\u2131',
        gacute: '\u01F5',
        gamma: '\u03B3',
        Gamma: '\u0393',
        gammad: '\u03DD',
        Gammad: '\u03DC',
        gap: '\u2A86',
        gbreve: '\u011F',
        Gbreve: '\u011E',
        Gcedil: '\u0122',
        gcirc: '\u011D',
        Gcirc: '\u011C',
        gcy: '\u0433',
        Gcy: '\u0413',
        gdot: '\u0121',
        Gdot: '\u0120',
        ge: '\u2265',
        gE: '\u2267',
        gel: '\u22DB',
        gEl: '\u2A8C',
        geq: '\u2265',
        geqq: '\u2267',
        geqslant: '\u2A7E',
        ges: '\u2A7E',
        gescc: '\u2AA9',
        gesdot: '\u2A80',
        gesdoto: '\u2A82',
        gesdotol: '\u2A84',
        gesl: '\u22DB\uFE00',
        gesles: '\u2A94',
        gfr: '\u{1D524}',
        Gfr: '\u{1D50A}',
        gg: '\u226B',
        Gg: '\u22D9',
        ggg: '\u22D9',
        gimel: '\u2137',
        gjcy: '\u0453',
        GJcy: '\u0403',
        gl: '\u2277',
        gla: '\u2AA5',
        glE: '\u2A92',
        glj: '\u2AA4',
        gnap: '\u2A8A',
        gnapprox: '\u2A8A',
        gne: '\u2A88',
        gnE: '\u2269',
        gneq: '\u2A88',
        gneqq: '\u2269',
        gnsim: '\u22E7',
        gopf: '\u{1D558}',
        Gopf: '\u{1D53E}',
        grave: '`',
        GreaterEqual: '\u2265',
        GreaterEqualLess: '\u22DB',
        GreaterFullEqual: '\u2267',
        GreaterGreater: '\u2AA2',
        GreaterLess: '\u2277',
        GreaterSlantEqual: '\u2A7E',
        GreaterTilde: '\u2273',
        gscr: '\u210A',
        Gscr: '\u{1D4A2}',
        gsim: '\u2273',
        gsime: '\u2A8E',
        gsiml: '\u2A90',
        gt: '>',
        Gt: '\u226B',
        GT: '>',
        gtcc: '\u2AA7',
        gtcir: '\u2A7A',
        gtdot: '\u22D7',
        gtlPar: '\u2995',
        gtquest: '\u2A7C',
        gtrapprox: '\u2A86',
        gtrarr: '\u2978',
        gtrdot: '\u22D7',
        gtreqless: '\u22DB',
        gtreqqless: '\u2A8C',
        gtrless: '\u2277',
        gtrsim: '\u2273',
        gvertneqq: '\u2269\uFE00',
        gvnE: '\u2269\uFE00',
        Hacek: '\u02C7',
        hairsp: '\u200A',
        half: '\xBD',
        hamilt: '\u210B',
        hardcy: '\u044A',
        HARDcy: '\u042A',
        harr: '\u2194',
        hArr: '\u21D4',
        harrcir: '\u2948',
        harrw: '\u21AD',
        Hat: '^',
        hbar: '\u210F',
        hcirc: '\u0125',
        Hcirc: '\u0124',
        hearts: '\u2665',
        heartsuit: '\u2665',
        hellip: '\u2026',
        hercon: '\u22B9',
        hfr: '\u{1D525}',
        Hfr: '\u210C',
        HilbertSpace: '\u210B',
        hksearow: '\u2925',
        hkswarow: '\u2926',
        hoarr: '\u21FF',
        homtht: '\u223B',
        hookleftarrow: '\u21A9',
        hookrightarrow: '\u21AA',
        hopf: '\u{1D559}',
        Hopf: '\u210D',
        horbar: '\u2015',
        HorizontalLine: '\u2500',
        hscr: '\u{1D4BD}',
        Hscr: '\u210B',
        hslash: '\u210F',
        hstrok: '\u0127',
        Hstrok: '\u0126',
        HumpDownHump: '\u224E',
        HumpEqual: '\u224F',
        hybull: '\u2043',
        hyphen: '\u2010',
        iacute: '\xED',
        Iacute: '\xCD',
        ic: '\u2063',
        icirc: '\xEE',
        Icirc: '\xCE',
        icy: '\u0438',
        Icy: '\u0418',
        Idot: '\u0130',
        iecy: '\u0435',
        IEcy: '\u0415',
        iexcl: '\xA1',
        iff: '\u21D4',
        ifr: '\u{1D526}',
        Ifr: '\u2111',
        igrave: '\xEC',
        Igrave: '\xCC',
        ii: '\u2148',
        iiiint: '\u2A0C',
        iiint: '\u222D',
        iinfin: '\u29DC',
        iiota: '\u2129',
        ijlig: '\u0133',
        IJlig: '\u0132',
        Im: '\u2111',
        imacr: '\u012B',
        Imacr: '\u012A',
        image: '\u2111',
        ImaginaryI: '\u2148',
        imagline: '\u2110',
        imagpart: '\u2111',
        imath: '\u0131',
        imof: '\u22B7',
        imped: '\u01B5',
        Implies: '\u21D2',
        in: '\u2208',
        incare: '\u2105',
        infin: '\u221E',
        infintie: '\u29DD',
        inodot: '\u0131',
        int: '\u222B',
        Int: '\u222C',
        intcal: '\u22BA',
        integers: '\u2124',
        Integral: '\u222B',
        intercal: '\u22BA',
        Intersection: '\u22C2',
        intlarhk: '\u2A17',
        intprod: '\u2A3C',
        InvisibleComma: '\u2063',
        InvisibleTimes: '\u2062',
        iocy: '\u0451',
        IOcy: '\u0401',
        iogon: '\u012F',
        Iogon: '\u012E',
        iopf: '\u{1D55A}',
        Iopf: '\u{1D540}',
        iota: '\u03B9',
        Iota: '\u0399',
        iprod: '\u2A3C',
        iquest: '\xBF',
        iscr: '\u{1D4BE}',
        Iscr: '\u2110',
        isin: '\u2208',
        isindot: '\u22F5',
        isinE: '\u22F9',
        isins: '\u22F4',
        isinsv: '\u22F3',
        isinv: '\u2208',
        it: '\u2062',
        itilde: '\u0129',
        Itilde: '\u0128',
        iukcy: '\u0456',
        Iukcy: '\u0406',
        iuml: '\xEF',
        Iuml: '\xCF',
        jcirc: '\u0135',
        Jcirc: '\u0134',
        jcy: '\u0439',
        Jcy: '\u0419',
        jfr: '\u{1D527}',
        Jfr: '\u{1D50D}',
        jmath: '\u0237',
        jopf: '\u{1D55B}',
        Jopf: '\u{1D541}',
        jscr: '\u{1D4BF}',
        Jscr: '\u{1D4A5}',
        jsercy: '\u0458',
        Jsercy: '\u0408',
        jukcy: '\u0454',
        Jukcy: '\u0404',
        kappa: '\u03BA',
        Kappa: '\u039A',
        kappav: '\u03F0',
        kcedil: '\u0137',
        Kcedil: '\u0136',
        kcy: '\u043A',
        Kcy: '\u041A',
        kfr: '\u{1D528}',
        Kfr: '\u{1D50E}',
        kgreen: '\u0138',
        khcy: '\u0445',
        KHcy: '\u0425',
        kjcy: '\u045C',
        KJcy: '\u040C',
        kopf: '\u{1D55C}',
        Kopf: '\u{1D542}',
        kscr: '\u{1D4C0}',
        Kscr: '\u{1D4A6}',
        lAarr: '\u21DA',
        lacute: '\u013A',
        Lacute: '\u0139',
        laemptyv: '\u29B4',
        lagran: '\u2112',
        lambda: '\u03BB',
        Lambda: '\u039B',
        lang: '\u27E8',
        Lang: '\u27EA',
        langd: '\u2991',
        langle: '\u27E8',
        lap: '\u2A85',
        Laplacetrf: '\u2112',
        laquo: '\xAB',
        larr: '\u2190',
        lArr: '\u21D0',
        Larr: '\u219E',
        larrb: '\u21E4',
        larrbfs: '\u291F',
        larrfs: '\u291D',
        larrhk: '\u21A9',
        larrlp: '\u21AB',
        larrpl: '\u2939',
        larrsim: '\u2973',
        larrtl: '\u21A2',
        lat: '\u2AAB',
        latail: '\u2919',
        lAtail: '\u291B',
        late: '\u2AAD',
        lates: '\u2AAD\uFE00',
        lbarr: '\u290C',
        lBarr: '\u290E',
        lbbrk: '\u2772',
        lbrace: '{',
        lbrack: '[',
        lbrke: '\u298B',
        lbrksld: '\u298F',
        lbrkslu: '\u298D',
        lcaron: '\u013E',
        Lcaron: '\u013D',
        lcedil: '\u013C',
        Lcedil: '\u013B',
        lceil: '\u2308',
        lcub: '{',
        lcy: '\u043B',
        Lcy: '\u041B',
        ldca: '\u2936',
        ldquo: '\u201C',
        ldquor: '\u201E',
        ldrdhar: '\u2967',
        ldrushar: '\u294B',
        ldsh: '\u21B2',
        le: '\u2264',
        lE: '\u2266',
        LeftAngleBracket: '\u27E8',
        leftarrow: '\u2190',
        Leftarrow: '\u21D0',
        LeftArrow: '\u2190',
        LeftArrowBar: '\u21E4',
        LeftArrowRightArrow: '\u21C6',
        leftarrowtail: '\u21A2',
        LeftCeiling: '\u2308',
        LeftDoubleBracket: '\u27E6',
        LeftDownTeeVector: '\u2961',
        LeftDownVector: '\u21C3',
        LeftDownVectorBar: '\u2959',
        LeftFloor: '\u230A',
        leftharpoondown: '\u21BD',
        leftharpoonup: '\u21BC',
        leftleftarrows: '\u21C7',
        leftrightarrow: '\u2194',
        Leftrightarrow: '\u21D4',
        LeftRightArrow: '\u2194',
        leftrightarrows: '\u21C6',
        leftrightharpoons: '\u21CB',
        leftrightsquigarrow: '\u21AD',
        LeftRightVector: '\u294E',
        LeftTee: '\u22A3',
        LeftTeeArrow: '\u21A4',
        LeftTeeVector: '\u295A',
        leftthreetimes: '\u22CB',
        LeftTriangle: '\u22B2',
        LeftTriangleBar: '\u29CF',
        LeftTriangleEqual: '\u22B4',
        LeftUpDownVector: '\u2951',
        LeftUpTeeVector: '\u2960',
        LeftUpVector: '\u21BF',
        LeftUpVectorBar: '\u2958',
        LeftVector: '\u21BC',
        LeftVectorBar: '\u2952',
        leg: '\u22DA',
        lEg: '\u2A8B',
        leq: '\u2264',
        leqq: '\u2266',
        leqslant: '\u2A7D',
        les: '\u2A7D',
        lescc: '\u2AA8',
        lesdot: '\u2A7F',
        lesdoto: '\u2A81',
        lesdotor: '\u2A83',
        lesg: '\u22DA\uFE00',
        lesges: '\u2A93',
        lessapprox: '\u2A85',
        lessdot: '\u22D6',
        lesseqgtr: '\u22DA',
        lesseqqgtr: '\u2A8B',
        LessEqualGreater: '\u22DA',
        LessFullEqual: '\u2266',
        LessGreater: '\u2276',
        lessgtr: '\u2276',
        LessLess: '\u2AA1',
        lesssim: '\u2272',
        LessSlantEqual: '\u2A7D',
        LessTilde: '\u2272',
        lfisht: '\u297C',
        lfloor: '\u230A',
        lfr: '\u{1D529}',
        Lfr: '\u{1D50F}',
        lg: '\u2276',
        lgE: '\u2A91',
        lHar: '\u2962',
        lhard: '\u21BD',
        lharu: '\u21BC',
        lharul: '\u296A',
        lhblk: '\u2584',
        ljcy: '\u0459',
        LJcy: '\u0409',
        ll: '\u226A',
        Ll: '\u22D8',
        llarr: '\u21C7',
        llcorner: '\u231E',
        Lleftarrow: '\u21DA',
        llhard: '\u296B',
        lltri: '\u25FA',
        lmidot: '\u0140',
        Lmidot: '\u013F',
        lmoust: '\u23B0',
        lmoustache: '\u23B0',
        lnap: '\u2A89',
        lnapprox: '\u2A89',
        lne: '\u2A87',
        lnE: '\u2268',
        lneq: '\u2A87',
        lneqq: '\u2268',
        lnsim: '\u22E6',
        loang: '\u27EC',
        loarr: '\u21FD',
        lobrk: '\u27E6',
        longleftarrow: '\u27F5',
        Longleftarrow: '\u27F8',
        LongLeftArrow: '\u27F5',
        longleftrightarrow: '\u27F7',
        Longleftrightarrow: '\u27FA',
        LongLeftRightArrow: '\u27F7',
        longmapsto: '\u27FC',
        longrightarrow: '\u27F6',
        Longrightarrow: '\u27F9',
        LongRightArrow: '\u27F6',
        looparrowleft: '\u21AB',
        looparrowright: '\u21AC',
        lopar: '\u2985',
        lopf: '\u{1D55D}',
        Lopf: '\u{1D543}',
        loplus: '\u2A2D',
        lotimes: '\u2A34',
        lowast: '\u2217',
        lowbar: '_',
        LowerLeftArrow: '\u2199',
        LowerRightArrow: '\u2198',
        loz: '\u25CA',
        lozenge: '\u25CA',
        lozf: '\u29EB',
        lpar: '(',
        lparlt: '\u2993',
        lrarr: '\u21C6',
        lrcorner: '\u231F',
        lrhar: '\u21CB',
        lrhard: '\u296D',
        lrm: '\u200E',
        lrtri: '\u22BF',
        lsaquo: '\u2039',
        lscr: '\u{1D4C1}',
        Lscr: '\u2112',
        lsh: '\u21B0',
        Lsh: '\u21B0',
        lsim: '\u2272',
        lsime: '\u2A8D',
        lsimg: '\u2A8F',
        lsqb: '[',
        lsquo: '\u2018',
        lsquor: '\u201A',
        lstrok: '\u0142',
        Lstrok: '\u0141',
        lt: '<',
        Lt: '\u226A',
        LT: '<',
        ltcc: '\u2AA6',
        ltcir: '\u2A79',
        ltdot: '\u22D6',
        lthree: '\u22CB',
        ltimes: '\u22C9',
        ltlarr: '\u2976',
        ltquest: '\u2A7B',
        ltri: '\u25C3',
        ltrie: '\u22B4',
        ltrif: '\u25C2',
        ltrPar: '\u2996',
        lurdshar: '\u294A',
        luruhar: '\u2966',
        lvertneqq: '\u2268\uFE00',
        lvnE: '\u2268\uFE00',
        macr: '\xAF',
        male: '\u2642',
        malt: '\u2720',
        maltese: '\u2720',
        map: '\u21A6',
        Map: '\u2905',
        mapsto: '\u21A6',
        mapstodown: '\u21A7',
        mapstoleft: '\u21A4',
        mapstoup: '\u21A5',
        marker: '\u25AE',
        mcomma: '\u2A29',
        mcy: '\u043C',
        Mcy: '\u041C',
        mdash: '\u2014',
        mDDot: '\u223A',
        measuredangle: '\u2221',
        MediumSpace: '\u205F',
        Mellintrf: '\u2133',
        mfr: '\u{1D52A}',
        Mfr: '\u{1D510}',
        mho: '\u2127',
        micro: '\xB5',
        mid: '\u2223',
        midast: '*',
        midcir: '\u2AF0',
        middot: '\xB7',
        minus: '\u2212',
        minusb: '\u229F',
        minusd: '\u2238',
        minusdu: '\u2A2A',
        MinusPlus: '\u2213',
        mlcp: '\u2ADB',
        mldr: '\u2026',
        mnplus: '\u2213',
        models: '\u22A7',
        mopf: '\u{1D55E}',
        Mopf: '\u{1D544}',
        mp: '\u2213',
        mscr: '\u{1D4C2}',
        Mscr: '\u2133',
        mstpos: '\u223E',
        mu: '\u03BC',
        Mu: '\u039C',
        multimap: '\u22B8',
        mumap: '\u22B8',
        nabla: '\u2207',
        nacute: '\u0144',
        Nacute: '\u0143',
        nang: '\u2220\u20D2',
        nap: '\u2249',
        napE: '\u2A70\u0338',
        napid: '\u224B\u0338',
        napos: '\u0149',
        napprox: '\u2249',
        natur: '\u266E',
        natural: '\u266E',
        naturals: '\u2115',
        nbsp: '\xA0',
        nbump: '\u224E\u0338',
        nbumpe: '\u224F\u0338',
        ncap: '\u2A43',
        ncaron: '\u0148',
        Ncaron: '\u0147',
        ncedil: '\u0146',
        Ncedil: '\u0145',
        ncong: '\u2247',
        ncongdot: '\u2A6D\u0338',
        ncup: '\u2A42',
        ncy: '\u043D',
        Ncy: '\u041D',
        ndash: '\u2013',
        ne: '\u2260',
        nearhk: '\u2924',
        nearr: '\u2197',
        neArr: '\u21D7',
        nearrow: '\u2197',
        nedot: '\u2250\u0338',
        NegativeMediumSpace: '\u200B',
        NegativeThickSpace: '\u200B',
        NegativeThinSpace: '\u200B',
        NegativeVeryThinSpace: '\u200B',
        nequiv: '\u2262',
        nesear: '\u2928',
        nesim: '\u2242\u0338',
        NestedGreaterGreater: '\u226B',
        NestedLessLess: '\u226A',
        NewLine: '\n',
        nexist: '\u2204',
        nexists: '\u2204',
        nfr: '\u{1D52B}',
        Nfr: '\u{1D511}',
        nge: '\u2271',
        ngE: '\u2267\u0338',
        ngeq: '\u2271',
        ngeqq: '\u2267\u0338',
        ngeqslant: '\u2A7E\u0338',
        nges: '\u2A7E\u0338',
        nGg: '\u22D9\u0338',
        ngsim: '\u2275',
        ngt: '\u226F',
        nGt: '\u226B\u20D2',
        ngtr: '\u226F',
        nGtv: '\u226B\u0338',
        nharr: '\u21AE',
        nhArr: '\u21CE',
        nhpar: '\u2AF2',
        ni: '\u220B',
        nis: '\u22FC',
        nisd: '\u22FA',
        niv: '\u220B',
        njcy: '\u045A',
        NJcy: '\u040A',
        nlarr: '\u219A',
        nlArr: '\u21CD',
        nldr: '\u2025',
        nle: '\u2270',
        nlE: '\u2266\u0338',
        nleftarrow: '\u219A',
        nLeftarrow: '\u21CD',
        nleftrightarrow: '\u21AE',
        nLeftrightarrow: '\u21CE',
        nleq: '\u2270',
        nleqq: '\u2266\u0338',
        nleqslant: '\u2A7D\u0338',
        nles: '\u2A7D\u0338',
        nless: '\u226E',
        nLl: '\u22D8\u0338',
        nlsim: '\u2274',
        nlt: '\u226E',
        nLt: '\u226A\u20D2',
        nltri: '\u22EA',
        nltrie: '\u22EC',
        nLtv: '\u226A\u0338',
        nmid: '\u2224',
        NoBreak: '\u2060',
        NonBreakingSpace: '\xA0',
        nopf: '\u{1D55F}',
        Nopf: '\u2115',
        not: '\xAC',
        Not: '\u2AEC',
        NotCongruent: '\u2262',
        NotCupCap: '\u226D',
        NotDoubleVerticalBar: '\u2226',
        NotElement: '\u2209',
        NotEqual: '\u2260',
        NotEqualTilde: '\u2242\u0338',
        NotExists: '\u2204',
        NotGreater: '\u226F',
        NotGreaterEqual: '\u2271',
        NotGreaterFullEqual: '\u2267\u0338',
        NotGreaterGreater: '\u226B\u0338',
        NotGreaterLess: '\u2279',
        NotGreaterSlantEqual: '\u2A7E\u0338',
        NotGreaterTilde: '\u2275',
        NotHumpDownHump: '\u224E\u0338',
        NotHumpEqual: '\u224F\u0338',
        notin: '\u2209',
        notindot: '\u22F5\u0338',
        notinE: '\u22F9\u0338',
        notinva: '\u2209',
        notinvb: '\u22F7',
        notinvc: '\u22F6',
        NotLeftTriangle: '\u22EA',
        NotLeftTriangleBar: '\u29CF\u0338',
        NotLeftTriangleEqual: '\u22EC',
        NotLess: '\u226E',
        NotLessEqual: '\u2270',
        NotLessGreater: '\u2278',
        NotLessLess: '\u226A\u0338',
        NotLessSlantEqual: '\u2A7D\u0338',
        NotLessTilde: '\u2274',
        NotNestedGreaterGreater: '\u2AA2\u0338',
        NotNestedLessLess: '\u2AA1\u0338',
        notni: '\u220C',
        notniva: '\u220C',
        notnivb: '\u22FE',
        notnivc: '\u22FD',
        NotPrecedes: '\u2280',
        NotPrecedesEqual: '\u2AAF\u0338',
        NotPrecedesSlantEqual: '\u22E0',
        NotReverseElement: '\u220C',
        NotRightTriangle: '\u22EB',
        NotRightTriangleBar: '\u29D0\u0338',
        NotRightTriangleEqual: '\u22ED',
        NotSquareSubset: '\u228F\u0338',
        NotSquareSubsetEqual: '\u22E2',
        NotSquareSuperset: '\u2290\u0338',
        NotSquareSupersetEqual: '\u22E3',
        NotSubset: '\u2282\u20D2',
        NotSubsetEqual: '\u2288',
        NotSucceeds: '\u2281',
        NotSucceedsEqual: '\u2AB0\u0338',
        NotSucceedsSlantEqual: '\u22E1',
        NotSucceedsTilde: '\u227F\u0338',
        NotSuperset: '\u2283\u20D2',
        NotSupersetEqual: '\u2289',
        NotTilde: '\u2241',
        NotTildeEqual: '\u2244',
        NotTildeFullEqual: '\u2247',
        NotTildeTilde: '\u2249',
        NotVerticalBar: '\u2224',
        npar: '\u2226',
        nparallel: '\u2226',
        nparsl: '\u2AFD\u20E5',
        npart: '\u2202\u0338',
        npolint: '\u2A14',
        npr: '\u2280',
        nprcue: '\u22E0',
        npre: '\u2AAF\u0338',
        nprec: '\u2280',
        npreceq: '\u2AAF\u0338',
        nrarr: '\u219B',
        nrArr: '\u21CF',
        nrarrc: '\u2933\u0338',
        nrarrw: '\u219D\u0338',
        nrightarrow: '\u219B',
        nRightarrow: '\u21CF',
        nrtri: '\u22EB',
        nrtrie: '\u22ED',
        nsc: '\u2281',
        nsccue: '\u22E1',
        nsce: '\u2AB0\u0338',
        nscr: '\u{1D4C3}',
        Nscr: '\u{1D4A9}',
        nshortmid: '\u2224',
        nshortparallel: '\u2226',
        nsim: '\u2241',
        nsime: '\u2244',
        nsimeq: '\u2244',
        nsmid: '\u2224',
        nspar: '\u2226',
        nsqsube: '\u22E2',
        nsqsupe: '\u22E3',
        nsub: '\u2284',
        nsube: '\u2288',
        nsubE: '\u2AC5\u0338',
        nsubset: '\u2282\u20D2',
        nsubseteq: '\u2288',
        nsubseteqq: '\u2AC5\u0338',
        nsucc: '\u2281',
        nsucceq: '\u2AB0\u0338',
        nsup: '\u2285',
        nsupe: '\u2289',
        nsupE: '\u2AC6\u0338',
        nsupset: '\u2283\u20D2',
        nsupseteq: '\u2289',
        nsupseteqq: '\u2AC6\u0338',
        ntgl: '\u2279',
        ntilde: '\xF1',
        Ntilde: '\xD1',
        ntlg: '\u2278',
        ntriangleleft: '\u22EA',
        ntrianglelefteq: '\u22EC',
        ntriangleright: '\u22EB',
        ntrianglerighteq: '\u22ED',
        nu: '\u03BD',
        Nu: '\u039D',
        num: '#',
        numero: '\u2116',
        numsp: '\u2007',
        nvap: '\u224D\u20D2',
        nvdash: '\u22AC',
        nvDash: '\u22AD',
        nVdash: '\u22AE',
        nVDash: '\u22AF',
        nvge: '\u2265\u20D2',
        nvgt: '>\u20D2',
        nvHarr: '\u2904',
        nvinfin: '\u29DE',
        nvlArr: '\u2902',
        nvle: '\u2264\u20D2',
        nvlt: '<\u20D2',
        nvltrie: '\u22B4\u20D2',
        nvrArr: '\u2903',
        nvrtrie: '\u22B5\u20D2',
        nvsim: '\u223C\u20D2',
        nwarhk: '\u2923',
        nwarr: '\u2196',
        nwArr: '\u21D6',
        nwarrow: '\u2196',
        nwnear: '\u2927',
        oacute: '\xF3',
        Oacute: '\xD3',
        oast: '\u229B',
        ocir: '\u229A',
        ocirc: '\xF4',
        Ocirc: '\xD4',
        ocy: '\u043E',
        Ocy: '\u041E',
        odash: '\u229D',
        odblac: '\u0151',
        Odblac: '\u0150',
        odiv: '\u2A38',
        odot: '\u2299',
        odsold: '\u29BC',
        oelig: '\u0153',
        OElig: '\u0152',
        ofcir: '\u29BF',
        ofr: '\u{1D52C}',
        Ofr: '\u{1D512}',
        ogon: '\u02DB',
        ograve: '\xF2',
        Ograve: '\xD2',
        ogt: '\u29C1',
        ohbar: '\u29B5',
        ohm: '\u03A9',
        oint: '\u222E',
        olarr: '\u21BA',
        olcir: '\u29BE',
        olcross: '\u29BB',
        oline: '\u203E',
        olt: '\u29C0',
        omacr: '\u014D',
        Omacr: '\u014C',
        omega: '\u03C9',
        Omega: '\u03A9',
        omicron: '\u03BF',
        Omicron: '\u039F',
        omid: '\u29B6',
        ominus: '\u2296',
        oopf: '\u{1D560}',
        Oopf: '\u{1D546}',
        opar: '\u29B7',
        OpenCurlyDoubleQuote: '\u201C',
        OpenCurlyQuote: '\u2018',
        operp: '\u29B9',
        oplus: '\u2295',
        or: '\u2228',
        Or: '\u2A54',
        orarr: '\u21BB',
        ord: '\u2A5D',
        order: '\u2134',
        orderof: '\u2134',
        ordf: '\xAA',
        ordm: '\xBA',
        origof: '\u22B6',
        oror: '\u2A56',
        orslope: '\u2A57',
        orv: '\u2A5B',
        oS: '\u24C8',
        oscr: '\u2134',
        Oscr: '\u{1D4AA}',
        oslash: '\xF8',
        Oslash: '\xD8',
        osol: '\u2298',
        otilde: '\xF5',
        Otilde: '\xD5',
        otimes: '\u2297',
        Otimes: '\u2A37',
        otimesas: '\u2A36',
        ouml: '\xF6',
        Ouml: '\xD6',
        ovbar: '\u233D',
        OverBar: '\u203E',
        OverBrace: '\u23DE',
        OverBracket: '\u23B4',
        OverParenthesis: '\u23DC',
        par: '\u2225',
        para: '\xB6',
        parallel: '\u2225',
        parsim: '\u2AF3',
        parsl: '\u2AFD',
        part: '\u2202',
        PartialD: '\u2202',
        pcy: '\u043F',
        Pcy: '\u041F',
        percnt: '%',
        period: '.',
        permil: '\u2030',
        perp: '\u22A5',
        pertenk: '\u2031',
        pfr: '\u{1D52D}',
        Pfr: '\u{1D513}',
        phi: '\u03C6',
        Phi: '\u03A6',
        phiv: '\u03D5',
        phmmat: '\u2133',
        phone: '\u260E',
        pi: '\u03C0',
        Pi: '\u03A0',
        pitchfork: '\u22D4',
        piv: '\u03D6',
        planck: '\u210F',
        planckh: '\u210E',
        plankv: '\u210F',
        plus: '+',
        plusacir: '\u2A23',
        plusb: '\u229E',
        pluscir: '\u2A22',
        plusdo: '\u2214',
        plusdu: '\u2A25',
        pluse: '\u2A72',
        PlusMinus: '\xB1',
        plusmn: '\xB1',
        plussim: '\u2A26',
        plustwo: '\u2A27',
        pm: '\xB1',
        Poincareplane: '\u210C',
        pointint: '\u2A15',
        popf: '\u{1D561}',
        Popf: '\u2119',
        pound: '\xA3',
        pr: '\u227A',
        Pr: '\u2ABB',
        prap: '\u2AB7',
        prcue: '\u227C',
        pre: '\u2AAF',
        prE: '\u2AB3',
        prec: '\u227A',
        precapprox: '\u2AB7',
        preccurlyeq: '\u227C',
        Precedes: '\u227A',
        PrecedesEqual: '\u2AAF',
        PrecedesSlantEqual: '\u227C',
        PrecedesTilde: '\u227E',
        preceq: '\u2AAF',
        precnapprox: '\u2AB9',
        precneqq: '\u2AB5',
        precnsim: '\u22E8',
        precsim: '\u227E',
        prime: '\u2032',
        Prime: '\u2033',
        primes: '\u2119',
        prnap: '\u2AB9',
        prnE: '\u2AB5',
        prnsim: '\u22E8',
        prod: '\u220F',
        Product: '\u220F',
        profalar: '\u232E',
        profline: '\u2312',
        profsurf: '\u2313',
        prop: '\u221D',
        Proportion: '\u2237',
        Proportional: '\u221D',
        propto: '\u221D',
        prsim: '\u227E',
        prurel: '\u22B0',
        pscr: '\u{1D4C5}',
        Pscr: '\u{1D4AB}',
        psi: '\u03C8',
        Psi: '\u03A8',
        puncsp: '\u2008',
        qfr: '\u{1D52E}',
        Qfr: '\u{1D514}',
        qint: '\u2A0C',
        qopf: '\u{1D562}',
        Qopf: '\u211A',
        qprime: '\u2057',
        qscr: '\u{1D4C6}',
        Qscr: '\u{1D4AC}',
        quaternions: '\u210D',
        quatint: '\u2A16',
        quest: '?',
        questeq: '\u225F',
        quot: '"',
        QUOT: '"',
        rAarr: '\u21DB',
        race: '\u223D\u0331',
        racute: '\u0155',
        Racute: '\u0154',
        radic: '\u221A',
        raemptyv: '\u29B3',
        rang: '\u27E9',
        Rang: '\u27EB',
        rangd: '\u2992',
        range: '\u29A5',
        rangle: '\u27E9',
        raquo: '\xBB',
        rarr: '\u2192',
        rArr: '\u21D2',
        Rarr: '\u21A0',
        rarrap: '\u2975',
        rarrb: '\u21E5',
        rarrbfs: '\u2920',
        rarrc: '\u2933',
        rarrfs: '\u291E',
        rarrhk: '\u21AA',
        rarrlp: '\u21AC',
        rarrpl: '\u2945',
        rarrsim: '\u2974',
        rarrtl: '\u21A3',
        Rarrtl: '\u2916',
        rarrw: '\u219D',
        ratail: '\u291A',
        rAtail: '\u291C',
        ratio: '\u2236',
        rationals: '\u211A',
        rbarr: '\u290D',
        rBarr: '\u290F',
        RBarr: '\u2910',
        rbbrk: '\u2773',
        rbrace: '}',
        rbrack: ']',
        rbrke: '\u298C',
        rbrksld: '\u298E',
        rbrkslu: '\u2990',
        rcaron: '\u0159',
        Rcaron: '\u0158',
        rcedil: '\u0157',
        Rcedil: '\u0156',
        rceil: '\u2309',
        rcub: '}',
        rcy: '\u0440',
        Rcy: '\u0420',
        rdca: '\u2937',
        rdldhar: '\u2969',
        rdquo: '\u201D',
        rdquor: '\u201D',
        rdsh: '\u21B3',
        Re: '\u211C',
        real: '\u211C',
        realine: '\u211B',
        realpart: '\u211C',
        reals: '\u211D',
        rect: '\u25AD',
        reg: '\xAE',
        REG: '\xAE',
        ReverseElement: '\u220B',
        ReverseEquilibrium: '\u21CB',
        ReverseUpEquilibrium: '\u296F',
        rfisht: '\u297D',
        rfloor: '\u230B',
        rfr: '\u{1D52F}',
        Rfr: '\u211C',
        rHar: '\u2964',
        rhard: '\u21C1',
        rharu: '\u21C0',
        rharul: '\u296C',
        rho: '\u03C1',
        Rho: '\u03A1',
        rhov: '\u03F1',
        RightAngleBracket: '\u27E9',
        rightarrow: '\u2192',
        Rightarrow: '\u21D2',
        RightArrow: '\u2192',
        RightArrowBar: '\u21E5',
        RightArrowLeftArrow: '\u21C4',
        rightarrowtail: '\u21A3',
        RightCeiling: '\u2309',
        RightDoubleBracket: '\u27E7',
        RightDownTeeVector: '\u295D',
        RightDownVector: '\u21C2',
        RightDownVectorBar: '\u2955',
        RightFloor: '\u230B',
        rightharpoondown: '\u21C1',
        rightharpoonup: '\u21C0',
        rightleftarrows: '\u21C4',
        rightleftharpoons: '\u21CC',
        rightrightarrows: '\u21C9',
        rightsquigarrow: '\u219D',
        RightTee: '\u22A2',
        RightTeeArrow: '\u21A6',
        RightTeeVector: '\u295B',
        rightthreetimes: '\u22CC',
        RightTriangle: '\u22B3',
        RightTriangleBar: '\u29D0',
        RightTriangleEqual: '\u22B5',
        RightUpDownVector: '\u294F',
        RightUpTeeVector: '\u295C',
        RightUpVector: '\u21BE',
        RightUpVectorBar: '\u2954',
        RightVector: '\u21C0',
        RightVectorBar: '\u2953',
        ring: '\u02DA',
        risingdotseq: '\u2253',
        rlarr: '\u21C4',
        rlhar: '\u21CC',
        rlm: '\u200F',
        rmoust: '\u23B1',
        rmoustache: '\u23B1',
        rnmid: '\u2AEE',
        roang: '\u27ED',
        roarr: '\u21FE',
        robrk: '\u27E7',
        ropar: '\u2986',
        ropf: '\u{1D563}',
        Ropf: '\u211D',
        roplus: '\u2A2E',
        rotimes: '\u2A35',
        RoundImplies: '\u2970',
        rpar: ')',
        rpargt: '\u2994',
        rppolint: '\u2A12',
        rrarr: '\u21C9',
        Rrightarrow: '\u21DB',
        rsaquo: '\u203A',
        rscr: '\u{1D4C7}',
        Rscr: '\u211B',
        rsh: '\u21B1',
        Rsh: '\u21B1',
        rsqb: ']',
        rsquo: '\u2019',
        rsquor: '\u2019',
        rthree: '\u22CC',
        rtimes: '\u22CA',
        rtri: '\u25B9',
        rtrie: '\u22B5',
        rtrif: '\u25B8',
        rtriltri: '\u29CE',
        RuleDelayed: '\u29F4',
        ruluhar: '\u2968',
        rx: '\u211E',
        sacute: '\u015B',
        Sacute: '\u015A',
        sbquo: '\u201A',
        sc: '\u227B',
        Sc: '\u2ABC',
        scap: '\u2AB8',
        scaron: '\u0161',
        Scaron: '\u0160',
        sccue: '\u227D',
        sce: '\u2AB0',
        scE: '\u2AB4',
        scedil: '\u015F',
        Scedil: '\u015E',
        scirc: '\u015D',
        Scirc: '\u015C',
        scnap: '\u2ABA',
        scnE: '\u2AB6',
        scnsim: '\u22E9',
        scpolint: '\u2A13',
        scsim: '\u227F',
        scy: '\u0441',
        Scy: '\u0421',
        sdot: '\u22C5',
        sdotb: '\u22A1',
        sdote: '\u2A66',
        searhk: '\u2925',
        searr: '\u2198',
        seArr: '\u21D8',
        searrow: '\u2198',
        sect: '\xA7',
        semi: ';',
        seswar: '\u2929',
        setminus: '\u2216',
        setmn: '\u2216',
        sext: '\u2736',
        sfr: '\u{1D530}',
        Sfr: '\u{1D516}',
        sfrown: '\u2322',
        sharp: '\u266F',
        shchcy: '\u0449',
        SHCHcy: '\u0429',
        shcy: '\u0448',
        SHcy: '\u0428',
        ShortDownArrow: '\u2193',
        ShortLeftArrow: '\u2190',
        shortmid: '\u2223',
        shortparallel: '\u2225',
        ShortRightArrow: '\u2192',
        ShortUpArrow: '\u2191',
        shy: '\xAD',
        sigma: '\u03C3',
        Sigma: '\u03A3',
        sigmaf: '\u03C2',
        sigmav: '\u03C2',
        sim: '\u223C',
        simdot: '\u2A6A',
        sime: '\u2243',
        simeq: '\u2243',
        simg: '\u2A9E',
        simgE: '\u2AA0',
        siml: '\u2A9D',
        simlE: '\u2A9F',
        simne: '\u2246',
        simplus: '\u2A24',
        simrarr: '\u2972',
        slarr: '\u2190',
        SmallCircle: '\u2218',
        smallsetminus: '\u2216',
        smashp: '\u2A33',
        smeparsl: '\u29E4',
        smid: '\u2223',
        smile: '\u2323',
        smt: '\u2AAA',
        smte: '\u2AAC',
        smtes: '\u2AAC\uFE00',
        softcy: '\u044C',
        SOFTcy: '\u042C',
        sol: '/',
        solb: '\u29C4',
        solbar: '\u233F',
        sopf: '\u{1D564}',
        Sopf: '\u{1D54A}',
        spades: '\u2660',
        spadesuit: '\u2660',
        spar: '\u2225',
        sqcap: '\u2293',
        sqcaps: '\u2293\uFE00',
        sqcup: '\u2294',
        sqcups: '\u2294\uFE00',
        Sqrt: '\u221A',
        sqsub: '\u228F',
        sqsube: '\u2291',
        sqsubset: '\u228F',
        sqsubseteq: '\u2291',
        sqsup: '\u2290',
        sqsupe: '\u2292',
        sqsupset: '\u2290',
        sqsupseteq: '\u2292',
        squ: '\u25A1',
        square: '\u25A1',
        Square: '\u25A1',
        SquareIntersection: '\u2293',
        SquareSubset: '\u228F',
        SquareSubsetEqual: '\u2291',
        SquareSuperset: '\u2290',
        SquareSupersetEqual: '\u2292',
        SquareUnion: '\u2294',
        squarf: '\u25AA',
        squf: '\u25AA',
        srarr: '\u2192',
        sscr: '\u{1D4C8}',
        Sscr: '\u{1D4AE}',
        ssetmn: '\u2216',
        ssmile: '\u2323',
        sstarf: '\u22C6',
        star: '\u2606',
        Star: '\u22C6',
        starf: '\u2605',
        straightepsilon: '\u03F5',
        straightphi: '\u03D5',
        strns: '\xAF',
        sub: '\u2282',
        Sub: '\u22D0',
        subdot: '\u2ABD',
        sube: '\u2286',
        subE: '\u2AC5',
        subedot: '\u2AC3',
        submult: '\u2AC1',
        subne: '\u228A',
        subnE: '\u2ACB',
        subplus: '\u2ABF',
        subrarr: '\u2979',
        subset: '\u2282',
        Subset: '\u22D0',
        subseteq: '\u2286',
        subseteqq: '\u2AC5',
        SubsetEqual: '\u2286',
        subsetneq: '\u228A',
        subsetneqq: '\u2ACB',
        subsim: '\u2AC7',
        subsub: '\u2AD5',
        subsup: '\u2AD3',
        succ: '\u227B',
        succapprox: '\u2AB8',
        succcurlyeq: '\u227D',
        Succeeds: '\u227B',
        SucceedsEqual: '\u2AB0',
        SucceedsSlantEqual: '\u227D',
        SucceedsTilde: '\u227F',
        succeq: '\u2AB0',
        succnapprox: '\u2ABA',
        succneqq: '\u2AB6',
        succnsim: '\u22E9',
        succsim: '\u227F',
        SuchThat: '\u220B',
        sum: '\u2211',
        Sum: '\u2211',
        sung: '\u266A',
        sup: '\u2283',
        Sup: '\u22D1',
        sup1: '\xB9',
        sup2: '\xB2',
        sup3: '\xB3',
        supdot: '\u2ABE',
        supdsub: '\u2AD8',
        supe: '\u2287',
        supE: '\u2AC6',
        supedot: '\u2AC4',
        Superset: '\u2283',
        SupersetEqual: '\u2287',
        suphsol: '\u27C9',
        suphsub: '\u2AD7',
        suplarr: '\u297B',
        supmult: '\u2AC2',
        supne: '\u228B',
        supnE: '\u2ACC',
        supplus: '\u2AC0',
        supset: '\u2283',
        Supset: '\u22D1',
        supseteq: '\u2287',
        supseteqq: '\u2AC6',
        supsetneq: '\u228B',
        supsetneqq: '\u2ACC',
        supsim: '\u2AC8',
        supsub: '\u2AD4',
        supsup: '\u2AD6',
        swarhk: '\u2926',
        swarr: '\u2199',
        swArr: '\u21D9',
        swarrow: '\u2199',
        swnwar: '\u292A',
        szlig: '\xDF',
        Tab: '	',
        target: '\u2316',
        tau: '\u03C4',
        Tau: '\u03A4',
        tbrk: '\u23B4',
        tcaron: '\u0165',
        Tcaron: '\u0164',
        tcedil: '\u0163',
        Tcedil: '\u0162',
        tcy: '\u0442',
        Tcy: '\u0422',
        tdot: '\u20DB',
        telrec: '\u2315',
        tfr: '\u{1D531}',
        Tfr: '\u{1D517}',
        there4: '\u2234',
        therefore: '\u2234',
        Therefore: '\u2234',
        theta: '\u03B8',
        Theta: '\u0398',
        thetasym: '\u03D1',
        thetav: '\u03D1',
        thickapprox: '\u2248',
        thicksim: '\u223C',
        ThickSpace: '\u205F\u200A',
        thinsp: '\u2009',
        ThinSpace: '\u2009',
        thkap: '\u2248',
        thksim: '\u223C',
        thorn: '\xFE',
        THORN: '\xDE',
        tilde: '\u02DC',
        Tilde: '\u223C',
        TildeEqual: '\u2243',
        TildeFullEqual: '\u2245',
        TildeTilde: '\u2248',
        times: '\xD7',
        timesb: '\u22A0',
        timesbar: '\u2A31',
        timesd: '\u2A30',
        tint: '\u222D',
        toea: '\u2928',
        top: '\u22A4',
        topbot: '\u2336',
        topcir: '\u2AF1',
        topf: '\u{1D565}',
        Topf: '\u{1D54B}',
        topfork: '\u2ADA',
        tosa: '\u2929',
        tprime: '\u2034',
        trade: '\u2122',
        TRADE: '\u2122',
        triangle: '\u25B5',
        triangledown: '\u25BF',
        triangleleft: '\u25C3',
        trianglelefteq: '\u22B4',
        triangleq: '\u225C',
        triangleright: '\u25B9',
        trianglerighteq: '\u22B5',
        tridot: '\u25EC',
        trie: '\u225C',
        triminus: '\u2A3A',
        TripleDot: '\u20DB',
        triplus: '\u2A39',
        trisb: '\u29CD',
        tritime: '\u2A3B',
        trpezium: '\u23E2',
        tscr: '\u{1D4C9}',
        Tscr: '\u{1D4AF}',
        tscy: '\u0446',
        TScy: '\u0426',
        tshcy: '\u045B',
        TSHcy: '\u040B',
        tstrok: '\u0167',
        Tstrok: '\u0166',
        twixt: '\u226C',
        twoheadleftarrow: '\u219E',
        twoheadrightarrow: '\u21A0',
        uacute: '\xFA',
        Uacute: '\xDA',
        uarr: '\u2191',
        uArr: '\u21D1',
        Uarr: '\u219F',
        Uarrocir: '\u2949',
        ubrcy: '\u045E',
        Ubrcy: '\u040E',
        ubreve: '\u016D',
        Ubreve: '\u016C',
        ucirc: '\xFB',
        Ucirc: '\xDB',
        ucy: '\u0443',
        Ucy: '\u0423',
        udarr: '\u21C5',
        udblac: '\u0171',
        Udblac: '\u0170',
        udhar: '\u296E',
        ufisht: '\u297E',
        ufr: '\u{1D532}',
        Ufr: '\u{1D518}',
        ugrave: '\xF9',
        Ugrave: '\xD9',
        uHar: '\u2963',
        uharl: '\u21BF',
        uharr: '\u21BE',
        uhblk: '\u2580',
        ulcorn: '\u231C',
        ulcorner: '\u231C',
        ulcrop: '\u230F',
        ultri: '\u25F8',
        umacr: '\u016B',
        Umacr: '\u016A',
        uml: '\xA8',
        UnderBar: '_',
        UnderBrace: '\u23DF',
        UnderBracket: '\u23B5',
        UnderParenthesis: '\u23DD',
        Union: '\u22C3',
        UnionPlus: '\u228E',
        uogon: '\u0173',
        Uogon: '\u0172',
        uopf: '\u{1D566}',
        Uopf: '\u{1D54C}',
        uparrow: '\u2191',
        Uparrow: '\u21D1',
        UpArrow: '\u2191',
        UpArrowBar: '\u2912',
        UpArrowDownArrow: '\u21C5',
        updownarrow: '\u2195',
        Updownarrow: '\u21D5',
        UpDownArrow: '\u2195',
        UpEquilibrium: '\u296E',
        upharpoonleft: '\u21BF',
        upharpoonright: '\u21BE',
        uplus: '\u228E',
        UpperLeftArrow: '\u2196',
        UpperRightArrow: '\u2197',
        upsi: '\u03C5',
        Upsi: '\u03D2',
        upsih: '\u03D2',
        upsilon: '\u03C5',
        Upsilon: '\u03A5',
        UpTee: '\u22A5',
        UpTeeArrow: '\u21A5',
        upuparrows: '\u21C8',
        urcorn: '\u231D',
        urcorner: '\u231D',
        urcrop: '\u230E',
        uring: '\u016F',
        Uring: '\u016E',
        urtri: '\u25F9',
        uscr: '\u{1D4CA}',
        Uscr: '\u{1D4B0}',
        utdot: '\u22F0',
        utilde: '\u0169',
        Utilde: '\u0168',
        utri: '\u25B5',
        utrif: '\u25B4',
        uuarr: '\u21C8',
        uuml: '\xFC',
        Uuml: '\xDC',
        uwangle: '\u29A7',
        vangrt: '\u299C',
        varepsilon: '\u03F5',
        varkappa: '\u03F0',
        varnothing: '\u2205',
        varphi: '\u03D5',
        varpi: '\u03D6',
        varpropto: '\u221D',
        varr: '\u2195',
        vArr: '\u21D5',
        varrho: '\u03F1',
        varsigma: '\u03C2',
        varsubsetneq: '\u228A\uFE00',
        varsubsetneqq: '\u2ACB\uFE00',
        varsupsetneq: '\u228B\uFE00',
        varsupsetneqq: '\u2ACC\uFE00',
        vartheta: '\u03D1',
        vartriangleleft: '\u22B2',
        vartriangleright: '\u22B3',
        vBar: '\u2AE8',
        Vbar: '\u2AEB',
        vBarv: '\u2AE9',
        vcy: '\u0432',
        Vcy: '\u0412',
        vdash: '\u22A2',
        vDash: '\u22A8',
        Vdash: '\u22A9',
        VDash: '\u22AB',
        Vdashl: '\u2AE6',
        vee: '\u2228',
        Vee: '\u22C1',
        veebar: '\u22BB',
        veeeq: '\u225A',
        vellip: '\u22EE',
        verbar: '|',
        Verbar: '\u2016',
        vert: '|',
        Vert: '\u2016',
        VerticalBar: '\u2223',
        VerticalLine: '|',
        VerticalSeparator: '\u2758',
        VerticalTilde: '\u2240',
        VeryThinSpace: '\u200A',
        vfr: '\u{1D533}',
        Vfr: '\u{1D519}',
        vltri: '\u22B2',
        vnsub: '\u2282\u20D2',
        vnsup: '\u2283\u20D2',
        vopf: '\u{1D567}',
        Vopf: '\u{1D54D}',
        vprop: '\u221D',
        vrtri: '\u22B3',
        vscr: '\u{1D4CB}',
        Vscr: '\u{1D4B1}',
        vsubne: '\u228A\uFE00',
        vsubnE: '\u2ACB\uFE00',
        vsupne: '\u228B\uFE00',
        vsupnE: '\u2ACC\uFE00',
        Vvdash: '\u22AA',
        vzigzag: '\u299A',
        wcirc: '\u0175',
        Wcirc: '\u0174',
        wedbar: '\u2A5F',
        wedge: '\u2227',
        Wedge: '\u22C0',
        wedgeq: '\u2259',
        weierp: '\u2118',
        wfr: '\u{1D534}',
        Wfr: '\u{1D51A}',
        wopf: '\u{1D568}',
        Wopf: '\u{1D54E}',
        wp: '\u2118',
        wr: '\u2240',
        wreath: '\u2240',
        wscr: '\u{1D4CC}',
        Wscr: '\u{1D4B2}',
        xcap: '\u22C2',
        xcirc: '\u25EF',
        xcup: '\u22C3',
        xdtri: '\u25BD',
        xfr: '\u{1D535}',
        Xfr: '\u{1D51B}',
        xharr: '\u27F7',
        xhArr: '\u27FA',
        xi: '\u03BE',
        Xi: '\u039E',
        xlarr: '\u27F5',
        xlArr: '\u27F8',
        xmap: '\u27FC',
        xnis: '\u22FB',
        xodot: '\u2A00',
        xopf: '\u{1D569}',
        Xopf: '\u{1D54F}',
        xoplus: '\u2A01',
        xotime: '\u2A02',
        xrarr: '\u27F6',
        xrArr: '\u27F9',
        xscr: '\u{1D4CD}',
        Xscr: '\u{1D4B3}',
        xsqcup: '\u2A06',
        xuplus: '\u2A04',
        xutri: '\u25B3',
        xvee: '\u22C1',
        xwedge: '\u22C0',
        yacute: '\xFD',
        Yacute: '\xDD',
        yacy: '\u044F',
        YAcy: '\u042F',
        ycirc: '\u0177',
        Ycirc: '\u0176',
        ycy: '\u044B',
        Ycy: '\u042B',
        yen: '\xA5',
        yfr: '\u{1D536}',
        Yfr: '\u{1D51C}',
        yicy: '\u0457',
        YIcy: '\u0407',
        yopf: '\u{1D56A}',
        Yopf: '\u{1D550}',
        yscr: '\u{1D4CE}',
        Yscr: '\u{1D4B4}',
        yucy: '\u044E',
        YUcy: '\u042E',
        yuml: '\xFF',
        Yuml: '\u0178',
        zacute: '\u017A',
        Zacute: '\u0179',
        zcaron: '\u017E',
        Zcaron: '\u017D',
        zcy: '\u0437',
        Zcy: '\u0417',
        zdot: '\u017C',
        Zdot: '\u017B',
        zeetrf: '\u2128',
        ZeroWidthSpace: '\u200B',
        zeta: '\u03B6',
        Zeta: '\u0396',
        zfr: '\u{1D537}',
        Zfr: '\u2128',
        zhcy: '\u0436',
        ZHcy: '\u0416',
        zigrarr: '\u21DD',
        zopf: '\u{1D56B}',
        Zopf: '\u2124',
        zscr: '\u{1D4CF}',
        Zscr: '\u{1D4B5}',
        zwj: '\u200D',
        zwnj: '\u200C'
      };
      var decodeMapLegacy = {
        aacute: '\xE1',
        Aacute: '\xC1',
        acirc: '\xE2',
        Acirc: '\xC2',
        acute: '\xB4',
        aelig: '\xE6',
        AElig: '\xC6',
        agrave: '\xE0',
        Agrave: '\xC0',
        amp: '&',
        AMP: '&',
        aring: '\xE5',
        Aring: '\xC5',
        atilde: '\xE3',
        Atilde: '\xC3',
        auml: '\xE4',
        Auml: '\xC4',
        brvbar: '\xA6',
        ccedil: '\xE7',
        Ccedil: '\xC7',
        cedil: '\xB8',
        cent: '\xA2',
        copy: '\xA9',
        COPY: '\xA9',
        curren: '\xA4',
        deg: '\xB0',
        divide: '\xF7',
        eacute: '\xE9',
        Eacute: '\xC9',
        ecirc: '\xEA',
        Ecirc: '\xCA',
        egrave: '\xE8',
        Egrave: '\xC8',
        eth: '\xF0',
        ETH: '\xD0',
        euml: '\xEB',
        Euml: '\xCB',
        frac12: '\xBD',
        frac14: '\xBC',
        frac34: '\xBE',
        gt: '>',
        GT: '>',
        iacute: '\xED',
        Iacute: '\xCD',
        icirc: '\xEE',
        Icirc: '\xCE',
        iexcl: '\xA1',
        igrave: '\xEC',
        Igrave: '\xCC',
        iquest: '\xBF',
        iuml: '\xEF',
        Iuml: '\xCF',
        laquo: '\xAB',
        lt: '<',
        LT: '<',
        macr: '\xAF',
        micro: '\xB5',
        middot: '\xB7',
        nbsp: '\xA0',
        not: '\xAC',
        ntilde: '\xF1',
        Ntilde: '\xD1',
        oacute: '\xF3',
        Oacute: '\xD3',
        ocirc: '\xF4',
        Ocirc: '\xD4',
        ograve: '\xF2',
        Ograve: '\xD2',
        ordf: '\xAA',
        ordm: '\xBA',
        oslash: '\xF8',
        Oslash: '\xD8',
        otilde: '\xF5',
        Otilde: '\xD5',
        ouml: '\xF6',
        Ouml: '\xD6',
        para: '\xB6',
        plusmn: '\xB1',
        pound: '\xA3',
        quot: '"',
        QUOT: '"',
        raquo: '\xBB',
        reg: '\xAE',
        REG: '\xAE',
        sect: '\xA7',
        shy: '\xAD',
        sup1: '\xB9',
        sup2: '\xB2',
        sup3: '\xB3',
        szlig: '\xDF',
        thorn: '\xFE',
        THORN: '\xDE',
        times: '\xD7',
        uacute: '\xFA',
        Uacute: '\xDA',
        ucirc: '\xFB',
        Ucirc: '\xDB',
        ugrave: '\xF9',
        Ugrave: '\xD9',
        uml: '\xA8',
        uuml: '\xFC',
        Uuml: '\xDC',
        yacute: '\xFD',
        Yacute: '\xDD',
        yen: '\xA5',
        yuml: '\xFF'
      };
      var decodeMapNumeric = {
        0: '\uFFFD',
        128: '\u20AC',
        130: '\u201A',
        131: '\u0192',
        132: '\u201E',
        133: '\u2026',
        134: '\u2020',
        135: '\u2021',
        136: '\u02C6',
        137: '\u2030',
        138: '\u0160',
        139: '\u2039',
        140: '\u0152',
        142: '\u017D',
        145: '\u2018',
        146: '\u2019',
        147: '\u201C',
        148: '\u201D',
        149: '\u2022',
        150: '\u2013',
        151: '\u2014',
        152: '\u02DC',
        153: '\u2122',
        154: '\u0161',
        155: '\u203A',
        156: '\u0153',
        158: '\u017E',
        159: '\u0178'
      };
      var invalidReferenceCodePoints = [
        1, 2, 3, 4, 5, 6, 7, 8, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 127, 128,
        129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151,
        152, 153, 154, 155, 156, 157, 158, 159, 64976, 64977, 64978, 64979, 64980, 64981, 64982, 64983, 64984, 64985, 64986,
        64987, 64988, 64989, 64990, 64991, 64992, 64993, 64994, 64995, 64996, 64997, 64998, 64999, 65e3, 65001, 65002, 65003,
        65004, 65005, 65006, 65007, 65534, 65535, 131070, 131071, 196606, 196607, 262142, 262143, 327678, 327679, 393214,
        393215, 458750, 458751, 524286, 524287, 589822, 589823, 655358, 655359, 720894, 720895, 786430, 786431, 851966,
        851967, 917502, 917503, 983038, 983039, 1048574, 1048575, 1114110, 1114111
      ];
      var stringFromCharCode = String.fromCharCode;
      var object = {};
      var hasOwnProperty = object.hasOwnProperty;
      var has = function (object2, propertyName) {
        return hasOwnProperty.call(object2, propertyName);
      };
      var contains = function (array, value) {
        var index = -1;
        var length = array.length;
        while (++index < length) {
          if (array[index] == value) {
            return true;
          }
        }
        return false;
      };
      var merge = function (options, defaults) {
        if (!options) {
          return defaults;
        }
        var result = {};
        var key2;
        for (key2 in defaults) {
          result[key2] = has(options, key2) ? options[key2] : defaults[key2];
        }
        return result;
      };
      var codePointToSymbol = function (codePoint, strict) {
        var output = '';
        if ((codePoint >= 55296 && codePoint <= 57343) || codePoint > 1114111) {
          if (strict) {
            parseError('character reference outside the permissible Unicode range');
          }
          return '\uFFFD';
        }
        if (has(decodeMapNumeric, codePoint)) {
          if (strict) {
            parseError('disallowed character reference');
          }
          return decodeMapNumeric[codePoint];
        }
        if (strict && contains(invalidReferenceCodePoints, codePoint)) {
          parseError('disallowed character reference');
        }
        if (codePoint > 65535) {
          codePoint -= 65536;
          output += stringFromCharCode(((codePoint >>> 10) & 1023) | 55296);
          codePoint = 56320 | (codePoint & 1023);
        }
        output += stringFromCharCode(codePoint);
        return output;
      };
      var hexEscape = function (codePoint) {
        return '&#x' + codePoint.toString(16).toUpperCase() + ';';
      };
      var decEscape = function (codePoint) {
        return '&#' + codePoint + ';';
      };
      var parseError = function (message) {
        throw Error('Parse error: ' + message);
      };
      var encode = function (string, options) {
        options = merge(options, encode.options);
        var strict = options.strict;
        if (strict && regexInvalidRawCodePoint.test(string)) {
          parseError('forbidden code point');
        }
        var encodeEverything = options.encodeEverything;
        var useNamedReferences = options.useNamedReferences;
        var allowUnsafeSymbols = options.allowUnsafeSymbols;
        var escapeCodePoint = options.decimal ? decEscape : hexEscape;
        var escapeBmpSymbol = function (symbol) {
          return escapeCodePoint(symbol.charCodeAt(0));
        };
        if (encodeEverything) {
          string = string.replace(regexAsciiWhitelist, function (symbol) {
            if (useNamedReferences && has(encodeMap, symbol)) {
              return '&' + encodeMap[symbol] + ';';
            }
            return escapeBmpSymbol(symbol);
          });
          if (useNamedReferences) {
            string = string
              .replace(/&gt;\u20D2/g, '&nvgt;')
              .replace(/&lt;\u20D2/g, '&nvlt;')
              .replace(/&#x66;&#x6A;/g, '&fjlig;');
          }
          if (useNamedReferences) {
            string = string.replace(regexEncodeNonAscii, function (string2) {
              return '&' + encodeMap[string2] + ';';
            });
          }
        } else if (useNamedReferences) {
          if (!allowUnsafeSymbols) {
            string = string.replace(regexEscape, function (string2) {
              return '&' + encodeMap[string2] + ';';
            });
          }
          string = string.replace(/&gt;\u20D2/g, '&nvgt;').replace(/&lt;\u20D2/g, '&nvlt;');
          string = string.replace(regexEncodeNonAscii, function (string2) {
            return '&' + encodeMap[string2] + ';';
          });
        } else if (!allowUnsafeSymbols) {
          string = string.replace(regexEscape, escapeBmpSymbol);
        }
        return string
          .replace(regexAstralSymbols, function ($0) {
            var high = $0.charCodeAt(0);
            var low = $0.charCodeAt(1);
            var codePoint = (high - 55296) * 1024 + low - 56320 + 65536;
            return escapeCodePoint(codePoint);
          })
          .replace(regexBmpWhitelist, escapeBmpSymbol);
      };
      encode.options = {
        allowUnsafeSymbols: false,
        encodeEverything: false,
        strict: false,
        useNamedReferences: false,
        decimal: false
      };
      var decode = function (html, options) {
        options = merge(options, decode.options);
        var strict = options.strict;
        if (strict && regexInvalidEntity.test(html)) {
          parseError('malformed character reference');
        }
        return html.replace(regexDecode, function ($0, $1, $2, $3, $4, $5, $6, $7, $8) {
          var codePoint;
          var semicolon;
          var decDigits;
          var hexDigits;
          var reference;
          var next;
          if ($1) {
            reference = $1;
            return decodeMap[reference];
          }
          if ($2) {
            reference = $2;
            next = $3;
            if (next && options.isAttributeValue) {
              if (strict && next == '=') {
                parseError('`&` did not start a character reference');
              }
              return $0;
            } else {
              if (strict) {
                parseError('named character reference was not terminated by a semicolon');
              }
              return decodeMapLegacy[reference] + (next || '');
            }
          }
          if ($4) {
            decDigits = $4;
            semicolon = $5;
            if (strict && !semicolon) {
              parseError('character reference was not terminated by a semicolon');
            }
            codePoint = parseInt(decDigits, 10);
            return codePointToSymbol(codePoint, strict);
          }
          if ($6) {
            hexDigits = $6;
            semicolon = $7;
            if (strict && !semicolon) {
              parseError('character reference was not terminated by a semicolon');
            }
            codePoint = parseInt(hexDigits, 16);
            return codePointToSymbol(codePoint, strict);
          }
          if (strict) {
            parseError('named character reference was not terminated by a semicolon');
          }
          return $0;
        });
      };
      decode.options = {
        isAttributeValue: false,
        strict: false
      };
      var escape = function (string) {
        return string.replace(regexEscape, function ($0) {
          return escapeMap[$0];
        });
      };
      var he = {
        version: '1.2.0',
        encode: encode,
        decode: decode,
        escape: escape,
        unescape: decode
      };
      if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
        define(function () {
          return he;
        });
      } else if (freeExports && !freeExports.nodeType) {
        if (freeModule) {
          freeModule.exports = he;
        } else {
          for (var key in he) {
            has(he, key) && (freeExports[key] = he[key]);
          }
        }
      } else {
        root.he = he;
      }
    })(exports2);
  }
});

// src/utils.js
var require_utils2 = __commonJS({
  'src/utils.js'(exports2, module2) {
    var core2 = require_core();
    var fs = require('fs');
    var glob = require_glob();
    var xmlParser = require_parser();
    var he = require_he();
    function findTrxFiles2(baseDir2) {
      core2.info(`Looking for trx files in '${baseDir2}'...`);
      const files = glob.sync(baseDir2 + '/**/*.trx', {});
      if (!files || files.length === 0) {
        throw new RangeError('There were no trx files found.');
      }
      core2.info(`The following trx files were found:`);
      core2.info(`	${files.join('\n	')}`);
      return files;
    }
    async function transformAllTrxToJson2(trxFiles) {
      const transformedTrxReports = [];
      for (const trx of trxFiles) {
        transformedTrxReports.push(await transformTrxToJson(trx));
      }
      return transformedTrxReports;
    }
    async function transformTrxToJson(filePath) {
      let trxDataWrapper;
      core2.info(`Transforming file ${filePath}`);
      const xmlData = fs.readFileSync(filePath, 'utf-8');
      const options = {
        attributeNamePrefix: '_',
        textNodeName: '#text',
        ignoreAttributes: false,
        ignoreNameSpace: false,
        allowBooleanAttributes: true,
        parseNodeValue: true,
        parseAttributeValue: true,
        trimValues: true,
        cdataTagName: '__cdata',
        cdataPositionChar: '\\c',
        parseTrueNumberOnly: false,
        arrayMode: false,
        attrValueProcessor: (val, _attrName) =>
          he.decode(val, {
            isAttributeValue: true
          }),
        tagValueProcessor: (val, _tagName) => he.decode(val),
        stopNodes: ['parse-me-as-string']
      };
      if (xmlParser.validate(xmlData.toString()) === true) {
        const parsedTrx = xmlParser.parse(xmlData, options, true);
        const runInfos = parsedTrx.TestRun.ResultSummary.RunInfos;
        if (runInfos && runInfos.RunInfo._outcome === 'Failed') {
          core2.warning('There is trouble');
        }
        const testDefinitionsAreEmpty = parsedTrx && parsedTrx.TestRun && parsedTrx.TestRun.TestDefinitions ? false : true;
        populateAndFormatObjects(parsedTrx);
        const reportTitle = getReportTitle(parsedTrx, testDefinitionsAreEmpty);
        trxDataWrapper = {
          TrxData: parsedTrx,
          IsEmpty: testDefinitionsAreEmpty,
          ReportMetaData: {
            TrxFilePath: filePath,
            ReportName: `dotnet unit tests (${reportTitle})`,
            ReportTitle: reportTitle,
            TrxJSonString: JSON.stringify(parsedTrx),
            TrxXmlString: xmlData
          }
        };
      }
      return trxDataWrapper;
    }
    function populateAndFormatObjects(parsedTrx) {
      if (!parsedTrx.TestRun) {
        parsedTrx.TestRun = {
          Results: {
            UnitTestResult: []
          },
          TestDefinitions: {
            UnitTest: []
          }
        };
      } else {
        if (!parsedTrx.TestRun.Results) {
          parsedTrx.TestRun.Results = {
            UnitTestResult: []
          };
        } else if (!parsedTrx.TestRun.Results.UnitTestResult) {
          parsedTrx.TestRun.Results.UnitTestResult = [];
        }
        if (!parsedTrx.TestRun.TestDefinitions) {
          parsedTrx.TestRun.TestDefinitions = {
            UnitTest: []
          };
        } else if (!parsedTrx.TestRun.TestDefinitions.UnitTest) {
          parsedTrx.TestRun.TestDefinitions.UnitTest = [];
        }
      }
      if (!Array.isArray(parsedTrx.TestRun.Results.UnitTestResult)) {
        parsedTrx.TestRun.Results.UnitTestResult = [parsedTrx.TestRun.Results.UnitTestResult];
      }
      if (!Array.isArray(parsedTrx.TestRun.TestDefinitions.UnitTest)) {
        parsedTrx.TestRun.TestDefinitions.UnitTest = [parsedTrx.TestRun.TestDefinitions.UnitTest];
      }
    }
    function getReportTitle(data, isEmpty) {
      let reportTitle = '';
      if (isEmpty) {
        reportTitle = data.TestRun.ResultSummary.RunInfos.RunInfo._computerName;
      } else {
        const unitTests = data.TestRun.TestDefinitions.UnitTest;
        const storage = unitTests.length > 0 ? unitTests[0]._storage : 'NOT FOUND';
        const dllName = storage.replace(/\\/g, '/').replace('.dll', '').toUpperCase().split('/').pop();
        if (dllName) {
          reportTitle = dllName;
        }
      }
      return reportTitle;
    }
    function areThereAnyFailingTests2(trxJsonReports) {
      core2.info(`Checking for failing tests..`);
      for (const trxData of trxJsonReports) {
        if (trxData.TrxData.TestRun.ResultSummary._outcome === 'Failed') {
          core2.warning(`At least one failing test was found.`);
          return true;
        }
      }
      core2.info(`There are no failing tests.`);
      return false;
    }
    module2.exports = {
      findTrxFiles: findTrxFiles2,
      transformAllTrxToJson: transformAllTrxToJson2,
      areThereAnyFailingTests: areThereAnyFailingTests2
    };
  }
});

// node_modules/@actions/github/lib/context.js
var require_context = __commonJS({
  'node_modules/@actions/github/lib/context.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.Context = void 0;
    var fs_1 = require('fs');
    var os_1 = require('os');
    var Context = class {
      constructor() {
        var _a, _b, _c;
        this.payload = {};
        if (process.env.GITHUB_EVENT_PATH) {
          if (fs_1.existsSync(process.env.GITHUB_EVENT_PATH)) {
            this.payload = JSON.parse(fs_1.readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' }));
          } else {
            const path = process.env.GITHUB_EVENT_PATH;
            process.stdout.write(`GITHUB_EVENT_PATH ${path} does not exist${os_1.EOL}`);
          }
        }
        this.eventName = process.env.GITHUB_EVENT_NAME;
        this.sha = process.env.GITHUB_SHA;
        this.ref = process.env.GITHUB_REF;
        this.workflow = process.env.GITHUB_WORKFLOW;
        this.action = process.env.GITHUB_ACTION;
        this.actor = process.env.GITHUB_ACTOR;
        this.job = process.env.GITHUB_JOB;
        this.runNumber = parseInt(process.env.GITHUB_RUN_NUMBER, 10);
        this.runId = parseInt(process.env.GITHUB_RUN_ID, 10);
        this.apiUrl = (_a = process.env.GITHUB_API_URL) !== null && _a !== void 0 ? _a : `https://api.github.com`;
        this.serverUrl = (_b = process.env.GITHUB_SERVER_URL) !== null && _b !== void 0 ? _b : `https://github.com`;
        this.graphqlUrl =
          (_c = process.env.GITHUB_GRAPHQL_URL) !== null && _c !== void 0 ? _c : `https://api.github.com/graphql`;
      }
      get issue() {
        const payload = this.payload;
        return Object.assign(Object.assign({}, this.repo), {
          number: (payload.issue || payload.pull_request || payload).number
        });
      }
      get repo() {
        if (process.env.GITHUB_REPOSITORY) {
          const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
          return { owner, repo };
        }
        if (this.payload.repository) {
          return {
            owner: this.payload.repository.owner.login,
            repo: this.payload.repository.name
          };
        }
        throw new Error("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");
      }
    };
    exports2.Context = Context;
  }
});

// node_modules/@actions/http-client/proxy.js
var require_proxy = __commonJS({
  'node_modules/@actions/http-client/proxy.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    function getProxyUrl(reqUrl) {
      let usingSsl = reqUrl.protocol === 'https:';
      let proxyUrl;
      if (checkBypass(reqUrl)) {
        return proxyUrl;
      }
      let proxyVar;
      if (usingSsl) {
        proxyVar = process.env['https_proxy'] || process.env['HTTPS_PROXY'];
      } else {
        proxyVar = process.env['http_proxy'] || process.env['HTTP_PROXY'];
      }
      if (proxyVar) {
        proxyUrl = new URL(proxyVar);
      }
      return proxyUrl;
    }
    exports2.getProxyUrl = getProxyUrl;
    function checkBypass(reqUrl) {
      if (!reqUrl.hostname) {
        return false;
      }
      let noProxy = process.env['no_proxy'] || process.env['NO_PROXY'] || '';
      if (!noProxy) {
        return false;
      }
      let reqPort;
      if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
      } else if (reqUrl.protocol === 'http:') {
        reqPort = 80;
      } else if (reqUrl.protocol === 'https:') {
        reqPort = 443;
      }
      let upperReqHosts = [reqUrl.hostname.toUpperCase()];
      if (typeof reqPort === 'number') {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
      }
      for (let upperNoProxyItem of noProxy
        .split(',')
        .map(x => x.trim().toUpperCase())
        .filter(x => x)) {
        if (upperReqHosts.some(x => x === upperNoProxyItem)) {
          return true;
        }
      }
      return false;
    }
    exports2.checkBypass = checkBypass;
  }
});

// node_modules/tunnel/lib/tunnel.js
var require_tunnel = __commonJS({
  'node_modules/tunnel/lib/tunnel.js'(exports2) {
    'use strict';
    var net = require('net');
    var tls = require('tls');
    var http = require('http');
    var https = require('https');
    var events = require('events');
    var assert = require('assert');
    var util = require('util');
    exports2.httpOverHttp = httpOverHttp;
    exports2.httpsOverHttp = httpsOverHttp;
    exports2.httpOverHttps = httpOverHttps;
    exports2.httpsOverHttps = httpsOverHttps;
    function httpOverHttp(options) {
      var agent = new TunnelingAgent(options);
      agent.request = http.request;
      return agent;
    }
    function httpsOverHttp(options) {
      var agent = new TunnelingAgent(options);
      agent.request = http.request;
      agent.createSocket = createSecureSocket;
      agent.defaultPort = 443;
      return agent;
    }
    function httpOverHttps(options) {
      var agent = new TunnelingAgent(options);
      agent.request = https.request;
      return agent;
    }
    function httpsOverHttps(options) {
      var agent = new TunnelingAgent(options);
      agent.request = https.request;
      agent.createSocket = createSecureSocket;
      agent.defaultPort = 443;
      return agent;
    }
    function TunnelingAgent(options) {
      var self = this;
      self.options = options || {};
      self.proxyOptions = self.options.proxy || {};
      self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
      self.requests = [];
      self.sockets = [];
      self.on('free', function onFree(socket, host, port, localAddress) {
        var options2 = toOptions(host, port, localAddress);
        for (var i = 0, len = self.requests.length; i < len; ++i) {
          var pending = self.requests[i];
          if (pending.host === options2.host && pending.port === options2.port) {
            self.requests.splice(i, 1);
            pending.request.onSocket(socket);
            return;
          }
        }
        socket.destroy();
        self.removeSocket(socket);
      });
    }
    util.inherits(TunnelingAgent, events.EventEmitter);
    TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
      var self = this;
      var options = mergeOptions({ request: req }, self.options, toOptions(host, port, localAddress));
      if (self.sockets.length >= this.maxSockets) {
        self.requests.push(options);
        return;
      }
      self.createSocket(options, function (socket) {
        socket.on('free', onFree);
        socket.on('close', onCloseOrRemove);
        socket.on('agentRemove', onCloseOrRemove);
        req.onSocket(socket);
        function onFree() {
          self.emit('free', socket, options);
        }
        function onCloseOrRemove(err) {
          self.removeSocket(socket);
          socket.removeListener('free', onFree);
          socket.removeListener('close', onCloseOrRemove);
          socket.removeListener('agentRemove', onCloseOrRemove);
        }
      });
    };
    TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
      var self = this;
      var placeholder = {};
      self.sockets.push(placeholder);
      var connectOptions = mergeOptions({}, self.proxyOptions, {
        method: 'CONNECT',
        path: options.host + ':' + options.port,
        agent: false,
        headers: {
          host: options.host + ':' + options.port
        }
      });
      if (options.localAddress) {
        connectOptions.localAddress = options.localAddress;
      }
      if (connectOptions.proxyAuth) {
        connectOptions.headers = connectOptions.headers || {};
        connectOptions.headers['Proxy-Authorization'] = 'Basic ' + new Buffer(connectOptions.proxyAuth).toString('base64');
      }
      debug('making CONNECT request');
      var connectReq = self.request(connectOptions);
      connectReq.useChunkedEncodingByDefault = false;
      connectReq.once('response', onResponse);
      connectReq.once('upgrade', onUpgrade);
      connectReq.once('connect', onConnect);
      connectReq.once('error', onError);
      connectReq.end();
      function onResponse(res) {
        res.upgrade = true;
      }
      function onUpgrade(res, socket, head) {
        process.nextTick(function () {
          onConnect(res, socket, head);
        });
      }
      function onConnect(res, socket, head) {
        connectReq.removeAllListeners();
        socket.removeAllListeners();
        if (res.statusCode !== 200) {
          debug('tunneling socket could not be established, statusCode=%d', res.statusCode);
          socket.destroy();
          var error = new Error('tunneling socket could not be established, statusCode=' + res.statusCode);
          error.code = 'ECONNRESET';
          options.request.emit('error', error);
          self.removeSocket(placeholder);
          return;
        }
        if (head.length > 0) {
          debug('got illegal response body from proxy');
          socket.destroy();
          var error = new Error('got illegal response body from proxy');
          error.code = 'ECONNRESET';
          options.request.emit('error', error);
          self.removeSocket(placeholder);
          return;
        }
        debug('tunneling connection has established');
        self.sockets[self.sockets.indexOf(placeholder)] = socket;
        return cb(socket);
      }
      function onError(cause) {
        connectReq.removeAllListeners();
        debug('tunneling socket could not be established, cause=%s\n', cause.message, cause.stack);
        var error = new Error('tunneling socket could not be established, cause=' + cause.message);
        error.code = 'ECONNRESET';
        options.request.emit('error', error);
        self.removeSocket(placeholder);
      }
    };
    TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
      var pos = this.sockets.indexOf(socket);
      if (pos === -1) {
        return;
      }
      this.sockets.splice(pos, 1);
      var pending = this.requests.shift();
      if (pending) {
        this.createSocket(pending, function (socket2) {
          pending.request.onSocket(socket2);
        });
      }
    };
    function createSecureSocket(options, cb) {
      var self = this;
      TunnelingAgent.prototype.createSocket.call(self, options, function (socket) {
        var hostHeader = options.request.getHeader('host');
        var tlsOptions = mergeOptions({}, self.options, {
          socket,
          servername: hostHeader ? hostHeader.replace(/:.*$/, '') : options.host
        });
        var secureSocket = tls.connect(0, tlsOptions);
        self.sockets[self.sockets.indexOf(socket)] = secureSocket;
        cb(secureSocket);
      });
    }
    function toOptions(host, port, localAddress) {
      if (typeof host === 'string') {
        return {
          host,
          port,
          localAddress
        };
      }
      return host;
    }
    function mergeOptions(target) {
      for (var i = 1, len = arguments.length; i < len; ++i) {
        var overrides = arguments[i];
        if (typeof overrides === 'object') {
          var keys = Object.keys(overrides);
          for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
            var k = keys[j];
            if (overrides[k] !== void 0) {
              target[k] = overrides[k];
            }
          }
        }
      }
      return target;
    }
    var debug;
    if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
      debug = function () {
        var args = Array.prototype.slice.call(arguments);
        if (typeof args[0] === 'string') {
          args[0] = 'TUNNEL: ' + args[0];
        } else {
          args.unshift('TUNNEL:');
        }
        console.error.apply(console, args);
      };
    } else {
      debug = function () {};
    }
    exports2.debug = debug;
  }
});

// node_modules/tunnel/index.js
var require_tunnel2 = __commonJS({
  'node_modules/tunnel/index.js'(exports2, module2) {
    module2.exports = require_tunnel();
  }
});

// node_modules/@actions/http-client/index.js
var require_http_client = __commonJS({
  'node_modules/@actions/http-client/index.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    var http = require('http');
    var https = require('https');
    var pm = require_proxy();
    var tunnel;
    var HttpCodes;
    (function (HttpCodes2) {
      HttpCodes2[(HttpCodes2['OK'] = 200)] = 'OK';
      HttpCodes2[(HttpCodes2['MultipleChoices'] = 300)] = 'MultipleChoices';
      HttpCodes2[(HttpCodes2['MovedPermanently'] = 301)] = 'MovedPermanently';
      HttpCodes2[(HttpCodes2['ResourceMoved'] = 302)] = 'ResourceMoved';
      HttpCodes2[(HttpCodes2['SeeOther'] = 303)] = 'SeeOther';
      HttpCodes2[(HttpCodes2['NotModified'] = 304)] = 'NotModified';
      HttpCodes2[(HttpCodes2['UseProxy'] = 305)] = 'UseProxy';
      HttpCodes2[(HttpCodes2['SwitchProxy'] = 306)] = 'SwitchProxy';
      HttpCodes2[(HttpCodes2['TemporaryRedirect'] = 307)] = 'TemporaryRedirect';
      HttpCodes2[(HttpCodes2['PermanentRedirect'] = 308)] = 'PermanentRedirect';
      HttpCodes2[(HttpCodes2['BadRequest'] = 400)] = 'BadRequest';
      HttpCodes2[(HttpCodes2['Unauthorized'] = 401)] = 'Unauthorized';
      HttpCodes2[(HttpCodes2['PaymentRequired'] = 402)] = 'PaymentRequired';
      HttpCodes2[(HttpCodes2['Forbidden'] = 403)] = 'Forbidden';
      HttpCodes2[(HttpCodes2['NotFound'] = 404)] = 'NotFound';
      HttpCodes2[(HttpCodes2['MethodNotAllowed'] = 405)] = 'MethodNotAllowed';
      HttpCodes2[(HttpCodes2['NotAcceptable'] = 406)] = 'NotAcceptable';
      HttpCodes2[(HttpCodes2['ProxyAuthenticationRequired'] = 407)] = 'ProxyAuthenticationRequired';
      HttpCodes2[(HttpCodes2['RequestTimeout'] = 408)] = 'RequestTimeout';
      HttpCodes2[(HttpCodes2['Conflict'] = 409)] = 'Conflict';
      HttpCodes2[(HttpCodes2['Gone'] = 410)] = 'Gone';
      HttpCodes2[(HttpCodes2['TooManyRequests'] = 429)] = 'TooManyRequests';
      HttpCodes2[(HttpCodes2['InternalServerError'] = 500)] = 'InternalServerError';
      HttpCodes2[(HttpCodes2['NotImplemented'] = 501)] = 'NotImplemented';
      HttpCodes2[(HttpCodes2['BadGateway'] = 502)] = 'BadGateway';
      HttpCodes2[(HttpCodes2['ServiceUnavailable'] = 503)] = 'ServiceUnavailable';
      HttpCodes2[(HttpCodes2['GatewayTimeout'] = 504)] = 'GatewayTimeout';
    })((HttpCodes = exports2.HttpCodes || (exports2.HttpCodes = {})));
    var Headers;
    (function (Headers2) {
      Headers2['Accept'] = 'accept';
      Headers2['ContentType'] = 'content-type';
    })((Headers = exports2.Headers || (exports2.Headers = {})));
    var MediaTypes;
    (function (MediaTypes2) {
      MediaTypes2['ApplicationJson'] = 'application/json';
    })((MediaTypes = exports2.MediaTypes || (exports2.MediaTypes = {})));
    function getProxyUrl(serverUrl) {
      let proxyUrl = pm.getProxyUrl(new URL(serverUrl));
      return proxyUrl ? proxyUrl.href : '';
    }
    exports2.getProxyUrl = getProxyUrl;
    var HttpRedirectCodes = [
      HttpCodes.MovedPermanently,
      HttpCodes.ResourceMoved,
      HttpCodes.SeeOther,
      HttpCodes.TemporaryRedirect,
      HttpCodes.PermanentRedirect
    ];
    var HttpResponseRetryCodes = [HttpCodes.BadGateway, HttpCodes.ServiceUnavailable, HttpCodes.GatewayTimeout];
    var RetryableHttpVerbs = ['OPTIONS', 'GET', 'DELETE', 'HEAD'];
    var ExponentialBackoffCeiling = 10;
    var ExponentialBackoffTimeSlice = 5;
    var HttpClientError = class extends Error {
      constructor(message, statusCode) {
        super(message);
        this.name = 'HttpClientError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, HttpClientError.prototype);
      }
    };
    exports2.HttpClientError = HttpClientError;
    var HttpClientResponse = class {
      constructor(message) {
        this.message = message;
      }
      readBody() {
        return new Promise(async (resolve, reject) => {
          let output = Buffer.alloc(0);
          this.message.on('data', chunk => {
            output = Buffer.concat([output, chunk]);
          });
          this.message.on('end', () => {
            resolve(output.toString());
          });
        });
      }
    };
    exports2.HttpClientResponse = HttpClientResponse;
    function isHttps(requestUrl) {
      let parsedUrl = new URL(requestUrl);
      return parsedUrl.protocol === 'https:';
    }
    exports2.isHttps = isHttps;
    var HttpClient = class {
      constructor(userAgent, handlers, requestOptions) {
        this._ignoreSslError = false;
        this._allowRedirects = true;
        this._allowRedirectDowngrade = false;
        this._maxRedirects = 50;
        this._allowRetries = false;
        this._maxRetries = 1;
        this._keepAlive = false;
        this._disposed = false;
        this.userAgent = userAgent;
        this.handlers = handlers || [];
        this.requestOptions = requestOptions;
        if (requestOptions) {
          if (requestOptions.ignoreSslError != null) {
            this._ignoreSslError = requestOptions.ignoreSslError;
          }
          this._socketTimeout = requestOptions.socketTimeout;
          if (requestOptions.allowRedirects != null) {
            this._allowRedirects = requestOptions.allowRedirects;
          }
          if (requestOptions.allowRedirectDowngrade != null) {
            this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
          }
          if (requestOptions.maxRedirects != null) {
            this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
          }
          if (requestOptions.keepAlive != null) {
            this._keepAlive = requestOptions.keepAlive;
          }
          if (requestOptions.allowRetries != null) {
            this._allowRetries = requestOptions.allowRetries;
          }
          if (requestOptions.maxRetries != null) {
            this._maxRetries = requestOptions.maxRetries;
          }
        }
      }
      options(requestUrl, additionalHeaders) {
        return this.request('OPTIONS', requestUrl, null, additionalHeaders || {});
      }
      get(requestUrl, additionalHeaders) {
        return this.request('GET', requestUrl, null, additionalHeaders || {});
      }
      del(requestUrl, additionalHeaders) {
        return this.request('DELETE', requestUrl, null, additionalHeaders || {});
      }
      post(requestUrl, data, additionalHeaders) {
        return this.request('POST', requestUrl, data, additionalHeaders || {});
      }
      patch(requestUrl, data, additionalHeaders) {
        return this.request('PATCH', requestUrl, data, additionalHeaders || {});
      }
      put(requestUrl, data, additionalHeaders) {
        return this.request('PUT', requestUrl, data, additionalHeaders || {});
      }
      head(requestUrl, additionalHeaders) {
        return this.request('HEAD', requestUrl, null, additionalHeaders || {});
      }
      sendStream(verb, requestUrl, stream, additionalHeaders) {
        return this.request(verb, requestUrl, stream, additionalHeaders);
      }
      async getJson(requestUrl, additionalHeaders = {}) {
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(
          additionalHeaders,
          Headers.Accept,
          MediaTypes.ApplicationJson
        );
        let res = await this.get(requestUrl, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      }
      async postJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(
          additionalHeaders,
          Headers.Accept,
          MediaTypes.ApplicationJson
        );
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(
          additionalHeaders,
          Headers.ContentType,
          MediaTypes.ApplicationJson
        );
        let res = await this.post(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      }
      async putJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(
          additionalHeaders,
          Headers.Accept,
          MediaTypes.ApplicationJson
        );
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(
          additionalHeaders,
          Headers.ContentType,
          MediaTypes.ApplicationJson
        );
        let res = await this.put(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      }
      async patchJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(
          additionalHeaders,
          Headers.Accept,
          MediaTypes.ApplicationJson
        );
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(
          additionalHeaders,
          Headers.ContentType,
          MediaTypes.ApplicationJson
        );
        let res = await this.patch(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      }
      async request(verb, requestUrl, data, headers) {
        if (this._disposed) {
          throw new Error('Client has already been disposed.');
        }
        let parsedUrl = new URL(requestUrl);
        let info = this._prepareRequest(verb, parsedUrl, headers);
        let maxTries = this._allowRetries && RetryableHttpVerbs.indexOf(verb) != -1 ? this._maxRetries + 1 : 1;
        let numTries = 0;
        let response;
        while (numTries < maxTries) {
          response = await this.requestRaw(info, data);
          if (response && response.message && response.message.statusCode === HttpCodes.Unauthorized) {
            let authenticationHandler;
            for (let i = 0; i < this.handlers.length; i++) {
              if (this.handlers[i].canHandleAuthentication(response)) {
                authenticationHandler = this.handlers[i];
                break;
              }
            }
            if (authenticationHandler) {
              return authenticationHandler.handleAuthentication(this, info, data);
            } else {
              return response;
            }
          }
          let redirectsRemaining = this._maxRedirects;
          while (
            HttpRedirectCodes.indexOf(response.message.statusCode) != -1 &&
            this._allowRedirects &&
            redirectsRemaining > 0
          ) {
            const redirectUrl = response.message.headers['location'];
            if (!redirectUrl) {
              break;
            }
            let parsedRedirectUrl = new URL(redirectUrl);
            if (
              parsedUrl.protocol == 'https:' &&
              parsedUrl.protocol != parsedRedirectUrl.protocol &&
              !this._allowRedirectDowngrade
            ) {
              throw new Error(
                'Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.'
              );
            }
            await response.readBody();
            if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
              for (let header in headers) {
                if (header.toLowerCase() === 'authorization') {
                  delete headers[header];
                }
              }
            }
            info = this._prepareRequest(verb, parsedRedirectUrl, headers);
            response = await this.requestRaw(info, data);
            redirectsRemaining--;
          }
          if (HttpResponseRetryCodes.indexOf(response.message.statusCode) == -1) {
            return response;
          }
          numTries += 1;
          if (numTries < maxTries) {
            await response.readBody();
            await this._performExponentialBackoff(numTries);
          }
        }
        return response;
      }
      dispose() {
        if (this._agent) {
          this._agent.destroy();
        }
        this._disposed = true;
      }
      requestRaw(info, data) {
        return new Promise((resolve, reject) => {
          let callbackForResult = function (err, res) {
            if (err) {
              reject(err);
            }
            resolve(res);
          };
          this.requestRawWithCallback(info, data, callbackForResult);
        });
      }
      requestRawWithCallback(info, data, onResult) {
        let socket;
        if (typeof data === 'string') {
          info.options.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
        }
        let callbackCalled = false;
        let handleResult = (err, res) => {
          if (!callbackCalled) {
            callbackCalled = true;
            onResult(err, res);
          }
        };
        let req = info.httpModule.request(info.options, msg => {
          let res = new HttpClientResponse(msg);
          handleResult(null, res);
        });
        req.on('socket', sock => {
          socket = sock;
        });
        req.setTimeout(this._socketTimeout || 3 * 6e4, () => {
          if (socket) {
            socket.end();
          }
          handleResult(new Error('Request timeout: ' + info.options.path), null);
        });
        req.on('error', function (err) {
          handleResult(err, null);
        });
        if (data && typeof data === 'string') {
          req.write(data, 'utf8');
        }
        if (data && typeof data !== 'string') {
          data.on('close', function () {
            req.end();
          });
          data.pipe(req);
        } else {
          req.end();
        }
      }
      getAgent(serverUrl) {
        let parsedUrl = new URL(serverUrl);
        return this._getAgent(parsedUrl);
      }
      _prepareRequest(method, requestUrl, headers) {
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === 'https:';
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port ? parseInt(info.parsedUrl.port) : defaultPort;
        info.options.path = (info.parsedUrl.pathname || '') + (info.parsedUrl.search || '');
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
          info.options.headers['user-agent'] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        if (this.handlers) {
          this.handlers.forEach(handler => {
            handler.prepareRequest(info.options);
          });
        }
        return info;
      }
      _mergeHeaders(headers) {
        const lowercaseKeys = obj => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
        if (this.requestOptions && this.requestOptions.headers) {
          return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers));
        }
        return lowercaseKeys(headers || {});
      }
      _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        const lowercaseKeys = obj => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
          clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
      }
      _getAgent(parsedUrl) {
        let agent;
        let proxyUrl = pm.getProxyUrl(parsedUrl);
        let useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
          agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
          agent = this._agent;
        }
        if (!!agent) {
          return agent;
        }
        const usingSsl = parsedUrl.protocol === 'https:';
        let maxSockets = 100;
        if (!!this.requestOptions) {
          maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        if (useProxy) {
          if (!tunnel) {
            tunnel = require_tunnel2();
          }
          const agentOptions = {
            maxSockets,
            keepAlive: this._keepAlive,
            proxy: {
              ...((proxyUrl.username || proxyUrl.password) && {
                proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
              }),
              host: proxyUrl.hostname,
              port: proxyUrl.port
            }
          };
          let tunnelAgent;
          const overHttps = proxyUrl.protocol === 'https:';
          if (usingSsl) {
            tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
          } else {
            tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
          }
          agent = tunnelAgent(agentOptions);
          this._proxyAgent = agent;
        }
        if (this._keepAlive && !agent) {
          const options = { keepAlive: this._keepAlive, maxSockets };
          agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
          this._agent = agent;
        }
        if (!agent) {
          agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
          agent.options = Object.assign(agent.options || {}, {
            rejectUnauthorized: false
          });
        }
        return agent;
      }
      _performExponentialBackoff(retryNumber) {
        retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
        const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
        return new Promise(resolve => setTimeout(() => resolve(), ms));
      }
      static dateTimeDeserializer(key, value) {
        if (typeof value === 'string') {
          let a = new Date(value);
          if (!isNaN(a.valueOf())) {
            return a;
          }
        }
        return value;
      }
      async _processResponse(res, options) {
        return new Promise(async (resolve, reject) => {
          const statusCode = res.message.statusCode;
          const response = {
            statusCode,
            result: null,
            headers: {}
          };
          if (statusCode == HttpCodes.NotFound) {
            resolve(response);
          }
          let obj;
          let contents;
          try {
            contents = await res.readBody();
            if (contents && contents.length > 0) {
              if (options && options.deserializeDates) {
                obj = JSON.parse(contents, HttpClient.dateTimeDeserializer);
              } else {
                obj = JSON.parse(contents);
              }
              response.result = obj;
            }
            response.headers = res.message.headers;
          } catch (err) {}
          if (statusCode > 299) {
            let msg;
            if (obj && obj.message) {
              msg = obj.message;
            } else if (contents && contents.length > 0) {
              msg = contents;
            } else {
              msg = 'Failed request: (' + statusCode + ')';
            }
            let err = new HttpClientError(msg, statusCode);
            err.result = response.result;
            reject(err);
          } else {
            resolve(response);
          }
        });
      }
    };
    exports2.HttpClient = HttpClient;
  }
});

// node_modules/@actions/github/lib/internal/utils.js
var require_utils3 = __commonJS({
  'node_modules/@actions/github/lib/internal/utils.js'(exports2) {
    'use strict';
    var __createBinding =
      (exports2 && exports2.__createBinding) ||
      (Object.create
        ? function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            Object.defineProperty(o, k2, {
              enumerable: true,
              get: function () {
                return m[k];
              }
            });
          }
        : function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            o[k2] = m[k];
          });
    var __setModuleDefault =
      (exports2 && exports2.__setModuleDefault) ||
      (Object.create
        ? function (o, v) {
            Object.defineProperty(o, 'default', { enumerable: true, value: v });
          }
        : function (o, v) {
            o['default'] = v;
          });
    var __importStar =
      (exports2 && exports2.__importStar) ||
      function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k in mod) if (k !== 'default' && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.getApiBaseUrl = exports2.getProxyAgent = exports2.getAuthString = void 0;
    var httpClient = __importStar(require_http_client());
    function getAuthString(token2, options) {
      if (!token2 && !options.auth) {
        throw new Error('Parameter token or opts.auth is required');
      } else if (token2 && options.auth) {
        throw new Error('Parameters token and opts.auth may not both be specified');
      }
      return typeof options.auth === 'string' ? options.auth : `token ${token2}`;
    }
    exports2.getAuthString = getAuthString;
    function getProxyAgent(destinationUrl) {
      const hc = new httpClient.HttpClient();
      return hc.getAgent(destinationUrl);
    }
    exports2.getProxyAgent = getProxyAgent;
    function getApiBaseUrl() {
      return process.env['GITHUB_API_URL'] || 'https://api.github.com';
    }
    exports2.getApiBaseUrl = getApiBaseUrl;
  }
});

// node_modules/universal-user-agent/dist-node/index.js
var require_dist_node = __commonJS({
  'node_modules/universal-user-agent/dist-node/index.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    function getUserAgent() {
      if (typeof navigator === 'object' && 'userAgent' in navigator) {
        return navigator.userAgent;
      }
      if (typeof process === 'object' && 'version' in process) {
        return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
      }
      return '<environment undetectable>';
    }
    exports2.getUserAgent = getUserAgent;
  }
});

// node_modules/before-after-hook/lib/register.js
var require_register = __commonJS({
  'node_modules/before-after-hook/lib/register.js'(exports2, module2) {
    module2.exports = register;
    function register(state, name, method, options) {
      if (typeof method !== 'function') {
        throw new Error('method for before hook must be a function');
      }
      if (!options) {
        options = {};
      }
      if (Array.isArray(name)) {
        return name.reverse().reduce(function (callback, name2) {
          return register.bind(null, state, name2, callback, options);
        }, method)();
      }
      return Promise.resolve().then(function () {
        if (!state.registry[name]) {
          return method(options);
        }
        return state.registry[name].reduce(function (method2, registered) {
          return registered.hook.bind(null, method2, options);
        }, method)();
      });
    }
  }
});

// node_modules/before-after-hook/lib/add.js
var require_add = __commonJS({
  'node_modules/before-after-hook/lib/add.js'(exports2, module2) {
    module2.exports = addHook;
    function addHook(state, kind, name, hook) {
      var orig = hook;
      if (!state.registry[name]) {
        state.registry[name] = [];
      }
      if (kind === 'before') {
        hook = function (method, options) {
          return Promise.resolve().then(orig.bind(null, options)).then(method.bind(null, options));
        };
      }
      if (kind === 'after') {
        hook = function (method, options) {
          var result;
          return Promise.resolve()
            .then(method.bind(null, options))
            .then(function (result_) {
              result = result_;
              return orig(result, options);
            })
            .then(function () {
              return result;
            });
        };
      }
      if (kind === 'error') {
        hook = function (method, options) {
          return Promise.resolve()
            .then(method.bind(null, options))
            .catch(function (error) {
              return orig(error, options);
            });
        };
      }
      state.registry[name].push({
        hook,
        orig
      });
    }
  }
});

// node_modules/before-after-hook/lib/remove.js
var require_remove = __commonJS({
  'node_modules/before-after-hook/lib/remove.js'(exports2, module2) {
    module2.exports = removeHook;
    function removeHook(state, name, method) {
      if (!state.registry[name]) {
        return;
      }
      var index = state.registry[name]
        .map(function (registered) {
          return registered.orig;
        })
        .indexOf(method);
      if (index === -1) {
        return;
      }
      state.registry[name].splice(index, 1);
    }
  }
});

// node_modules/before-after-hook/index.js
var require_before_after_hook = __commonJS({
  'node_modules/before-after-hook/index.js'(exports2, module2) {
    var register = require_register();
    var addHook = require_add();
    var removeHook = require_remove();
    var bind = Function.bind;
    var bindable = bind.bind(bind);
    function bindApi(hook, state, name) {
      var removeHookRef = bindable(removeHook, null).apply(null, name ? [state, name] : [state]);
      hook.api = { remove: removeHookRef };
      hook.remove = removeHookRef;
      ['before', 'error', 'after', 'wrap'].forEach(function (kind) {
        var args = name ? [state, kind, name] : [state, kind];
        hook[kind] = hook.api[kind] = bindable(addHook, null).apply(null, args);
      });
    }
    function HookSingular() {
      var singularHookName = 'h';
      var singularHookState = {
        registry: {}
      };
      var singularHook = register.bind(null, singularHookState, singularHookName);
      bindApi(singularHook, singularHookState, singularHookName);
      return singularHook;
    }
    function HookCollection() {
      var state = {
        registry: {}
      };
      var hook = register.bind(null, state);
      bindApi(hook, state);
      return hook;
    }
    var collectionHookDeprecationMessageDisplayed = false;
    function Hook() {
      if (!collectionHookDeprecationMessageDisplayed) {
        console.warn(
          '[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4'
        );
        collectionHookDeprecationMessageDisplayed = true;
      }
      return HookCollection();
    }
    Hook.Singular = HookSingular.bind();
    Hook.Collection = HookCollection.bind();
    module2.exports = Hook;
    module2.exports.Hook = Hook;
    module2.exports.Singular = Hook.Singular;
    module2.exports.Collection = Hook.Collection;
  }
});

// node_modules/is-plain-object/dist/is-plain-object.js
var require_is_plain_object = __commonJS({
  'node_modules/is-plain-object/dist/is-plain-object.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    function isObject(o) {
      return Object.prototype.toString.call(o) === '[object Object]';
    }
    function isPlainObject(o) {
      var ctor, prot;
      if (isObject(o) === false) return false;
      ctor = o.constructor;
      if (ctor === void 0) return true;
      prot = ctor.prototype;
      if (isObject(prot) === false) return false;
      if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
      }
      return true;
    }
    exports2.isPlainObject = isPlainObject;
  }
});

// node_modules/@octokit/endpoint/dist-node/index.js
var require_dist_node2 = __commonJS({
  'node_modules/@octokit/endpoint/dist-node/index.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    var isPlainObject = require_is_plain_object();
    var universalUserAgent = require_dist_node();
    function lowercaseKeys(object) {
      if (!object) {
        return {};
      }
      return Object.keys(object).reduce((newObj, key) => {
        newObj[key.toLowerCase()] = object[key];
        return newObj;
      }, {});
    }
    function mergeDeep(defaults, options) {
      const result = Object.assign({}, defaults);
      Object.keys(options).forEach(key => {
        if (isPlainObject.isPlainObject(options[key])) {
          if (!(key in defaults))
            Object.assign(result, {
              [key]: options[key]
            });
          else result[key] = mergeDeep(defaults[key], options[key]);
        } else {
          Object.assign(result, {
            [key]: options[key]
          });
        }
      });
      return result;
    }
    function removeUndefinedProperties(obj) {
      for (const key in obj) {
        if (obj[key] === void 0) {
          delete obj[key];
        }
      }
      return obj;
    }
    function merge(defaults, route, options) {
      if (typeof route === 'string') {
        let [method, url] = route.split(' ');
        options = Object.assign(
          url
            ? {
                method,
                url
              }
            : {
                url: method
              },
          options
        );
      } else {
        options = Object.assign({}, route);
      }
      options.headers = lowercaseKeys(options.headers);
      removeUndefinedProperties(options);
      removeUndefinedProperties(options.headers);
      const mergedOptions = mergeDeep(defaults || {}, options);
      if (defaults && defaults.mediaType.previews.length) {
        mergedOptions.mediaType.previews = defaults.mediaType.previews
          .filter(preview => !mergedOptions.mediaType.previews.includes(preview))
          .concat(mergedOptions.mediaType.previews);
      }
      mergedOptions.mediaType.previews = mergedOptions.mediaType.previews.map(preview => preview.replace(/-preview/, ''));
      return mergedOptions;
    }
    function addQueryParameters(url, parameters) {
      const separator = /\?/.test(url) ? '&' : '?';
      const names = Object.keys(parameters);
      if (names.length === 0) {
        return url;
      }
      return (
        url +
        separator +
        names
          .map(name => {
            if (name === 'q') {
              return 'q=' + parameters.q.split('+').map(encodeURIComponent).join('+');
            }
            return `${name}=${encodeURIComponent(parameters[name])}`;
          })
          .join('&')
      );
    }
    var urlVariableRegex = /\{[^}]+\}/g;
    function removeNonChars(variableName) {
      return variableName.replace(/^\W+|\W+$/g, '').split(/,/);
    }
    function extractUrlVariableNames(url) {
      const matches = url.match(urlVariableRegex);
      if (!matches) {
        return [];
      }
      return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
    }
    function omit(object, keysToOmit) {
      return Object.keys(object)
        .filter(option => !keysToOmit.includes(option))
        .reduce((obj, key) => {
          obj[key] = object[key];
          return obj;
        }, {});
    }
    function encodeReserved(str) {
      return str
        .split(/(%[0-9A-Fa-f]{2})/g)
        .map(function (part) {
          if (!/%[0-9A-Fa-f]/.test(part)) {
            part = encodeURI(part).replace(/%5B/g, '[').replace(/%5D/g, ']');
          }
          return part;
        })
        .join('');
    }
    function encodeUnreserved(str) {
      return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase();
      });
    }
    function encodeValue(operator, value, key) {
      value = operator === '+' || operator === '#' ? encodeReserved(value) : encodeUnreserved(value);
      if (key) {
        return encodeUnreserved(key) + '=' + value;
      } else {
        return value;
      }
    }
    function isDefined(value) {
      return value !== void 0 && value !== null;
    }
    function isKeyOperator(operator) {
      return operator === ';' || operator === '&' || operator === '?';
    }
    function getValues(context, operator, key, modifier) {
      var value = context[key],
        result = [];
      if (isDefined(value) && value !== '') {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          value = value.toString();
          if (modifier && modifier !== '*') {
            value = value.substring(0, parseInt(modifier, 10));
          }
          result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ''));
        } else {
          if (modifier === '*') {
            if (Array.isArray(value)) {
              value.filter(isDefined).forEach(function (value2) {
                result.push(encodeValue(operator, value2, isKeyOperator(operator) ? key : ''));
              });
            } else {
              Object.keys(value).forEach(function (k) {
                if (isDefined(value[k])) {
                  result.push(encodeValue(operator, value[k], k));
                }
              });
            }
          } else {
            const tmp = [];
            if (Array.isArray(value)) {
              value.filter(isDefined).forEach(function (value2) {
                tmp.push(encodeValue(operator, value2));
              });
            } else {
              Object.keys(value).forEach(function (k) {
                if (isDefined(value[k])) {
                  tmp.push(encodeUnreserved(k));
                  tmp.push(encodeValue(operator, value[k].toString()));
                }
              });
            }
            if (isKeyOperator(operator)) {
              result.push(encodeUnreserved(key) + '=' + tmp.join(','));
            } else if (tmp.length !== 0) {
              result.push(tmp.join(','));
            }
          }
        }
      } else {
        if (operator === ';') {
          if (isDefined(value)) {
            result.push(encodeUnreserved(key));
          }
        } else if (value === '' && (operator === '&' || operator === '?')) {
          result.push(encodeUnreserved(key) + '=');
        } else if (value === '') {
          result.push('');
        }
      }
      return result;
    }
    function parseUrl(template) {
      return {
        expand: expand.bind(null, template)
      };
    }
    function expand(template, context) {
      var operators = ['+', '#', '.', '/', ';', '?', '&'];
      return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
        if (expression) {
          let operator = '';
          const values = [];
          if (operators.indexOf(expression.charAt(0)) !== -1) {
            operator = expression.charAt(0);
            expression = expression.substr(1);
          }
          expression.split(/,/g).forEach(function (variable) {
            var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
            values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
          });
          if (operator && operator !== '+') {
            var separator = ',';
            if (operator === '?') {
              separator = '&';
            } else if (operator !== '#') {
              separator = operator;
            }
            return (values.length !== 0 ? operator : '') + values.join(separator);
          } else {
            return values.join(',');
          }
        } else {
          return encodeReserved(literal);
        }
      });
    }
    function parse(options) {
      let method = options.method.toUpperCase();
      let url = (options.url || '/').replace(/:([a-z]\w+)/g, '{$1}');
      let headers = Object.assign({}, options.headers);
      let body;
      let parameters = omit(options, ['method', 'baseUrl', 'url', 'headers', 'request', 'mediaType']);
      const urlVariableNames = extractUrlVariableNames(url);
      url = parseUrl(url).expand(parameters);
      if (!/^http/.test(url)) {
        url = options.baseUrl + url;
      }
      const omittedParameters = Object.keys(options)
        .filter(option => urlVariableNames.includes(option))
        .concat('baseUrl');
      const remainingParameters = omit(parameters, omittedParameters);
      const isBinaryRequest = /application\/octet-stream/i.test(headers.accept);
      if (!isBinaryRequest) {
        if (options.mediaType.format) {
          headers.accept = headers.accept
            .split(/,/)
            .map(preview =>
              preview.replace(
                /application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/,
                `application/vnd$1$2.${options.mediaType.format}`
              )
            )
            .join(',');
        }
        if (options.mediaType.previews.length) {
          const previewsFromAcceptHeader = headers.accept.match(/[\w-]+(?=-preview)/g) || [];
          headers.accept = previewsFromAcceptHeader
            .concat(options.mediaType.previews)
            .map(preview => {
              const format = options.mediaType.format ? `.${options.mediaType.format}` : '+json';
              return `application/vnd.github.${preview}-preview${format}`;
            })
            .join(',');
        }
      }
      if (['GET', 'HEAD'].includes(method)) {
        url = addQueryParameters(url, remainingParameters);
      } else {
        if ('data' in remainingParameters) {
          body = remainingParameters.data;
        } else {
          if (Object.keys(remainingParameters).length) {
            body = remainingParameters;
          } else {
            headers['content-length'] = 0;
          }
        }
      }
      if (!headers['content-type'] && typeof body !== 'undefined') {
        headers['content-type'] = 'application/json; charset=utf-8';
      }
      if (['PATCH', 'PUT'].includes(method) && typeof body === 'undefined') {
        body = '';
      }
      return Object.assign(
        {
          method,
          url,
          headers
        },
        typeof body !== 'undefined'
          ? {
              body
            }
          : null,
        options.request
          ? {
              request: options.request
            }
          : null
      );
    }
    function endpointWithDefaults(defaults, route, options) {
      return parse(merge(defaults, route, options));
    }
    function withDefaults(oldDefaults, newDefaults) {
      const DEFAULTS2 = merge(oldDefaults, newDefaults);
      const endpoint2 = endpointWithDefaults.bind(null, DEFAULTS2);
      return Object.assign(endpoint2, {
        DEFAULTS: DEFAULTS2,
        defaults: withDefaults.bind(null, DEFAULTS2),
        merge: merge.bind(null, DEFAULTS2),
        parse
      });
    }
    var VERSION = '6.0.12';
    var userAgent = `octokit-endpoint.js/${VERSION} ${universalUserAgent.getUserAgent()}`;
    var DEFAULTS = {
      method: 'GET',
      baseUrl: 'https://api.github.com',
      headers: {
        accept: 'application/vnd.github.v3+json',
        'user-agent': userAgent
      },
      mediaType: {
        format: '',
        previews: []
      }
    };
    var endpoint = withDefaults(null, DEFAULTS);
    exports2.endpoint = endpoint;
  }
});

// node_modules/node-fetch/lib/index.js
var require_lib = __commonJS({
  'node_modules/node-fetch/lib/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    function _interopDefault(ex) {
      return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
    }
    var Stream = _interopDefault(require('stream'));
    var http = _interopDefault(require('http'));
    var Url = _interopDefault(require('url'));
    var https = _interopDefault(require('https'));
    var zlib = _interopDefault(require('zlib'));
    var Readable = Stream.Readable;
    var BUFFER = Symbol('buffer');
    var TYPE = Symbol('type');
    var Blob = class {
      constructor() {
        this[TYPE] = '';
        const blobParts = arguments[0];
        const options = arguments[1];
        const buffers = [];
        let size = 0;
        if (blobParts) {
          const a = blobParts;
          const length = Number(a.length);
          for (let i = 0; i < length; i++) {
            const element = a[i];
            let buffer;
            if (element instanceof Buffer) {
              buffer = element;
            } else if (ArrayBuffer.isView(element)) {
              buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
            } else if (element instanceof ArrayBuffer) {
              buffer = Buffer.from(element);
            } else if (element instanceof Blob) {
              buffer = element[BUFFER];
            } else {
              buffer = Buffer.from(typeof element === 'string' ? element : String(element));
            }
            size += buffer.length;
            buffers.push(buffer);
          }
        }
        this[BUFFER] = Buffer.concat(buffers);
        let type = options && options.type !== void 0 && String(options.type).toLowerCase();
        if (type && !/[^\u0020-\u007E]/.test(type)) {
          this[TYPE] = type;
        }
      }
      get size() {
        return this[BUFFER].length;
      }
      get type() {
        return this[TYPE];
      }
      text() {
        return Promise.resolve(this[BUFFER].toString());
      }
      arrayBuffer() {
        const buf = this[BUFFER];
        const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
        return Promise.resolve(ab);
      }
      stream() {
        const readable = new Readable();
        readable._read = function () {};
        readable.push(this[BUFFER]);
        readable.push(null);
        return readable;
      }
      toString() {
        return '[object Blob]';
      }
      slice() {
        const size = this.size;
        const start = arguments[0];
        const end = arguments[1];
        let relativeStart, relativeEnd;
        if (start === void 0) {
          relativeStart = 0;
        } else if (start < 0) {
          relativeStart = Math.max(size + start, 0);
        } else {
          relativeStart = Math.min(start, size);
        }
        if (end === void 0) {
          relativeEnd = size;
        } else if (end < 0) {
          relativeEnd = Math.max(size + end, 0);
        } else {
          relativeEnd = Math.min(end, size);
        }
        const span = Math.max(relativeEnd - relativeStart, 0);
        const buffer = this[BUFFER];
        const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
        const blob = new Blob([], { type: arguments[2] });
        blob[BUFFER] = slicedBuffer;
        return blob;
      }
    };
    Object.defineProperties(Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
      value: 'Blob',
      writable: false,
      enumerable: false,
      configurable: true
    });
    function FetchError(message, type, systemError) {
      Error.call(this, message);
      this.message = message;
      this.type = type;
      if (systemError) {
        this.code = this.errno = systemError.code;
      }
      Error.captureStackTrace(this, this.constructor);
    }
    FetchError.prototype = Object.create(Error.prototype);
    FetchError.prototype.constructor = FetchError;
    FetchError.prototype.name = 'FetchError';
    var convert;
    try {
      convert = require('encoding').convert;
    } catch (e) {}
    var INTERNALS = Symbol('Body internals');
    var PassThrough = Stream.PassThrough;
    function Body(body) {
      var _this = this;
      var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {},
        _ref$size = _ref.size;
      let size = _ref$size === void 0 ? 0 : _ref$size;
      var _ref$timeout = _ref.timeout;
      let timeout = _ref$timeout === void 0 ? 0 : _ref$timeout;
      if (body == null) {
        body = null;
      } else if (isURLSearchParams(body)) {
        body = Buffer.from(body.toString());
      } else if (isBlob(body));
      else if (Buffer.isBuffer(body));
      else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
        body = Buffer.from(body);
      } else if (ArrayBuffer.isView(body)) {
        body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
      } else if (body instanceof Stream);
      else {
        body = Buffer.from(String(body));
      }
      this[INTERNALS] = {
        body,
        disturbed: false,
        error: null
      };
      this.size = size;
      this.timeout = timeout;
      if (body instanceof Stream) {
        body.on('error', function (err) {
          const error =
            err.name === 'AbortError'
              ? err
              : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
          _this[INTERNALS].error = error;
        });
      }
    }
    Body.prototype = {
      get body() {
        return this[INTERNALS].body;
      },
      get bodyUsed() {
        return this[INTERNALS].disturbed;
      },
      arrayBuffer() {
        return consumeBody.call(this).then(function (buf) {
          return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
        });
      },
      blob() {
        let ct = (this.headers && this.headers.get('content-type')) || '';
        return consumeBody.call(this).then(function (buf) {
          return Object.assign(
            new Blob([], {
              type: ct.toLowerCase()
            }),
            {
              [BUFFER]: buf
            }
          );
        });
      },
      json() {
        var _this2 = this;
        return consumeBody.call(this).then(function (buffer) {
          try {
            return JSON.parse(buffer.toString());
          } catch (err) {
            return Body.Promise.reject(
              new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json')
            );
          }
        });
      },
      text() {
        return consumeBody.call(this).then(function (buffer) {
          return buffer.toString();
        });
      },
      buffer() {
        return consumeBody.call(this);
      },
      textConverted() {
        var _this3 = this;
        return consumeBody.call(this).then(function (buffer) {
          return convertBody(buffer, _this3.headers);
        });
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    Body.mixIn = function (proto) {
      for (const name of Object.getOwnPropertyNames(Body.prototype)) {
        if (!(name in proto)) {
          const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
          Object.defineProperty(proto, name, desc);
        }
      }
    };
    function consumeBody() {
      var _this4 = this;
      if (this[INTERNALS].disturbed) {
        return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
      }
      this[INTERNALS].disturbed = true;
      if (this[INTERNALS].error) {
        return Body.Promise.reject(this[INTERNALS].error);
      }
      let body = this.body;
      if (body === null) {
        return Body.Promise.resolve(Buffer.alloc(0));
      }
      if (isBlob(body)) {
        body = body.stream();
      }
      if (Buffer.isBuffer(body)) {
        return Body.Promise.resolve(body);
      }
      if (!(body instanceof Stream)) {
        return Body.Promise.resolve(Buffer.alloc(0));
      }
      let accum = [];
      let accumBytes = 0;
      let abort = false;
      return new Body.Promise(function (resolve, reject) {
        let resTimeout;
        if (_this4.timeout) {
          resTimeout = setTimeout(function () {
            abort = true;
            reject(
              new FetchError(
                `Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`,
                'body-timeout'
              )
            );
          }, _this4.timeout);
        }
        body.on('error', function (err) {
          if (err.name === 'AbortError') {
            abort = true;
            reject(err);
          } else {
            reject(
              new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err)
            );
          }
        });
        body.on('data', function (chunk) {
          if (abort || chunk === null) {
            return;
          }
          if (_this4.size && accumBytes + chunk.length > _this4.size) {
            abort = true;
            reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
            return;
          }
          accumBytes += chunk.length;
          accum.push(chunk);
        });
        body.on('end', function () {
          if (abort) {
            return;
          }
          clearTimeout(resTimeout);
          try {
            resolve(Buffer.concat(accum, accumBytes));
          } catch (err) {
            reject(
              new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err)
            );
          }
        });
      });
    }
    function convertBody(buffer, headers) {
      if (typeof convert !== 'function') {
        throw new Error('The package `encoding` must be installed to use the textConverted() function');
      }
      const ct = headers.get('content-type');
      let charset = 'utf-8';
      let res, str;
      if (ct) {
        res = /charset=([^;]*)/i.exec(ct);
      }
      str = buffer.slice(0, 1024).toString();
      if (!res && str) {
        res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
      }
      if (!res && str) {
        res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
        if (!res) {
          res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
          if (res) {
            res.pop();
          }
        }
        if (res) {
          res = /charset=(.*)/i.exec(res.pop());
        }
      }
      if (!res && str) {
        res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
      }
      if (res) {
        charset = res.pop();
        if (charset === 'gb2312' || charset === 'gbk') {
          charset = 'gb18030';
        }
      }
      return convert(buffer, 'UTF-8', charset).toString();
    }
    function isURLSearchParams(obj) {
      if (
        typeof obj !== 'object' ||
        typeof obj.append !== 'function' ||
        typeof obj.delete !== 'function' ||
        typeof obj.get !== 'function' ||
        typeof obj.getAll !== 'function' ||
        typeof obj.has !== 'function' ||
        typeof obj.set !== 'function'
      ) {
        return false;
      }
      return (
        obj.constructor.name === 'URLSearchParams' ||
        Object.prototype.toString.call(obj) === '[object URLSearchParams]' ||
        typeof obj.sort === 'function'
      );
    }
    function isBlob(obj) {
      return (
        typeof obj === 'object' &&
        typeof obj.arrayBuffer === 'function' &&
        typeof obj.type === 'string' &&
        typeof obj.stream === 'function' &&
        typeof obj.constructor === 'function' &&
        typeof obj.constructor.name === 'string' &&
        /^(Blob|File)$/.test(obj.constructor.name) &&
        /^(Blob|File)$/.test(obj[Symbol.toStringTag])
      );
    }
    function clone(instance) {
      let p1, p2;
      let body = instance.body;
      if (instance.bodyUsed) {
        throw new Error('cannot clone body after it is used');
      }
      if (body instanceof Stream && typeof body.getBoundary !== 'function') {
        p1 = new PassThrough();
        p2 = new PassThrough();
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS].body = p1;
        body = p2;
      }
      return body;
    }
    function extractContentType(body) {
      if (body === null) {
        return null;
      } else if (typeof body === 'string') {
        return 'text/plain;charset=UTF-8';
      } else if (isURLSearchParams(body)) {
        return 'application/x-www-form-urlencoded;charset=UTF-8';
      } else if (isBlob(body)) {
        return body.type || null;
      } else if (Buffer.isBuffer(body)) {
        return null;
      } else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
        return null;
      } else if (ArrayBuffer.isView(body)) {
        return null;
      } else if (typeof body.getBoundary === 'function') {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      } else if (body instanceof Stream) {
        return null;
      } else {
        return 'text/plain;charset=UTF-8';
      }
    }
    function getTotalBytes(instance) {
      const body = instance.body;
      if (body === null) {
        return 0;
      } else if (isBlob(body)) {
        return body.size;
      } else if (Buffer.isBuffer(body)) {
        return body.length;
      } else if (body && typeof body.getLengthSync === 'function') {
        if (
          (body._lengthRetrievers && body._lengthRetrievers.length == 0) ||
          (body.hasKnownLength && body.hasKnownLength())
        ) {
          return body.getLengthSync();
        }
        return null;
      } else {
        return null;
      }
    }
    function writeToStream(dest, instance) {
      const body = instance.body;
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        body.stream().pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    }
    Body.Promise = global.Promise;
    var invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
    var invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;
    function validateName(name) {
      name = `${name}`;
      if (invalidTokenRegex.test(name) || name === '') {
        throw new TypeError(`${name} is not a legal HTTP header name`);
      }
    }
    function validateValue(value) {
      value = `${value}`;
      if (invalidHeaderCharRegex.test(value)) {
        throw new TypeError(`${value} is not a legal HTTP header value`);
      }
    }
    function find(map, name) {
      name = name.toLowerCase();
      for (const key in map) {
        if (key.toLowerCase() === name) {
          return key;
        }
      }
      return void 0;
    }
    var MAP = Symbol('map');
    var Headers = class {
      constructor() {
        let init = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0;
        this[MAP] = Object.create(null);
        if (init instanceof Headers) {
          const rawHeaders = init.raw();
          const headerNames = Object.keys(rawHeaders);
          for (const headerName of headerNames) {
            for (const value of rawHeaders[headerName]) {
              this.append(headerName, value);
            }
          }
          return;
        }
        if (init == null);
        else if (typeof init === 'object') {
          const method = init[Symbol.iterator];
          if (method != null) {
            if (typeof method !== 'function') {
              throw new TypeError('Header pairs must be iterable');
            }
            const pairs = [];
            for (const pair of init) {
              if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
                throw new TypeError('Each header pair must be iterable');
              }
              pairs.push(Array.from(pair));
            }
            for (const pair of pairs) {
              if (pair.length !== 2) {
                throw new TypeError('Each header pair must be a name/value tuple');
              }
              this.append(pair[0], pair[1]);
            }
          } else {
            for (const key of Object.keys(init)) {
              const value = init[key];
              this.append(key, value);
            }
          }
        } else {
          throw new TypeError('Provided initializer must be an object');
        }
      }
      get(name) {
        name = `${name}`;
        validateName(name);
        const key = find(this[MAP], name);
        if (key === void 0) {
          return null;
        }
        return this[MAP][key].join(', ');
      }
      forEach(callback) {
        let thisArg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : void 0;
        let pairs = getHeaders(this);
        let i = 0;
        while (i < pairs.length) {
          var _pairs$i = pairs[i];
          const name = _pairs$i[0],
            value = _pairs$i[1];
          callback.call(thisArg, value, name, this);
          pairs = getHeaders(this);
          i++;
        }
      }
      set(name, value) {
        name = `${name}`;
        value = `${value}`;
        validateName(name);
        validateValue(value);
        const key = find(this[MAP], name);
        this[MAP][key !== void 0 ? key : name] = [value];
      }
      append(name, value) {
        name = `${name}`;
        value = `${value}`;
        validateName(name);
        validateValue(value);
        const key = find(this[MAP], name);
        if (key !== void 0) {
          this[MAP][key].push(value);
        } else {
          this[MAP][name] = [value];
        }
      }
      has(name) {
        name = `${name}`;
        validateName(name);
        return find(this[MAP], name) !== void 0;
      }
      delete(name) {
        name = `${name}`;
        validateName(name);
        const key = find(this[MAP], name);
        if (key !== void 0) {
          delete this[MAP][key];
        }
      }
      raw() {
        return this[MAP];
      }
      keys() {
        return createHeadersIterator(this, 'key');
      }
      values() {
        return createHeadersIterator(this, 'value');
      }
      [Symbol.iterator]() {
        return createHeadersIterator(this, 'key+value');
      }
    };
    Headers.prototype.entries = Headers.prototype[Symbol.iterator];
    Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
      value: 'Headers',
      writable: false,
      enumerable: false,
      configurable: true
    });
    Object.defineProperties(Headers.prototype, {
      get: { enumerable: true },
      forEach: { enumerable: true },
      set: { enumerable: true },
      append: { enumerable: true },
      has: { enumerable: true },
      delete: { enumerable: true },
      keys: { enumerable: true },
      values: { enumerable: true },
      entries: { enumerable: true }
    });
    function getHeaders(headers) {
      let kind = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'key+value';
      const keys = Object.keys(headers[MAP]).sort();
      return keys.map(
        kind === 'key'
          ? function (k) {
              return k.toLowerCase();
            }
          : kind === 'value'
          ? function (k) {
              return headers[MAP][k].join(', ');
            }
          : function (k) {
              return [k.toLowerCase(), headers[MAP][k].join(', ')];
            }
      );
    }
    var INTERNAL = Symbol('internal');
    function createHeadersIterator(target, kind) {
      const iterator = Object.create(HeadersIteratorPrototype);
      iterator[INTERNAL] = {
        target,
        kind,
        index: 0
      };
      return iterator;
    }
    var HeadersIteratorPrototype = Object.setPrototypeOf(
      {
        next() {
          if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
            throw new TypeError('Value of `this` is not a HeadersIterator');
          }
          var _INTERNAL = this[INTERNAL];
          const target = _INTERNAL.target,
            kind = _INTERNAL.kind,
            index = _INTERNAL.index;
          const values = getHeaders(target, kind);
          const len = values.length;
          if (index >= len) {
            return {
              value: void 0,
              done: true
            };
          }
          this[INTERNAL].index = index + 1;
          return {
            value: values[index],
            done: false
          };
        }
      },
      Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()))
    );
    Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
      value: 'HeadersIterator',
      writable: false,
      enumerable: false,
      configurable: true
    });
    function exportNodeCompatibleHeaders(headers) {
      const obj = Object.assign({ __proto__: null }, headers[MAP]);
      const hostHeaderKey = find(headers[MAP], 'Host');
      if (hostHeaderKey !== void 0) {
        obj[hostHeaderKey] = obj[hostHeaderKey][0];
      }
      return obj;
    }
    function createHeadersLenient(obj) {
      const headers = new Headers();
      for (const name of Object.keys(obj)) {
        if (invalidTokenRegex.test(name)) {
          continue;
        }
        if (Array.isArray(obj[name])) {
          for (const val of obj[name]) {
            if (invalidHeaderCharRegex.test(val)) {
              continue;
            }
            if (headers[MAP][name] === void 0) {
              headers[MAP][name] = [val];
            } else {
              headers[MAP][name].push(val);
            }
          }
        } else if (!invalidHeaderCharRegex.test(obj[name])) {
          headers[MAP][name] = [obj[name]];
        }
      }
      return headers;
    }
    var INTERNALS$1 = Symbol('Response internals');
    var STATUS_CODES = http.STATUS_CODES;
    var Response = class {
      constructor() {
        let body = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
        let opts = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        Body.call(this, body, opts);
        const status = opts.status || 200;
        const headers = new Headers(opts.headers);
        if (body != null && !headers.has('Content-Type')) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append('Content-Type', contentType);
          }
        }
        this[INTERNALS$1] = {
          url: opts.url,
          status,
          statusText: opts.statusText || STATUS_CODES[status],
          headers,
          counter: opts.counter
        };
      }
      get url() {
        return this[INTERNALS$1].url || '';
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      clone() {
        return new Response(clone(this), {
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected
        });
      }
    };
    Body.mixIn(Response.prototype);
    Object.defineProperties(Response.prototype, {
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    Object.defineProperty(Response.prototype, Symbol.toStringTag, {
      value: 'Response',
      writable: false,
      enumerable: false,
      configurable: true
    });
    var INTERNALS$2 = Symbol('Request internals');
    var parse_url = Url.parse;
    var format_url = Url.format;
    var streamDestructionSupported = 'destroy' in Stream.Readable.prototype;
    function isRequest(input) {
      return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
    }
    function isAbortSignal(signal) {
      const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
      return !!(proto && proto.constructor.name === 'AbortSignal');
    }
    var Request = class {
      constructor(input) {
        let init = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        let parsedURL;
        if (!isRequest(input)) {
          if (input && input.href) {
            parsedURL = parse_url(input.href);
          } else {
            parsedURL = parse_url(`${input}`);
          }
          input = {};
        } else {
          parsedURL = parse_url(input.url);
        }
        let method = init.method || input.method || 'GET';
        method = method.toUpperCase();
        if ((init.body != null || (isRequest(input) && input.body !== null)) && (method === 'GET' || method === 'HEAD')) {
          throw new TypeError('Request with GET/HEAD method cannot have body');
        }
        let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;
        Body.call(this, inputBody, {
          timeout: init.timeout || input.timeout || 0,
          size: init.size || input.size || 0
        });
        const headers = new Headers(init.headers || input.headers || {});
        if (inputBody != null && !headers.has('Content-Type')) {
          const contentType = extractContentType(inputBody);
          if (contentType) {
            headers.append('Content-Type', contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ('signal' in init) signal = init.signal;
        if (signal != null && !isAbortSignal(signal)) {
          throw new TypeError('Expected signal to be an instanceof AbortSignal');
        }
        this[INTERNALS$2] = {
          method,
          redirect: init.redirect || input.redirect || 'follow',
          headers,
          parsedURL,
          signal
        };
        this.follow = init.follow !== void 0 ? init.follow : input.follow !== void 0 ? input.follow : 20;
        this.compress = init.compress !== void 0 ? init.compress : input.compress !== void 0 ? input.compress : true;
        this.counter = init.counter || input.counter || 0;
        this.agent = init.agent || input.agent;
      }
      get method() {
        return this[INTERNALS$2].method;
      }
      get url() {
        return format_url(this[INTERNALS$2].parsedURL);
      }
      get headers() {
        return this[INTERNALS$2].headers;
      }
      get redirect() {
        return this[INTERNALS$2].redirect;
      }
      get signal() {
        return this[INTERNALS$2].signal;
      }
      clone() {
        return new Request(this);
      }
    };
    Body.mixIn(Request.prototype);
    Object.defineProperty(Request.prototype, Symbol.toStringTag, {
      value: 'Request',
      writable: false,
      enumerable: false,
      configurable: true
    });
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    function getNodeRequestOptions(request) {
      const parsedURL = request[INTERNALS$2].parsedURL;
      const headers = new Headers(request[INTERNALS$2].headers);
      if (!headers.has('Accept')) {
        headers.set('Accept', '*/*');
      }
      if (!parsedURL.protocol || !parsedURL.hostname) {
        throw new TypeError('Only absolute URLs are supported');
      }
      if (!/^https?:$/.test(parsedURL.protocol)) {
        throw new TypeError('Only HTTP(S) protocols are supported');
      }
      if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
        throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
      }
      let contentLengthValue = null;
      if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
        contentLengthValue = '0';
      }
      if (request.body != null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === 'number') {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set('Content-Length', contentLengthValue);
      }
      if (!headers.has('User-Agent')) {
        headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
      }
      if (request.compress && !headers.has('Accept-Encoding')) {
        headers.set('Accept-Encoding', 'gzip,deflate');
      }
      let agent = request.agent;
      if (typeof agent === 'function') {
        agent = agent(parsedURL);
      }
      if (!headers.has('Connection') && !agent) {
        headers.set('Connection', 'close');
      }
      return Object.assign({}, parsedURL, {
        method: request.method,
        headers: exportNodeCompatibleHeaders(headers),
        agent
      });
    }
    function AbortError(message) {
      Error.call(this, message);
      this.type = 'aborted';
      this.message = message;
      Error.captureStackTrace(this, this.constructor);
    }
    AbortError.prototype = Object.create(Error.prototype);
    AbortError.prototype.constructor = AbortError;
    AbortError.prototype.name = 'AbortError';
    var PassThrough$1 = Stream.PassThrough;
    var resolve_url = Url.resolve;
    function fetch(url, opts) {
      if (!fetch.Promise) {
        throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
      }
      Body.Promise = fetch.Promise;
      return new fetch.Promise(function (resolve, reject) {
        const request = new Request(url, opts);
        const options = getNodeRequestOptions(request);
        const send = (options.protocol === 'https:' ? https : http).request;
        const signal = request.signal;
        let response = null;
        const abort = function abort2() {
          let error = new AbortError('The user aborted a request.');
          reject(error);
          if (request.body && request.body instanceof Stream.Readable) {
            request.body.destroy(error);
          }
          if (!response || !response.body) return;
          response.body.emit('error', error);
        };
        if (signal && signal.aborted) {
          abort();
          return;
        }
        const abortAndFinalize = function abortAndFinalize2() {
          abort();
          finalize();
        };
        const req = send(options);
        let reqTimeout;
        if (signal) {
          signal.addEventListener('abort', abortAndFinalize);
        }
        function finalize() {
          req.abort();
          if (signal) signal.removeEventListener('abort', abortAndFinalize);
          clearTimeout(reqTimeout);
        }
        if (request.timeout) {
          req.once('socket', function (socket) {
            reqTimeout = setTimeout(function () {
              reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
              finalize();
            }, request.timeout);
          });
        }
        req.on('error', function (err) {
          reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
          finalize();
        });
        req.on('response', function (res) {
          clearTimeout(reqTimeout);
          const headers = createHeadersLenient(res.headers);
          if (fetch.isRedirect(res.statusCode)) {
            const location = headers.get('Location');
            const locationURL = location === null ? null : resolve_url(request.url, location);
            switch (request.redirect) {
              case 'error':
                reject(
                  new FetchError(
                    `uri requested responds with a redirect, redirect mode is set to error: ${request.url}`,
                    'no-redirect'
                  )
                );
                finalize();
                return;
              case 'manual':
                if (locationURL !== null) {
                  try {
                    headers.set('Location', locationURL);
                  } catch (err) {
                    reject(err);
                  }
                }
                break;
              case 'follow':
                if (locationURL === null) {
                  break;
                }
                if (request.counter >= request.follow) {
                  reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
                  finalize();
                  return;
                }
                const requestOpts = {
                  headers: new Headers(request.headers),
                  follow: request.follow,
                  counter: request.counter + 1,
                  agent: request.agent,
                  compress: request.compress,
                  method: request.method,
                  body: request.body,
                  signal: request.signal,
                  timeout: request.timeout,
                  size: request.size
                };
                if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
                  reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
                  finalize();
                  return;
                }
                if (
                  res.statusCode === 303 ||
                  ((res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST')
                ) {
                  requestOpts.method = 'GET';
                  requestOpts.body = void 0;
                  requestOpts.headers.delete('content-length');
                }
                resolve(fetch(new Request(locationURL, requestOpts)));
                finalize();
                return;
            }
          }
          res.once('end', function () {
            if (signal) signal.removeEventListener('abort', abortAndFinalize);
          });
          let body = res.pipe(new PassThrough$1());
          const response_options = {
            url: request.url,
            status: res.statusCode,
            statusText: res.statusMessage,
            headers,
            size: request.size,
            timeout: request.timeout,
            counter: request.counter
          };
          const codings = headers.get('Content-Encoding');
          if (
            !request.compress ||
            request.method === 'HEAD' ||
            codings === null ||
            res.statusCode === 204 ||
            res.statusCode === 304
          ) {
            response = new Response(body, response_options);
            resolve(response);
            return;
          }
          const zlibOptions = {
            flush: zlib.Z_SYNC_FLUSH,
            finishFlush: zlib.Z_SYNC_FLUSH
          };
          if (codings == 'gzip' || codings == 'x-gzip') {
            body = body.pipe(zlib.createGunzip(zlibOptions));
            response = new Response(body, response_options);
            resolve(response);
            return;
          }
          if (codings == 'deflate' || codings == 'x-deflate') {
            const raw = res.pipe(new PassThrough$1());
            raw.once('data', function (chunk) {
              if ((chunk[0] & 15) === 8) {
                body = body.pipe(zlib.createInflate());
              } else {
                body = body.pipe(zlib.createInflateRaw());
              }
              response = new Response(body, response_options);
              resolve(response);
            });
            return;
          }
          if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
            body = body.pipe(zlib.createBrotliDecompress());
            response = new Response(body, response_options);
            resolve(response);
            return;
          }
          response = new Response(body, response_options);
          resolve(response);
        });
        writeToStream(req, request);
      });
    }
    fetch.isRedirect = function (code) {
      return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
    };
    fetch.Promise = global.Promise;
    module2.exports = exports2 = fetch;
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.default = exports2;
    exports2.Headers = Headers;
    exports2.Request = Request;
    exports2.Response = Response;
    exports2.FetchError = FetchError;
  }
});

// node_modules/deprecation/dist-node/index.js
var require_dist_node3 = __commonJS({
  'node_modules/deprecation/dist-node/index.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    var Deprecation = class extends Error {
      constructor(message) {
        super(message);
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
        this.name = 'Deprecation';
      }
    };
    exports2.Deprecation = Deprecation;
  }
});

// node_modules/@octokit/request-error/dist-node/index.js
var require_dist_node4 = __commonJS({
  'node_modules/@octokit/request-error/dist-node/index.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    function _interopDefault(ex) {
      return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
    }
    var deprecation = require_dist_node3();
    var once = _interopDefault(require_once());
    var logOnceCode = once(deprecation2 => console.warn(deprecation2));
    var logOnceHeaders = once(deprecation2 => console.warn(deprecation2));
    var RequestError = class extends Error {
      constructor(message, statusCode, options) {
        super(message);
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
        this.name = 'HttpError';
        this.status = statusCode;
        let headers;
        if ('headers' in options && typeof options.headers !== 'undefined') {
          headers = options.headers;
        }
        if ('response' in options) {
          this.response = options.response;
          headers = options.response.headers;
        }
        const requestCopy = Object.assign({}, options.request);
        if (options.request.headers.authorization) {
          requestCopy.headers = Object.assign({}, options.request.headers, {
            authorization: options.request.headers.authorization.replace(/ .*$/, ' [REDACTED]')
          });
        }
        requestCopy.url = requestCopy.url
          .replace(/\bclient_secret=\w+/g, 'client_secret=[REDACTED]')
          .replace(/\baccess_token=\w+/g, 'access_token=[REDACTED]');
        this.request = requestCopy;
        Object.defineProperty(this, 'code', {
          get() {
            logOnceCode(
              new deprecation.Deprecation('[@octokit/request-error] `error.code` is deprecated, use `error.status`.')
            );
            return statusCode;
          }
        });
        Object.defineProperty(this, 'headers', {
          get() {
            logOnceHeaders(
              new deprecation.Deprecation(
                '[@octokit/request-error] `error.headers` is deprecated, use `error.response.headers`.'
              )
            );
            return headers || {};
          }
        });
      }
    };
    exports2.RequestError = RequestError;
  }
});

// node_modules/@octokit/request/dist-node/index.js
var require_dist_node5 = __commonJS({
  'node_modules/@octokit/request/dist-node/index.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    function _interopDefault(ex) {
      return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
    }
    var endpoint = require_dist_node2();
    var universalUserAgent = require_dist_node();
    var isPlainObject = require_is_plain_object();
    var nodeFetch = _interopDefault(require_lib());
    var requestError = require_dist_node4();
    var VERSION = '5.6.0';
    function getBufferResponse(response) {
      return response.arrayBuffer();
    }
    function fetchWrapper(requestOptions) {
      const log = requestOptions.request && requestOptions.request.log ? requestOptions.request.log : console;
      if (isPlainObject.isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body)) {
        requestOptions.body = JSON.stringify(requestOptions.body);
      }
      let headers = {};
      let status;
      let url;
      const fetch = (requestOptions.request && requestOptions.request.fetch) || nodeFetch;
      return fetch(
        requestOptions.url,
        Object.assign(
          {
            method: requestOptions.method,
            body: requestOptions.body,
            headers: requestOptions.headers,
            redirect: requestOptions.redirect
          },
          requestOptions.request
        )
      )
        .then(async response => {
          url = response.url;
          status = response.status;
          for (const keyAndValue of response.headers) {
            headers[keyAndValue[0]] = keyAndValue[1];
          }
          if ('deprecation' in headers) {
            const matches = headers.link && headers.link.match(/<([^>]+)>; rel="deprecation"/);
            const deprecationLink = matches && matches.pop();
            log.warn(
              `[@octokit/request] "${requestOptions.method} ${
                requestOptions.url
              }" is deprecated. It is scheduled to be removed on ${headers.sunset}${
                deprecationLink ? `. See ${deprecationLink}` : ''
              }`
            );
          }
          if (status === 204 || status === 205) {
            return;
          }
          if (requestOptions.method === 'HEAD') {
            if (status < 400) {
              return;
            }
            throw new requestError.RequestError(response.statusText, status, {
              response: {
                url,
                status,
                headers,
                data: void 0
              },
              request: requestOptions
            });
          }
          if (status === 304) {
            throw new requestError.RequestError('Not modified', status, {
              response: {
                url,
                status,
                headers,
                data: await getResponseData(response)
              },
              request: requestOptions
            });
          }
          if (status >= 400) {
            const data = await getResponseData(response);
            const error = new requestError.RequestError(toErrorMessage(data), status, {
              response: {
                url,
                status,
                headers,
                data
              },
              request: requestOptions
            });
            throw error;
          }
          return getResponseData(response);
        })
        .then(data => {
          return {
            status,
            url,
            headers,
            data
          };
        })
        .catch(error => {
          if (error instanceof requestError.RequestError) throw error;
          throw new requestError.RequestError(error.message, 500, {
            request: requestOptions
          });
        });
    }
    async function getResponseData(response) {
      const contentType = response.headers.get('content-type');
      if (/application\/json/.test(contentType)) {
        return response.json();
      }
      if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
        return response.text();
      }
      return getBufferResponse(response);
    }
    function toErrorMessage(data) {
      if (typeof data === 'string') return data;
      if ('message' in data) {
        if (Array.isArray(data.errors)) {
          return `${data.message}: ${data.errors.map(JSON.stringify).join(', ')}`;
        }
        return data.message;
      }
      return `Unknown error: ${JSON.stringify(data)}`;
    }
    function withDefaults(oldEndpoint, newDefaults) {
      const endpoint2 = oldEndpoint.defaults(newDefaults);
      const newApi = function (route, parameters) {
        const endpointOptions = endpoint2.merge(route, parameters);
        if (!endpointOptions.request || !endpointOptions.request.hook) {
          return fetchWrapper(endpoint2.parse(endpointOptions));
        }
        const request2 = (route2, parameters2) => {
          return fetchWrapper(endpoint2.parse(endpoint2.merge(route2, parameters2)));
        };
        Object.assign(request2, {
          endpoint: endpoint2,
          defaults: withDefaults.bind(null, endpoint2)
        });
        return endpointOptions.request.hook(request2, endpointOptions);
      };
      return Object.assign(newApi, {
        endpoint: endpoint2,
        defaults: withDefaults.bind(null, endpoint2)
      });
    }
    var request = withDefaults(endpoint.endpoint, {
      headers: {
        'user-agent': `octokit-request.js/${VERSION} ${universalUserAgent.getUserAgent()}`
      }
    });
    exports2.request = request;
  }
});

// node_modules/@octokit/graphql/dist-node/index.js
var require_dist_node6 = __commonJS({
  'node_modules/@octokit/graphql/dist-node/index.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    var request = require_dist_node5();
    var universalUserAgent = require_dist_node();
    var VERSION = '4.6.4';
    var GraphqlError = class extends Error {
      constructor(request2, response) {
        const message = response.data.errors[0].message;
        super(message);
        Object.assign(this, response.data);
        Object.assign(this, {
          headers: response.headers
        });
        this.name = 'GraphqlError';
        this.request = request2;
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
      }
    };
    var NON_VARIABLE_OPTIONS = ['method', 'baseUrl', 'url', 'headers', 'request', 'query', 'mediaType'];
    var FORBIDDEN_VARIABLE_OPTIONS = ['query', 'method', 'url'];
    var GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
    function graphql(request2, query, options) {
      if (options) {
        if (typeof query === 'string' && 'query' in options) {
          return Promise.reject(new Error(`[@octokit/graphql] "query" cannot be used as variable name`));
        }
        for (const key in options) {
          if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key)) continue;
          return Promise.reject(new Error(`[@octokit/graphql] "${key}" cannot be used as variable name`));
        }
      }
      const parsedOptions =
        typeof query === 'string'
          ? Object.assign(
              {
                query
              },
              options
            )
          : query;
      const requestOptions = Object.keys(parsedOptions).reduce((result, key) => {
        if (NON_VARIABLE_OPTIONS.includes(key)) {
          result[key] = parsedOptions[key];
          return result;
        }
        if (!result.variables) {
          result.variables = {};
        }
        result.variables[key] = parsedOptions[key];
        return result;
      }, {});
      const baseUrl = parsedOptions.baseUrl || request2.endpoint.DEFAULTS.baseUrl;
      if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) {
        requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, '/api/graphql');
      }
      return request2(requestOptions).then(response => {
        if (response.data.errors) {
          const headers = {};
          for (const key of Object.keys(response.headers)) {
            headers[key] = response.headers[key];
          }
          throw new GraphqlError(requestOptions, {
            headers,
            data: response.data
          });
        }
        return response.data.data;
      });
    }
    function withDefaults(request$1, newDefaults) {
      const newRequest = request$1.defaults(newDefaults);
      const newApi = (query, options) => {
        return graphql(newRequest, query, options);
      };
      return Object.assign(newApi, {
        defaults: withDefaults.bind(null, newRequest),
        endpoint: request.request.endpoint
      });
    }
    var graphql$1 = withDefaults(request.request, {
      headers: {
        'user-agent': `octokit-graphql.js/${VERSION} ${universalUserAgent.getUserAgent()}`
      },
      method: 'POST',
      url: '/graphql'
    });
    function withCustomRequest(customRequest) {
      return withDefaults(customRequest, {
        method: 'POST',
        url: '/graphql'
      });
    }
    exports2.graphql = graphql$1;
    exports2.withCustomRequest = withCustomRequest;
  }
});

// node_modules/@octokit/auth-token/dist-node/index.js
var require_dist_node7 = __commonJS({
  'node_modules/@octokit/auth-token/dist-node/index.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    async function auth(token2) {
      const tokenType = token2.split(/\./).length === 3 ? 'app' : /^v\d+\./.test(token2) ? 'installation' : 'oauth';
      return {
        type: 'token',
        token: token2,
        tokenType
      };
    }
    function withAuthorizationPrefix(token2) {
      if (token2.split(/\./).length === 3) {
        return `bearer ${token2}`;
      }
      return `token ${token2}`;
    }
    async function hook(token2, request, route, parameters) {
      const endpoint = request.endpoint.merge(route, parameters);
      endpoint.headers.authorization = withAuthorizationPrefix(token2);
      return request(endpoint);
    }
    var createTokenAuth = function createTokenAuth2(token2) {
      if (!token2) {
        throw new Error('[@octokit/auth-token] No token passed to createTokenAuth');
      }
      if (typeof token2 !== 'string') {
        throw new Error('[@octokit/auth-token] Token passed to createTokenAuth is not a string');
      }
      token2 = token2.replace(/^(token|bearer) +/i, '');
      return Object.assign(auth.bind(null, token2), {
        hook: hook.bind(null, token2)
      });
    };
    exports2.createTokenAuth = createTokenAuth;
  }
});

// node_modules/@octokit/core/dist-node/index.js
var require_dist_node8 = __commonJS({
  'node_modules/@octokit/core/dist-node/index.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    var universalUserAgent = require_dist_node();
    var beforeAfterHook = require_before_after_hook();
    var request = require_dist_node5();
    var graphql = require_dist_node6();
    var authToken = require_dist_node7();
    function _objectWithoutPropertiesLoose(source, excluded) {
      if (source == null) return {};
      var target = {};
      var sourceKeys = Object.keys(source);
      var key, i;
      for (i = 0; i < sourceKeys.length; i++) {
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
      }
      return target;
    }
    function _objectWithoutProperties(source, excluded) {
      if (source == null) return {};
      var target = _objectWithoutPropertiesLoose(source, excluded);
      var key, i;
      if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for (i = 0; i < sourceSymbolKeys.length; i++) {
          key = sourceSymbolKeys[i];
          if (excluded.indexOf(key) >= 0) continue;
          if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
          target[key] = source[key];
        }
      }
      return target;
    }
    var VERSION = '3.5.1';
    var _excluded = ['authStrategy'];
    var Octokit = class {
      constructor(options = {}) {
        const hook = new beforeAfterHook.Collection();
        const requestDefaults = {
          baseUrl: request.request.endpoint.DEFAULTS.baseUrl,
          headers: {},
          request: Object.assign({}, options.request, {
            hook: hook.bind(null, 'request')
          }),
          mediaType: {
            previews: [],
            format: ''
          }
        };
        requestDefaults.headers['user-agent'] = [
          options.userAgent,
          `octokit-core.js/${VERSION} ${universalUserAgent.getUserAgent()}`
        ]
          .filter(Boolean)
          .join(' ');
        if (options.baseUrl) {
          requestDefaults.baseUrl = options.baseUrl;
        }
        if (options.previews) {
          requestDefaults.mediaType.previews = options.previews;
        }
        if (options.timeZone) {
          requestDefaults.headers['time-zone'] = options.timeZone;
        }
        this.request = request.request.defaults(requestDefaults);
        this.graphql = graphql.withCustomRequest(this.request).defaults(requestDefaults);
        this.log = Object.assign(
          {
            debug: () => {},
            info: () => {},
            warn: console.warn.bind(console),
            error: console.error.bind(console)
          },
          options.log
        );
        this.hook = hook;
        if (!options.authStrategy) {
          if (!options.auth) {
            this.auth = async () => ({
              type: 'unauthenticated'
            });
          } else {
            const auth = authToken.createTokenAuth(options.auth);
            hook.wrap('request', auth.hook);
            this.auth = auth;
          }
        } else {
          const { authStrategy } = options,
            otherOptions = _objectWithoutProperties(options, _excluded);
          const auth = authStrategy(
            Object.assign(
              {
                request: this.request,
                log: this.log,
                octokit: this,
                octokitOptions: otherOptions
              },
              options.auth
            )
          );
          hook.wrap('request', auth.hook);
          this.auth = auth;
        }
        const classConstructor = this.constructor;
        classConstructor.plugins.forEach(plugin => {
          Object.assign(this, plugin(this, options));
        });
      }
      static defaults(defaults) {
        const OctokitWithDefaults = class extends this {
          constructor(...args) {
            const options = args[0] || {};
            if (typeof defaults === 'function') {
              super(defaults(options));
              return;
            }
            super(
              Object.assign(
                {},
                defaults,
                options,
                options.userAgent && defaults.userAgent
                  ? {
                      userAgent: `${options.userAgent} ${defaults.userAgent}`
                    }
                  : null
              )
            );
          }
        };
        return OctokitWithDefaults;
      }
      static plugin(...newPlugins) {
        var _a;
        const currentPlugins = this.plugins;
        const NewOctokit =
          ((_a = class extends this {}),
          (_a.plugins = currentPlugins.concat(newPlugins.filter(plugin => !currentPlugins.includes(plugin)))),
          _a);
        return NewOctokit;
      }
    };
    Octokit.VERSION = VERSION;
    Octokit.plugins = [];
    exports2.Octokit = Octokit;
  }
});

// node_modules/@octokit/plugin-rest-endpoint-methods/dist-node/index.js
var require_dist_node9 = __commonJS({
  'node_modules/@octokit/plugin-rest-endpoint-methods/dist-node/index.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
          symbols = symbols.filter(function (sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          });
        }
        keys.push.apply(keys, symbols);
      }
      return keys;
    }
    function _objectSpread2(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};
        if (i % 2) {
          ownKeys(Object(source), true).forEach(function (key) {
            _defineProperty(target, key, source[key]);
          });
        } else if (Object.getOwnPropertyDescriptors) {
          Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
          ownKeys(Object(source)).forEach(function (key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
      }
      return target;
    }
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    var Endpoints = {
      actions: {
        addSelectedRepoToOrgSecret: ['PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}'],
        approveWorkflowRun: ['POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve'],
        cancelWorkflowRun: ['POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel'],
        createOrUpdateEnvironmentSecret: [
          'PUT /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}'
        ],
        createOrUpdateOrgSecret: ['PUT /orgs/{org}/actions/secrets/{secret_name}'],
        createOrUpdateRepoSecret: ['PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}'],
        createRegistrationTokenForOrg: ['POST /orgs/{org}/actions/runners/registration-token'],
        createRegistrationTokenForRepo: ['POST /repos/{owner}/{repo}/actions/runners/registration-token'],
        createRemoveTokenForOrg: ['POST /orgs/{org}/actions/runners/remove-token'],
        createRemoveTokenForRepo: ['POST /repos/{owner}/{repo}/actions/runners/remove-token'],
        createWorkflowDispatch: ['POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches'],
        deleteArtifact: ['DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}'],
        deleteEnvironmentSecret: [
          'DELETE /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}'
        ],
        deleteOrgSecret: ['DELETE /orgs/{org}/actions/secrets/{secret_name}'],
        deleteRepoSecret: ['DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}'],
        deleteSelfHostedRunnerFromOrg: ['DELETE /orgs/{org}/actions/runners/{runner_id}'],
        deleteSelfHostedRunnerFromRepo: ['DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}'],
        deleteWorkflowRun: ['DELETE /repos/{owner}/{repo}/actions/runs/{run_id}'],
        deleteWorkflowRunLogs: ['DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs'],
        disableSelectedRepositoryGithubActionsOrganization: [
          'DELETE /orgs/{org}/actions/permissions/repositories/{repository_id}'
        ],
        disableWorkflow: ['PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable'],
        downloadArtifact: ['GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}'],
        downloadJobLogsForWorkflowRun: ['GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs'],
        downloadWorkflowRunLogs: ['GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs'],
        enableSelectedRepositoryGithubActionsOrganization: [
          'PUT /orgs/{org}/actions/permissions/repositories/{repository_id}'
        ],
        enableWorkflow: ['PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable'],
        getAllowedActionsOrganization: ['GET /orgs/{org}/actions/permissions/selected-actions'],
        getAllowedActionsRepository: ['GET /repos/{owner}/{repo}/actions/permissions/selected-actions'],
        getArtifact: ['GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}'],
        getEnvironmentPublicKey: ['GET /repositories/{repository_id}/environments/{environment_name}/secrets/public-key'],
        getEnvironmentSecret: ['GET /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}'],
        getGithubActionsPermissionsOrganization: ['GET /orgs/{org}/actions/permissions'],
        getGithubActionsPermissionsRepository: ['GET /repos/{owner}/{repo}/actions/permissions'],
        getJobForWorkflowRun: ['GET /repos/{owner}/{repo}/actions/jobs/{job_id}'],
        getOrgPublicKey: ['GET /orgs/{org}/actions/secrets/public-key'],
        getOrgSecret: ['GET /orgs/{org}/actions/secrets/{secret_name}'],
        getPendingDeploymentsForRun: ['GET /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments'],
        getRepoPermissions: [
          'GET /repos/{owner}/{repo}/actions/permissions',
          {},
          {
            renamed: ['actions', 'getGithubActionsPermissionsRepository']
          }
        ],
        getRepoPublicKey: ['GET /repos/{owner}/{repo}/actions/secrets/public-key'],
        getRepoSecret: ['GET /repos/{owner}/{repo}/actions/secrets/{secret_name}'],
        getReviewsForRun: ['GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals'],
        getSelfHostedRunnerForOrg: ['GET /orgs/{org}/actions/runners/{runner_id}'],
        getSelfHostedRunnerForRepo: ['GET /repos/{owner}/{repo}/actions/runners/{runner_id}'],
        getWorkflow: ['GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}'],
        getWorkflowRun: ['GET /repos/{owner}/{repo}/actions/runs/{run_id}'],
        getWorkflowRunUsage: ['GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing'],
        getWorkflowUsage: ['GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing'],
        listArtifactsForRepo: ['GET /repos/{owner}/{repo}/actions/artifacts'],
        listEnvironmentSecrets: ['GET /repositories/{repository_id}/environments/{environment_name}/secrets'],
        listJobsForWorkflowRun: ['GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs'],
        listOrgSecrets: ['GET /orgs/{org}/actions/secrets'],
        listRepoSecrets: ['GET /repos/{owner}/{repo}/actions/secrets'],
        listRepoWorkflows: ['GET /repos/{owner}/{repo}/actions/workflows'],
        listRunnerApplicationsForOrg: ['GET /orgs/{org}/actions/runners/downloads'],
        listRunnerApplicationsForRepo: ['GET /repos/{owner}/{repo}/actions/runners/downloads'],
        listSelectedReposForOrgSecret: ['GET /orgs/{org}/actions/secrets/{secret_name}/repositories'],
        listSelectedRepositoriesEnabledGithubActionsOrganization: ['GET /orgs/{org}/actions/permissions/repositories'],
        listSelfHostedRunnersForOrg: ['GET /orgs/{org}/actions/runners'],
        listSelfHostedRunnersForRepo: ['GET /repos/{owner}/{repo}/actions/runners'],
        listWorkflowRunArtifacts: ['GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts'],
        listWorkflowRuns: ['GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs'],
        listWorkflowRunsForRepo: ['GET /repos/{owner}/{repo}/actions/runs'],
        reRunWorkflow: ['POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun'],
        removeSelectedRepoFromOrgSecret: ['DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}'],
        reviewPendingDeploymentsForRun: ['POST /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments'],
        setAllowedActionsOrganization: ['PUT /orgs/{org}/actions/permissions/selected-actions'],
        setAllowedActionsRepository: ['PUT /repos/{owner}/{repo}/actions/permissions/selected-actions'],
        setGithubActionsPermissionsOrganization: ['PUT /orgs/{org}/actions/permissions'],
        setGithubActionsPermissionsRepository: ['PUT /repos/{owner}/{repo}/actions/permissions'],
        setSelectedReposForOrgSecret: ['PUT /orgs/{org}/actions/secrets/{secret_name}/repositories'],
        setSelectedRepositoriesEnabledGithubActionsOrganization: ['PUT /orgs/{org}/actions/permissions/repositories']
      },
      activity: {
        checkRepoIsStarredByAuthenticatedUser: ['GET /user/starred/{owner}/{repo}'],
        deleteRepoSubscription: ['DELETE /repos/{owner}/{repo}/subscription'],
        deleteThreadSubscription: ['DELETE /notifications/threads/{thread_id}/subscription'],
        getFeeds: ['GET /feeds'],
        getRepoSubscription: ['GET /repos/{owner}/{repo}/subscription'],
        getThread: ['GET /notifications/threads/{thread_id}'],
        getThreadSubscriptionForAuthenticatedUser: ['GET /notifications/threads/{thread_id}/subscription'],
        listEventsForAuthenticatedUser: ['GET /users/{username}/events'],
        listNotificationsForAuthenticatedUser: ['GET /notifications'],
        listOrgEventsForAuthenticatedUser: ['GET /users/{username}/events/orgs/{org}'],
        listPublicEvents: ['GET /events'],
        listPublicEventsForRepoNetwork: ['GET /networks/{owner}/{repo}/events'],
        listPublicEventsForUser: ['GET /users/{username}/events/public'],
        listPublicOrgEvents: ['GET /orgs/{org}/events'],
        listReceivedEventsForUser: ['GET /users/{username}/received_events'],
        listReceivedPublicEventsForUser: ['GET /users/{username}/received_events/public'],
        listRepoEvents: ['GET /repos/{owner}/{repo}/events'],
        listRepoNotificationsForAuthenticatedUser: ['GET /repos/{owner}/{repo}/notifications'],
        listReposStarredByAuthenticatedUser: ['GET /user/starred'],
        listReposStarredByUser: ['GET /users/{username}/starred'],
        listReposWatchedByUser: ['GET /users/{username}/subscriptions'],
        listStargazersForRepo: ['GET /repos/{owner}/{repo}/stargazers'],
        listWatchedReposForAuthenticatedUser: ['GET /user/subscriptions'],
        listWatchersForRepo: ['GET /repos/{owner}/{repo}/subscribers'],
        markNotificationsAsRead: ['PUT /notifications'],
        markRepoNotificationsAsRead: ['PUT /repos/{owner}/{repo}/notifications'],
        markThreadAsRead: ['PATCH /notifications/threads/{thread_id}'],
        setRepoSubscription: ['PUT /repos/{owner}/{repo}/subscription'],
        setThreadSubscription: ['PUT /notifications/threads/{thread_id}/subscription'],
        starRepoForAuthenticatedUser: ['PUT /user/starred/{owner}/{repo}'],
        unstarRepoForAuthenticatedUser: ['DELETE /user/starred/{owner}/{repo}']
      },
      apps: {
        addRepoToInstallation: ['PUT /user/installations/{installation_id}/repositories/{repository_id}'],
        checkToken: ['POST /applications/{client_id}/token'],
        createContentAttachment: [
          'POST /content_references/{content_reference_id}/attachments',
          {
            mediaType: {
              previews: ['corsair']
            }
          }
        ],
        createContentAttachmentForRepo: [
          'POST /repos/{owner}/{repo}/content_references/{content_reference_id}/attachments',
          {
            mediaType: {
              previews: ['corsair']
            }
          }
        ],
        createFromManifest: ['POST /app-manifests/{code}/conversions'],
        createInstallationAccessToken: ['POST /app/installations/{installation_id}/access_tokens'],
        deleteAuthorization: ['DELETE /applications/{client_id}/grant'],
        deleteInstallation: ['DELETE /app/installations/{installation_id}'],
        deleteToken: ['DELETE /applications/{client_id}/token'],
        getAuthenticated: ['GET /app'],
        getBySlug: ['GET /apps/{app_slug}'],
        getInstallation: ['GET /app/installations/{installation_id}'],
        getOrgInstallation: ['GET /orgs/{org}/installation'],
        getRepoInstallation: ['GET /repos/{owner}/{repo}/installation'],
        getSubscriptionPlanForAccount: ['GET /marketplace_listing/accounts/{account_id}'],
        getSubscriptionPlanForAccountStubbed: ['GET /marketplace_listing/stubbed/accounts/{account_id}'],
        getUserInstallation: ['GET /users/{username}/installation'],
        getWebhookConfigForApp: ['GET /app/hook/config'],
        getWebhookDelivery: ['GET /app/hook/deliveries/{delivery_id}'],
        listAccountsForPlan: ['GET /marketplace_listing/plans/{plan_id}/accounts'],
        listAccountsForPlanStubbed: ['GET /marketplace_listing/stubbed/plans/{plan_id}/accounts'],
        listInstallationReposForAuthenticatedUser: ['GET /user/installations/{installation_id}/repositories'],
        listInstallations: ['GET /app/installations'],
        listInstallationsForAuthenticatedUser: ['GET /user/installations'],
        listPlans: ['GET /marketplace_listing/plans'],
        listPlansStubbed: ['GET /marketplace_listing/stubbed/plans'],
        listReposAccessibleToInstallation: ['GET /installation/repositories'],
        listSubscriptionsForAuthenticatedUser: ['GET /user/marketplace_purchases'],
        listSubscriptionsForAuthenticatedUserStubbed: ['GET /user/marketplace_purchases/stubbed'],
        listWebhookDeliveries: ['GET /app/hook/deliveries'],
        redeliverWebhookDelivery: ['POST /app/hook/deliveries/{delivery_id}/attempts'],
        removeRepoFromInstallation: ['DELETE /user/installations/{installation_id}/repositories/{repository_id}'],
        resetToken: ['PATCH /applications/{client_id}/token'],
        revokeInstallationAccessToken: ['DELETE /installation/token'],
        scopeToken: ['POST /applications/{client_id}/token/scoped'],
        suspendInstallation: ['PUT /app/installations/{installation_id}/suspended'],
        unsuspendInstallation: ['DELETE /app/installations/{installation_id}/suspended'],
        updateWebhookConfigForApp: ['PATCH /app/hook/config']
      },
      billing: {
        getGithubActionsBillingOrg: ['GET /orgs/{org}/settings/billing/actions'],
        getGithubActionsBillingUser: ['GET /users/{username}/settings/billing/actions'],
        getGithubPackagesBillingOrg: ['GET /orgs/{org}/settings/billing/packages'],
        getGithubPackagesBillingUser: ['GET /users/{username}/settings/billing/packages'],
        getSharedStorageBillingOrg: ['GET /orgs/{org}/settings/billing/shared-storage'],
        getSharedStorageBillingUser: ['GET /users/{username}/settings/billing/shared-storage']
      },
      checks: {
        create: ['POST /repos/{owner}/{repo}/check-runs'],
        createSuite: ['POST /repos/{owner}/{repo}/check-suites'],
        get: ['GET /repos/{owner}/{repo}/check-runs/{check_run_id}'],
        getSuite: ['GET /repos/{owner}/{repo}/check-suites/{check_suite_id}'],
        listAnnotations: ['GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations'],
        listForRef: ['GET /repos/{owner}/{repo}/commits/{ref}/check-runs'],
        listForSuite: ['GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs'],
        listSuitesForRef: ['GET /repos/{owner}/{repo}/commits/{ref}/check-suites'],
        rerequestSuite: ['POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest'],
        setSuitesPreferences: ['PATCH /repos/{owner}/{repo}/check-suites/preferences'],
        update: ['PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}']
      },
      codeScanning: {
        deleteAnalysis: ['DELETE /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}{?confirm_delete}'],
        getAlert: [
          'GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}',
          {},
          {
            renamedParameters: {
              alert_id: 'alert_number'
            }
          }
        ],
        getAnalysis: ['GET /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}'],
        getSarif: ['GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}'],
        listAlertInstances: ['GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances'],
        listAlertsForRepo: ['GET /repos/{owner}/{repo}/code-scanning/alerts'],
        listAlertsInstances: [
          'GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances',
          {},
          {
            renamed: ['codeScanning', 'listAlertInstances']
          }
        ],
        listRecentAnalyses: ['GET /repos/{owner}/{repo}/code-scanning/analyses'],
        updateAlert: ['PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}'],
        uploadSarif: ['POST /repos/{owner}/{repo}/code-scanning/sarifs']
      },
      codesOfConduct: {
        getAllCodesOfConduct: ['GET /codes_of_conduct'],
        getConductCode: ['GET /codes_of_conduct/{key}'],
        getForRepo: [
          'GET /repos/{owner}/{repo}/community/code_of_conduct',
          {
            mediaType: {
              previews: ['scarlet-witch']
            }
          }
        ]
      },
      emojis: {
        get: ['GET /emojis']
      },
      enterpriseAdmin: {
        disableSelectedOrganizationGithubActionsEnterprise: [
          'DELETE /enterprises/{enterprise}/actions/permissions/organizations/{org_id}'
        ],
        enableSelectedOrganizationGithubActionsEnterprise: [
          'PUT /enterprises/{enterprise}/actions/permissions/organizations/{org_id}'
        ],
        getAllowedActionsEnterprise: ['GET /enterprises/{enterprise}/actions/permissions/selected-actions'],
        getGithubActionsPermissionsEnterprise: ['GET /enterprises/{enterprise}/actions/permissions'],
        listSelectedOrganizationsEnabledGithubActionsEnterprise: [
          'GET /enterprises/{enterprise}/actions/permissions/organizations'
        ],
        setAllowedActionsEnterprise: ['PUT /enterprises/{enterprise}/actions/permissions/selected-actions'],
        setGithubActionsPermissionsEnterprise: ['PUT /enterprises/{enterprise}/actions/permissions'],
        setSelectedOrganizationsEnabledGithubActionsEnterprise: [
          'PUT /enterprises/{enterprise}/actions/permissions/organizations'
        ]
      },
      gists: {
        checkIsStarred: ['GET /gists/{gist_id}/star'],
        create: ['POST /gists'],
        createComment: ['POST /gists/{gist_id}/comments'],
        delete: ['DELETE /gists/{gist_id}'],
        deleteComment: ['DELETE /gists/{gist_id}/comments/{comment_id}'],
        fork: ['POST /gists/{gist_id}/forks'],
        get: ['GET /gists/{gist_id}'],
        getComment: ['GET /gists/{gist_id}/comments/{comment_id}'],
        getRevision: ['GET /gists/{gist_id}/{sha}'],
        list: ['GET /gists'],
        listComments: ['GET /gists/{gist_id}/comments'],
        listCommits: ['GET /gists/{gist_id}/commits'],
        listForUser: ['GET /users/{username}/gists'],
        listForks: ['GET /gists/{gist_id}/forks'],
        listPublic: ['GET /gists/public'],
        listStarred: ['GET /gists/starred'],
        star: ['PUT /gists/{gist_id}/star'],
        unstar: ['DELETE /gists/{gist_id}/star'],
        update: ['PATCH /gists/{gist_id}'],
        updateComment: ['PATCH /gists/{gist_id}/comments/{comment_id}']
      },
      git: {
        createBlob: ['POST /repos/{owner}/{repo}/git/blobs'],
        createCommit: ['POST /repos/{owner}/{repo}/git/commits'],
        createRef: ['POST /repos/{owner}/{repo}/git/refs'],
        createTag: ['POST /repos/{owner}/{repo}/git/tags'],
        createTree: ['POST /repos/{owner}/{repo}/git/trees'],
        deleteRef: ['DELETE /repos/{owner}/{repo}/git/refs/{ref}'],
        getBlob: ['GET /repos/{owner}/{repo}/git/blobs/{file_sha}'],
        getCommit: ['GET /repos/{owner}/{repo}/git/commits/{commit_sha}'],
        getRef: ['GET /repos/{owner}/{repo}/git/ref/{ref}'],
        getTag: ['GET /repos/{owner}/{repo}/git/tags/{tag_sha}'],
        getTree: ['GET /repos/{owner}/{repo}/git/trees/{tree_sha}'],
        listMatchingRefs: ['GET /repos/{owner}/{repo}/git/matching-refs/{ref}'],
        updateRef: ['PATCH /repos/{owner}/{repo}/git/refs/{ref}']
      },
      gitignore: {
        getAllTemplates: ['GET /gitignore/templates'],
        getTemplate: ['GET /gitignore/templates/{name}']
      },
      interactions: {
        getRestrictionsForAuthenticatedUser: ['GET /user/interaction-limits'],
        getRestrictionsForOrg: ['GET /orgs/{org}/interaction-limits'],
        getRestrictionsForRepo: ['GET /repos/{owner}/{repo}/interaction-limits'],
        getRestrictionsForYourPublicRepos: [
          'GET /user/interaction-limits',
          {},
          {
            renamed: ['interactions', 'getRestrictionsForAuthenticatedUser']
          }
        ],
        removeRestrictionsForAuthenticatedUser: ['DELETE /user/interaction-limits'],
        removeRestrictionsForOrg: ['DELETE /orgs/{org}/interaction-limits'],
        removeRestrictionsForRepo: ['DELETE /repos/{owner}/{repo}/interaction-limits'],
        removeRestrictionsForYourPublicRepos: [
          'DELETE /user/interaction-limits',
          {},
          {
            renamed: ['interactions', 'removeRestrictionsForAuthenticatedUser']
          }
        ],
        setRestrictionsForAuthenticatedUser: ['PUT /user/interaction-limits'],
        setRestrictionsForOrg: ['PUT /orgs/{org}/interaction-limits'],
        setRestrictionsForRepo: ['PUT /repos/{owner}/{repo}/interaction-limits'],
        setRestrictionsForYourPublicRepos: [
          'PUT /user/interaction-limits',
          {},
          {
            renamed: ['interactions', 'setRestrictionsForAuthenticatedUser']
          }
        ]
      },
      issues: {
        addAssignees: ['POST /repos/{owner}/{repo}/issues/{issue_number}/assignees'],
        addLabels: ['POST /repos/{owner}/{repo}/issues/{issue_number}/labels'],
        checkUserCanBeAssigned: ['GET /repos/{owner}/{repo}/assignees/{assignee}'],
        create: ['POST /repos/{owner}/{repo}/issues'],
        createComment: ['POST /repos/{owner}/{repo}/issues/{issue_number}/comments'],
        createLabel: ['POST /repos/{owner}/{repo}/labels'],
        createMilestone: ['POST /repos/{owner}/{repo}/milestones'],
        deleteComment: ['DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}'],
        deleteLabel: ['DELETE /repos/{owner}/{repo}/labels/{name}'],
        deleteMilestone: ['DELETE /repos/{owner}/{repo}/milestones/{milestone_number}'],
        get: ['GET /repos/{owner}/{repo}/issues/{issue_number}'],
        getComment: ['GET /repos/{owner}/{repo}/issues/comments/{comment_id}'],
        getEvent: ['GET /repos/{owner}/{repo}/issues/events/{event_id}'],
        getLabel: ['GET /repos/{owner}/{repo}/labels/{name}'],
        getMilestone: ['GET /repos/{owner}/{repo}/milestones/{milestone_number}'],
        list: ['GET /issues'],
        listAssignees: ['GET /repos/{owner}/{repo}/assignees'],
        listComments: ['GET /repos/{owner}/{repo}/issues/{issue_number}/comments'],
        listCommentsForRepo: ['GET /repos/{owner}/{repo}/issues/comments'],
        listEvents: ['GET /repos/{owner}/{repo}/issues/{issue_number}/events'],
        listEventsForRepo: ['GET /repos/{owner}/{repo}/issues/events'],
        listEventsForTimeline: [
          'GET /repos/{owner}/{repo}/issues/{issue_number}/timeline',
          {
            mediaType: {
              previews: ['mockingbird']
            }
          }
        ],
        listForAuthenticatedUser: ['GET /user/issues'],
        listForOrg: ['GET /orgs/{org}/issues'],
        listForRepo: ['GET /repos/{owner}/{repo}/issues'],
        listLabelsForMilestone: ['GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels'],
        listLabelsForRepo: ['GET /repos/{owner}/{repo}/labels'],
        listLabelsOnIssue: ['GET /repos/{owner}/{repo}/issues/{issue_number}/labels'],
        listMilestones: ['GET /repos/{owner}/{repo}/milestones'],
        lock: ['PUT /repos/{owner}/{repo}/issues/{issue_number}/lock'],
        removeAllLabels: ['DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels'],
        removeAssignees: ['DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees'],
        removeLabel: ['DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}'],
        setLabels: ['PUT /repos/{owner}/{repo}/issues/{issue_number}/labels'],
        unlock: ['DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock'],
        update: ['PATCH /repos/{owner}/{repo}/issues/{issue_number}'],
        updateComment: ['PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}'],
        updateLabel: ['PATCH /repos/{owner}/{repo}/labels/{name}'],
        updateMilestone: ['PATCH /repos/{owner}/{repo}/milestones/{milestone_number}']
      },
      licenses: {
        get: ['GET /licenses/{license}'],
        getAllCommonlyUsed: ['GET /licenses'],
        getForRepo: ['GET /repos/{owner}/{repo}/license']
      },
      markdown: {
        render: ['POST /markdown'],
        renderRaw: [
          'POST /markdown/raw',
          {
            headers: {
              'content-type': 'text/plain; charset=utf-8'
            }
          }
        ]
      },
      meta: {
        get: ['GET /meta'],
        getOctocat: ['GET /octocat'],
        getZen: ['GET /zen'],
        root: ['GET /']
      },
      migrations: {
        cancelImport: ['DELETE /repos/{owner}/{repo}/import'],
        deleteArchiveForAuthenticatedUser: [
          'DELETE /user/migrations/{migration_id}/archive',
          {
            mediaType: {
              previews: ['wyandotte']
            }
          }
        ],
        deleteArchiveForOrg: [
          'DELETE /orgs/{org}/migrations/{migration_id}/archive',
          {
            mediaType: {
              previews: ['wyandotte']
            }
          }
        ],
        downloadArchiveForOrg: [
          'GET /orgs/{org}/migrations/{migration_id}/archive',
          {
            mediaType: {
              previews: ['wyandotte']
            }
          }
        ],
        getArchiveForAuthenticatedUser: [
          'GET /user/migrations/{migration_id}/archive',
          {
            mediaType: {
              previews: ['wyandotte']
            }
          }
        ],
        getCommitAuthors: ['GET /repos/{owner}/{repo}/import/authors'],
        getImportStatus: ['GET /repos/{owner}/{repo}/import'],
        getLargeFiles: ['GET /repos/{owner}/{repo}/import/large_files'],
        getStatusForAuthenticatedUser: [
          'GET /user/migrations/{migration_id}',
          {
            mediaType: {
              previews: ['wyandotte']
            }
          }
        ],
        getStatusForOrg: [
          'GET /orgs/{org}/migrations/{migration_id}',
          {
            mediaType: {
              previews: ['wyandotte']
            }
          }
        ],
        listForAuthenticatedUser: [
          'GET /user/migrations',
          {
            mediaType: {
              previews: ['wyandotte']
            }
          }
        ],
        listForOrg: [
          'GET /orgs/{org}/migrations',
          {
            mediaType: {
              previews: ['wyandotte']
            }
          }
        ],
        listReposForOrg: [
          'GET /orgs/{org}/migrations/{migration_id}/repositories',
          {
            mediaType: {
              previews: ['wyandotte']
            }
          }
        ],
        listReposForUser: [
          'GET /user/migrations/{migration_id}/repositories',
          {
            mediaType: {
              previews: ['wyandotte']
            }
          }
        ],
        mapCommitAuthor: ['PATCH /repos/{owner}/{repo}/import/authors/{author_id}'],
        setLfsPreference: ['PATCH /repos/{owner}/{repo}/import/lfs'],
        startForAuthenticatedUser: ['POST /user/migrations'],
        startForOrg: ['POST /orgs/{org}/migrations'],
        startImport: ['PUT /repos/{owner}/{repo}/import'],
        unlockRepoForAuthenticatedUser: [
          'DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock',
          {
            mediaType: {
              previews: ['wyandotte']
            }
          }
        ],
        unlockRepoForOrg: [
          'DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock',
          {
            mediaType: {
              previews: ['wyandotte']
            }
          }
        ],
        updateImport: ['PATCH /repos/{owner}/{repo}/import']
      },
      orgs: {
        blockUser: ['PUT /orgs/{org}/blocks/{username}'],
        cancelInvitation: ['DELETE /orgs/{org}/invitations/{invitation_id}'],
        checkBlockedUser: ['GET /orgs/{org}/blocks/{username}'],
        checkMembershipForUser: ['GET /orgs/{org}/members/{username}'],
        checkPublicMembershipForUser: ['GET /orgs/{org}/public_members/{username}'],
        convertMemberToOutsideCollaborator: ['PUT /orgs/{org}/outside_collaborators/{username}'],
        createInvitation: ['POST /orgs/{org}/invitations'],
        createWebhook: ['POST /orgs/{org}/hooks'],
        deleteWebhook: ['DELETE /orgs/{org}/hooks/{hook_id}'],
        get: ['GET /orgs/{org}'],
        getMembershipForAuthenticatedUser: ['GET /user/memberships/orgs/{org}'],
        getMembershipForUser: ['GET /orgs/{org}/memberships/{username}'],
        getWebhook: ['GET /orgs/{org}/hooks/{hook_id}'],
        getWebhookConfigForOrg: ['GET /orgs/{org}/hooks/{hook_id}/config'],
        getWebhookDelivery: ['GET /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}'],
        list: ['GET /organizations'],
        listAppInstallations: ['GET /orgs/{org}/installations'],
        listBlockedUsers: ['GET /orgs/{org}/blocks'],
        listFailedInvitations: ['GET /orgs/{org}/failed_invitations'],
        listForAuthenticatedUser: ['GET /user/orgs'],
        listForUser: ['GET /users/{username}/orgs'],
        listInvitationTeams: ['GET /orgs/{org}/invitations/{invitation_id}/teams'],
        listMembers: ['GET /orgs/{org}/members'],
        listMembershipsForAuthenticatedUser: ['GET /user/memberships/orgs'],
        listOutsideCollaborators: ['GET /orgs/{org}/outside_collaborators'],
        listPendingInvitations: ['GET /orgs/{org}/invitations'],
        listPublicMembers: ['GET /orgs/{org}/public_members'],
        listWebhookDeliveries: ['GET /orgs/{org}/hooks/{hook_id}/deliveries'],
        listWebhooks: ['GET /orgs/{org}/hooks'],
        pingWebhook: ['POST /orgs/{org}/hooks/{hook_id}/pings'],
        redeliverWebhookDelivery: ['POST /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts'],
        removeMember: ['DELETE /orgs/{org}/members/{username}'],
        removeMembershipForUser: ['DELETE /orgs/{org}/memberships/{username}'],
        removeOutsideCollaborator: ['DELETE /orgs/{org}/outside_collaborators/{username}'],
        removePublicMembershipForAuthenticatedUser: ['DELETE /orgs/{org}/public_members/{username}'],
        setMembershipForUser: ['PUT /orgs/{org}/memberships/{username}'],
        setPublicMembershipForAuthenticatedUser: ['PUT /orgs/{org}/public_members/{username}'],
        unblockUser: ['DELETE /orgs/{org}/blocks/{username}'],
        update: ['PATCH /orgs/{org}'],
        updateMembershipForAuthenticatedUser: ['PATCH /user/memberships/orgs/{org}'],
        updateWebhook: ['PATCH /orgs/{org}/hooks/{hook_id}'],
        updateWebhookConfigForOrg: ['PATCH /orgs/{org}/hooks/{hook_id}/config']
      },
      packages: {
        deletePackageForAuthenticatedUser: ['DELETE /user/packages/{package_type}/{package_name}'],
        deletePackageForOrg: ['DELETE /orgs/{org}/packages/{package_type}/{package_name}'],
        deletePackageVersionForAuthenticatedUser: [
          'DELETE /user/packages/{package_type}/{package_name}/versions/{package_version_id}'
        ],
        deletePackageVersionForOrg: [
          'DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}'
        ],
        getAllPackageVersionsForAPackageOwnedByAnOrg: [
          'GET /orgs/{org}/packages/{package_type}/{package_name}/versions',
          {},
          {
            renamed: ['packages', 'getAllPackageVersionsForPackageOwnedByOrg']
          }
        ],
        getAllPackageVersionsForAPackageOwnedByTheAuthenticatedUser: [
          'GET /user/packages/{package_type}/{package_name}/versions',
          {},
          {
            renamed: ['packages', 'getAllPackageVersionsForPackageOwnedByAuthenticatedUser']
          }
        ],
        getAllPackageVersionsForPackageOwnedByAuthenticatedUser: [
          'GET /user/packages/{package_type}/{package_name}/versions'
        ],
        getAllPackageVersionsForPackageOwnedByOrg: ['GET /orgs/{org}/packages/{package_type}/{package_name}/versions'],
        getAllPackageVersionsForPackageOwnedByUser: [
          'GET /users/{username}/packages/{package_type}/{package_name}/versions'
        ],
        getPackageForAuthenticatedUser: ['GET /user/packages/{package_type}/{package_name}'],
        getPackageForOrganization: ['GET /orgs/{org}/packages/{package_type}/{package_name}'],
        getPackageForUser: ['GET /users/{username}/packages/{package_type}/{package_name}'],
        getPackageVersionForAuthenticatedUser: [
          'GET /user/packages/{package_type}/{package_name}/versions/{package_version_id}'
        ],
        getPackageVersionForOrganization: [
          'GET /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}'
        ],
        getPackageVersionForUser: [
          'GET /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}'
        ],
        restorePackageForAuthenticatedUser: ['POST /user/packages/{package_type}/{package_name}/restore{?token}'],
        restorePackageForOrg: ['POST /orgs/{org}/packages/{package_type}/{package_name}/restore{?token}'],
        restorePackageVersionForAuthenticatedUser: [
          'POST /user/packages/{package_type}/{package_name}/versions/{package_version_id}/restore'
        ],
        restorePackageVersionForOrg: [
          'POST /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore'
        ]
      },
      projects: {
        addCollaborator: [
          'PUT /projects/{project_id}/collaborators/{username}',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        createCard: [
          'POST /projects/columns/{column_id}/cards',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        createColumn: [
          'POST /projects/{project_id}/columns',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        createForAuthenticatedUser: [
          'POST /user/projects',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        createForOrg: [
          'POST /orgs/{org}/projects',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        createForRepo: [
          'POST /repos/{owner}/{repo}/projects',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        delete: [
          'DELETE /projects/{project_id}',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        deleteCard: [
          'DELETE /projects/columns/cards/{card_id}',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        deleteColumn: [
          'DELETE /projects/columns/{column_id}',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        get: [
          'GET /projects/{project_id}',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        getCard: [
          'GET /projects/columns/cards/{card_id}',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        getColumn: [
          'GET /projects/columns/{column_id}',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        getPermissionForUser: [
          'GET /projects/{project_id}/collaborators/{username}/permission',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        listCards: [
          'GET /projects/columns/{column_id}/cards',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        listCollaborators: [
          'GET /projects/{project_id}/collaborators',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        listColumns: [
          'GET /projects/{project_id}/columns',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        listForOrg: [
          'GET /orgs/{org}/projects',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        listForRepo: [
          'GET /repos/{owner}/{repo}/projects',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        listForUser: [
          'GET /users/{username}/projects',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        moveCard: [
          'POST /projects/columns/cards/{card_id}/moves',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        moveColumn: [
          'POST /projects/columns/{column_id}/moves',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        removeCollaborator: [
          'DELETE /projects/{project_id}/collaborators/{username}',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        update: [
          'PATCH /projects/{project_id}',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        updateCard: [
          'PATCH /projects/columns/cards/{card_id}',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        updateColumn: [
          'PATCH /projects/columns/{column_id}',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ]
      },
      pulls: {
        checkIfMerged: ['GET /repos/{owner}/{repo}/pulls/{pull_number}/merge'],
        create: ['POST /repos/{owner}/{repo}/pulls'],
        createReplyForReviewComment: ['POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies'],
        createReview: ['POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews'],
        createReviewComment: ['POST /repos/{owner}/{repo}/pulls/{pull_number}/comments'],
        deletePendingReview: ['DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}'],
        deleteReviewComment: ['DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}'],
        dismissReview: ['PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals'],
        get: ['GET /repos/{owner}/{repo}/pulls/{pull_number}'],
        getReview: ['GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}'],
        getReviewComment: ['GET /repos/{owner}/{repo}/pulls/comments/{comment_id}'],
        list: ['GET /repos/{owner}/{repo}/pulls'],
        listCommentsForReview: ['GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments'],
        listCommits: ['GET /repos/{owner}/{repo}/pulls/{pull_number}/commits'],
        listFiles: ['GET /repos/{owner}/{repo}/pulls/{pull_number}/files'],
        listRequestedReviewers: ['GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers'],
        listReviewComments: ['GET /repos/{owner}/{repo}/pulls/{pull_number}/comments'],
        listReviewCommentsForRepo: ['GET /repos/{owner}/{repo}/pulls/comments'],
        listReviews: ['GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews'],
        merge: ['PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge'],
        removeRequestedReviewers: ['DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers'],
        requestReviewers: ['POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers'],
        submitReview: ['POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events'],
        update: ['PATCH /repos/{owner}/{repo}/pulls/{pull_number}'],
        updateBranch: [
          'PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch',
          {
            mediaType: {
              previews: ['lydian']
            }
          }
        ],
        updateReview: ['PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}'],
        updateReviewComment: ['PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}']
      },
      rateLimit: {
        get: ['GET /rate_limit']
      },
      reactions: {
        createForCommitComment: [
          'POST /repos/{owner}/{repo}/comments/{comment_id}/reactions',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        createForIssue: [
          'POST /repos/{owner}/{repo}/issues/{issue_number}/reactions',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        createForIssueComment: [
          'POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        createForPullRequestReviewComment: [
          'POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        createForRelease: [
          'POST /repos/{owner}/{repo}/releases/{release_id}/reactions',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        createForTeamDiscussionCommentInOrg: [
          'POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        createForTeamDiscussionInOrg: [
          'POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        deleteForCommitComment: [
          'DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        deleteForIssue: [
          'DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        deleteForIssueComment: [
          'DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        deleteForPullRequestComment: [
          'DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        deleteForTeamDiscussion: [
          'DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        deleteForTeamDiscussionComment: [
          'DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        deleteLegacy: [
          'DELETE /reactions/{reaction_id}',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          },
          {
            deprecated:
              'octokit.rest.reactions.deleteLegacy() is deprecated, see https://docs.github.com/rest/reference/reactions/#delete-a-reaction-legacy'
          }
        ],
        listForCommitComment: [
          'GET /repos/{owner}/{repo}/comments/{comment_id}/reactions',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        listForIssue: [
          'GET /repos/{owner}/{repo}/issues/{issue_number}/reactions',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        listForIssueComment: [
          'GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        listForPullRequestReviewComment: [
          'GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        listForTeamDiscussionCommentInOrg: [
          'GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ],
        listForTeamDiscussionInOrg: [
          'GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions',
          {
            mediaType: {
              previews: ['squirrel-girl']
            }
          }
        ]
      },
      repos: {
        acceptInvitation: ['PATCH /user/repository_invitations/{invitation_id}'],
        addAppAccessRestrictions: [
          'POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps',
          {},
          {
            mapToData: 'apps'
          }
        ],
        addCollaborator: ['PUT /repos/{owner}/{repo}/collaborators/{username}'],
        addStatusCheckContexts: [
          'POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts',
          {},
          {
            mapToData: 'contexts'
          }
        ],
        addTeamAccessRestrictions: [
          'POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams',
          {},
          {
            mapToData: 'teams'
          }
        ],
        addUserAccessRestrictions: [
          'POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users',
          {},
          {
            mapToData: 'users'
          }
        ],
        checkCollaborator: ['GET /repos/{owner}/{repo}/collaborators/{username}'],
        checkVulnerabilityAlerts: [
          'GET /repos/{owner}/{repo}/vulnerability-alerts',
          {
            mediaType: {
              previews: ['dorian']
            }
          }
        ],
        compareCommits: ['GET /repos/{owner}/{repo}/compare/{base}...{head}'],
        compareCommitsWithBasehead: ['GET /repos/{owner}/{repo}/compare/{basehead}'],
        createCommitComment: ['POST /repos/{owner}/{repo}/commits/{commit_sha}/comments'],
        createCommitSignatureProtection: [
          'POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures',
          {
            mediaType: {
              previews: ['zzzax']
            }
          }
        ],
        createCommitStatus: ['POST /repos/{owner}/{repo}/statuses/{sha}'],
        createDeployKey: ['POST /repos/{owner}/{repo}/keys'],
        createDeployment: ['POST /repos/{owner}/{repo}/deployments'],
        createDeploymentStatus: ['POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses'],
        createDispatchEvent: ['POST /repos/{owner}/{repo}/dispatches'],
        createForAuthenticatedUser: ['POST /user/repos'],
        createFork: ['POST /repos/{owner}/{repo}/forks'],
        createInOrg: ['POST /orgs/{org}/repos'],
        createOrUpdateEnvironment: ['PUT /repos/{owner}/{repo}/environments/{environment_name}'],
        createOrUpdateFileContents: ['PUT /repos/{owner}/{repo}/contents/{path}'],
        createPagesSite: [
          'POST /repos/{owner}/{repo}/pages',
          {
            mediaType: {
              previews: ['switcheroo']
            }
          }
        ],
        createRelease: ['POST /repos/{owner}/{repo}/releases'],
        createUsingTemplate: [
          'POST /repos/{template_owner}/{template_repo}/generate',
          {
            mediaType: {
              previews: ['baptiste']
            }
          }
        ],
        createWebhook: ['POST /repos/{owner}/{repo}/hooks'],
        declineInvitation: ['DELETE /user/repository_invitations/{invitation_id}'],
        delete: ['DELETE /repos/{owner}/{repo}'],
        deleteAccessRestrictions: ['DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions'],
        deleteAdminBranchProtection: ['DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins'],
        deleteAnEnvironment: ['DELETE /repos/{owner}/{repo}/environments/{environment_name}'],
        deleteBranchProtection: ['DELETE /repos/{owner}/{repo}/branches/{branch}/protection'],
        deleteCommitComment: ['DELETE /repos/{owner}/{repo}/comments/{comment_id}'],
        deleteCommitSignatureProtection: [
          'DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures',
          {
            mediaType: {
              previews: ['zzzax']
            }
          }
        ],
        deleteDeployKey: ['DELETE /repos/{owner}/{repo}/keys/{key_id}'],
        deleteDeployment: ['DELETE /repos/{owner}/{repo}/deployments/{deployment_id}'],
        deleteFile: ['DELETE /repos/{owner}/{repo}/contents/{path}'],
        deleteInvitation: ['DELETE /repos/{owner}/{repo}/invitations/{invitation_id}'],
        deletePagesSite: [
          'DELETE /repos/{owner}/{repo}/pages',
          {
            mediaType: {
              previews: ['switcheroo']
            }
          }
        ],
        deletePullRequestReviewProtection: [
          'DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews'
        ],
        deleteRelease: ['DELETE /repos/{owner}/{repo}/releases/{release_id}'],
        deleteReleaseAsset: ['DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}'],
        deleteWebhook: ['DELETE /repos/{owner}/{repo}/hooks/{hook_id}'],
        disableAutomatedSecurityFixes: [
          'DELETE /repos/{owner}/{repo}/automated-security-fixes',
          {
            mediaType: {
              previews: ['london']
            }
          }
        ],
        disableVulnerabilityAlerts: [
          'DELETE /repos/{owner}/{repo}/vulnerability-alerts',
          {
            mediaType: {
              previews: ['dorian']
            }
          }
        ],
        downloadArchive: [
          'GET /repos/{owner}/{repo}/zipball/{ref}',
          {},
          {
            renamed: ['repos', 'downloadZipballArchive']
          }
        ],
        downloadTarballArchive: ['GET /repos/{owner}/{repo}/tarball/{ref}'],
        downloadZipballArchive: ['GET /repos/{owner}/{repo}/zipball/{ref}'],
        enableAutomatedSecurityFixes: [
          'PUT /repos/{owner}/{repo}/automated-security-fixes',
          {
            mediaType: {
              previews: ['london']
            }
          }
        ],
        enableVulnerabilityAlerts: [
          'PUT /repos/{owner}/{repo}/vulnerability-alerts',
          {
            mediaType: {
              previews: ['dorian']
            }
          }
        ],
        get: ['GET /repos/{owner}/{repo}'],
        getAccessRestrictions: ['GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions'],
        getAdminBranchProtection: ['GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins'],
        getAllEnvironments: ['GET /repos/{owner}/{repo}/environments'],
        getAllStatusCheckContexts: [
          'GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts'
        ],
        getAllTopics: [
          'GET /repos/{owner}/{repo}/topics',
          {
            mediaType: {
              previews: ['mercy']
            }
          }
        ],
        getAppsWithAccessToProtectedBranch: ['GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps'],
        getBranch: ['GET /repos/{owner}/{repo}/branches/{branch}'],
        getBranchProtection: ['GET /repos/{owner}/{repo}/branches/{branch}/protection'],
        getClones: ['GET /repos/{owner}/{repo}/traffic/clones'],
        getCodeFrequencyStats: ['GET /repos/{owner}/{repo}/stats/code_frequency'],
        getCollaboratorPermissionLevel: ['GET /repos/{owner}/{repo}/collaborators/{username}/permission'],
        getCombinedStatusForRef: ['GET /repos/{owner}/{repo}/commits/{ref}/status'],
        getCommit: ['GET /repos/{owner}/{repo}/commits/{ref}'],
        getCommitActivityStats: ['GET /repos/{owner}/{repo}/stats/commit_activity'],
        getCommitComment: ['GET /repos/{owner}/{repo}/comments/{comment_id}'],
        getCommitSignatureProtection: [
          'GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures',
          {
            mediaType: {
              previews: ['zzzax']
            }
          }
        ],
        getCommunityProfileMetrics: ['GET /repos/{owner}/{repo}/community/profile'],
        getContent: ['GET /repos/{owner}/{repo}/contents/{path}'],
        getContributorsStats: ['GET /repos/{owner}/{repo}/stats/contributors'],
        getDeployKey: ['GET /repos/{owner}/{repo}/keys/{key_id}'],
        getDeployment: ['GET /repos/{owner}/{repo}/deployments/{deployment_id}'],
        getDeploymentStatus: ['GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}'],
        getEnvironment: ['GET /repos/{owner}/{repo}/environments/{environment_name}'],
        getLatestPagesBuild: ['GET /repos/{owner}/{repo}/pages/builds/latest'],
        getLatestRelease: ['GET /repos/{owner}/{repo}/releases/latest'],
        getPages: ['GET /repos/{owner}/{repo}/pages'],
        getPagesBuild: ['GET /repos/{owner}/{repo}/pages/builds/{build_id}'],
        getPagesHealthCheck: ['GET /repos/{owner}/{repo}/pages/health'],
        getParticipationStats: ['GET /repos/{owner}/{repo}/stats/participation'],
        getPullRequestReviewProtection: [
          'GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews'
        ],
        getPunchCardStats: ['GET /repos/{owner}/{repo}/stats/punch_card'],
        getReadme: ['GET /repos/{owner}/{repo}/readme'],
        getReadmeInDirectory: ['GET /repos/{owner}/{repo}/readme/{dir}'],
        getRelease: ['GET /repos/{owner}/{repo}/releases/{release_id}'],
        getReleaseAsset: ['GET /repos/{owner}/{repo}/releases/assets/{asset_id}'],
        getReleaseByTag: ['GET /repos/{owner}/{repo}/releases/tags/{tag}'],
        getStatusChecksProtection: ['GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks'],
        getTeamsWithAccessToProtectedBranch: ['GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams'],
        getTopPaths: ['GET /repos/{owner}/{repo}/traffic/popular/paths'],
        getTopReferrers: ['GET /repos/{owner}/{repo}/traffic/popular/referrers'],
        getUsersWithAccessToProtectedBranch: ['GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users'],
        getViews: ['GET /repos/{owner}/{repo}/traffic/views'],
        getWebhook: ['GET /repos/{owner}/{repo}/hooks/{hook_id}'],
        getWebhookConfigForRepo: ['GET /repos/{owner}/{repo}/hooks/{hook_id}/config'],
        getWebhookDelivery: ['GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}'],
        listBranches: ['GET /repos/{owner}/{repo}/branches'],
        listBranchesForHeadCommit: [
          'GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head',
          {
            mediaType: {
              previews: ['groot']
            }
          }
        ],
        listCollaborators: ['GET /repos/{owner}/{repo}/collaborators'],
        listCommentsForCommit: ['GET /repos/{owner}/{repo}/commits/{commit_sha}/comments'],
        listCommitCommentsForRepo: ['GET /repos/{owner}/{repo}/comments'],
        listCommitStatusesForRef: ['GET /repos/{owner}/{repo}/commits/{ref}/statuses'],
        listCommits: ['GET /repos/{owner}/{repo}/commits'],
        listContributors: ['GET /repos/{owner}/{repo}/contributors'],
        listDeployKeys: ['GET /repos/{owner}/{repo}/keys'],
        listDeploymentStatuses: ['GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses'],
        listDeployments: ['GET /repos/{owner}/{repo}/deployments'],
        listForAuthenticatedUser: ['GET /user/repos'],
        listForOrg: ['GET /orgs/{org}/repos'],
        listForUser: ['GET /users/{username}/repos'],
        listForks: ['GET /repos/{owner}/{repo}/forks'],
        listInvitations: ['GET /repos/{owner}/{repo}/invitations'],
        listInvitationsForAuthenticatedUser: ['GET /user/repository_invitations'],
        listLanguages: ['GET /repos/{owner}/{repo}/languages'],
        listPagesBuilds: ['GET /repos/{owner}/{repo}/pages/builds'],
        listPublic: ['GET /repositories'],
        listPullRequestsAssociatedWithCommit: [
          'GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls',
          {
            mediaType: {
              previews: ['groot']
            }
          }
        ],
        listReleaseAssets: ['GET /repos/{owner}/{repo}/releases/{release_id}/assets'],
        listReleases: ['GET /repos/{owner}/{repo}/releases'],
        listTags: ['GET /repos/{owner}/{repo}/tags'],
        listTeams: ['GET /repos/{owner}/{repo}/teams'],
        listWebhookDeliveries: ['GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries'],
        listWebhooks: ['GET /repos/{owner}/{repo}/hooks'],
        merge: ['POST /repos/{owner}/{repo}/merges'],
        pingWebhook: ['POST /repos/{owner}/{repo}/hooks/{hook_id}/pings'],
        redeliverWebhookDelivery: ['POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts'],
        removeAppAccessRestrictions: [
          'DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps',
          {},
          {
            mapToData: 'apps'
          }
        ],
        removeCollaborator: ['DELETE /repos/{owner}/{repo}/collaborators/{username}'],
        removeStatusCheckContexts: [
          'DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts',
          {},
          {
            mapToData: 'contexts'
          }
        ],
        removeStatusCheckProtection: ['DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks'],
        removeTeamAccessRestrictions: [
          'DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams',
          {},
          {
            mapToData: 'teams'
          }
        ],
        removeUserAccessRestrictions: [
          'DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users',
          {},
          {
            mapToData: 'users'
          }
        ],
        renameBranch: ['POST /repos/{owner}/{repo}/branches/{branch}/rename'],
        replaceAllTopics: [
          'PUT /repos/{owner}/{repo}/topics',
          {
            mediaType: {
              previews: ['mercy']
            }
          }
        ],
        requestPagesBuild: ['POST /repos/{owner}/{repo}/pages/builds'],
        setAdminBranchProtection: ['POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins'],
        setAppAccessRestrictions: [
          'PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps',
          {},
          {
            mapToData: 'apps'
          }
        ],
        setStatusCheckContexts: [
          'PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts',
          {},
          {
            mapToData: 'contexts'
          }
        ],
        setTeamAccessRestrictions: [
          'PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams',
          {},
          {
            mapToData: 'teams'
          }
        ],
        setUserAccessRestrictions: [
          'PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users',
          {},
          {
            mapToData: 'users'
          }
        ],
        testPushWebhook: ['POST /repos/{owner}/{repo}/hooks/{hook_id}/tests'],
        transfer: ['POST /repos/{owner}/{repo}/transfer'],
        update: ['PATCH /repos/{owner}/{repo}'],
        updateBranchProtection: ['PUT /repos/{owner}/{repo}/branches/{branch}/protection'],
        updateCommitComment: ['PATCH /repos/{owner}/{repo}/comments/{comment_id}'],
        updateInformationAboutPagesSite: ['PUT /repos/{owner}/{repo}/pages'],
        updateInvitation: ['PATCH /repos/{owner}/{repo}/invitations/{invitation_id}'],
        updatePullRequestReviewProtection: [
          'PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews'
        ],
        updateRelease: ['PATCH /repos/{owner}/{repo}/releases/{release_id}'],
        updateReleaseAsset: ['PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}'],
        updateStatusCheckPotection: [
          'PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks',
          {},
          {
            renamed: ['repos', 'updateStatusCheckProtection']
          }
        ],
        updateStatusCheckProtection: ['PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks'],
        updateWebhook: ['PATCH /repos/{owner}/{repo}/hooks/{hook_id}'],
        updateWebhookConfigForRepo: ['PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config'],
        uploadReleaseAsset: [
          'POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}',
          {
            baseUrl: 'https://uploads.github.com'
          }
        ]
      },
      search: {
        code: ['GET /search/code'],
        commits: [
          'GET /search/commits',
          {
            mediaType: {
              previews: ['cloak']
            }
          }
        ],
        issuesAndPullRequests: ['GET /search/issues'],
        labels: ['GET /search/labels'],
        repos: ['GET /search/repositories'],
        topics: [
          'GET /search/topics',
          {
            mediaType: {
              previews: ['mercy']
            }
          }
        ],
        users: ['GET /search/users']
      },
      secretScanning: {
        getAlert: ['GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}'],
        listAlertsForRepo: ['GET /repos/{owner}/{repo}/secret-scanning/alerts'],
        updateAlert: ['PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}']
      },
      teams: {
        addOrUpdateMembershipForUserInOrg: ['PUT /orgs/{org}/teams/{team_slug}/memberships/{username}'],
        addOrUpdateProjectPermissionsInOrg: [
          'PUT /orgs/{org}/teams/{team_slug}/projects/{project_id}',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        addOrUpdateRepoPermissionsInOrg: ['PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}'],
        checkPermissionsForProjectInOrg: [
          'GET /orgs/{org}/teams/{team_slug}/projects/{project_id}',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        checkPermissionsForRepoInOrg: ['GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}'],
        create: ['POST /orgs/{org}/teams'],
        createDiscussionCommentInOrg: ['POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments'],
        createDiscussionInOrg: ['POST /orgs/{org}/teams/{team_slug}/discussions'],
        deleteDiscussionCommentInOrg: [
          'DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}'
        ],
        deleteDiscussionInOrg: ['DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}'],
        deleteInOrg: ['DELETE /orgs/{org}/teams/{team_slug}'],
        getByName: ['GET /orgs/{org}/teams/{team_slug}'],
        getDiscussionCommentInOrg: [
          'GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}'
        ],
        getDiscussionInOrg: ['GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}'],
        getMembershipForUserInOrg: ['GET /orgs/{org}/teams/{team_slug}/memberships/{username}'],
        list: ['GET /orgs/{org}/teams'],
        listChildInOrg: ['GET /orgs/{org}/teams/{team_slug}/teams'],
        listDiscussionCommentsInOrg: ['GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments'],
        listDiscussionsInOrg: ['GET /orgs/{org}/teams/{team_slug}/discussions'],
        listForAuthenticatedUser: ['GET /user/teams'],
        listMembersInOrg: ['GET /orgs/{org}/teams/{team_slug}/members'],
        listPendingInvitationsInOrg: ['GET /orgs/{org}/teams/{team_slug}/invitations'],
        listProjectsInOrg: [
          'GET /orgs/{org}/teams/{team_slug}/projects',
          {
            mediaType: {
              previews: ['inertia']
            }
          }
        ],
        listReposInOrg: ['GET /orgs/{org}/teams/{team_slug}/repos'],
        removeMembershipForUserInOrg: ['DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}'],
        removeProjectInOrg: ['DELETE /orgs/{org}/teams/{team_slug}/projects/{project_id}'],
        removeRepoInOrg: ['DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}'],
        updateDiscussionCommentInOrg: [
          'PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}'
        ],
        updateDiscussionInOrg: ['PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}'],
        updateInOrg: ['PATCH /orgs/{org}/teams/{team_slug}']
      },
      users: {
        addEmailForAuthenticated: ['POST /user/emails'],
        block: ['PUT /user/blocks/{username}'],
        checkBlocked: ['GET /user/blocks/{username}'],
        checkFollowingForUser: ['GET /users/{username}/following/{target_user}'],
        checkPersonIsFollowedByAuthenticated: ['GET /user/following/{username}'],
        createGpgKeyForAuthenticated: ['POST /user/gpg_keys'],
        createPublicSshKeyForAuthenticated: ['POST /user/keys'],
        deleteEmailForAuthenticated: ['DELETE /user/emails'],
        deleteGpgKeyForAuthenticated: ['DELETE /user/gpg_keys/{gpg_key_id}'],
        deletePublicSshKeyForAuthenticated: ['DELETE /user/keys/{key_id}'],
        follow: ['PUT /user/following/{username}'],
        getAuthenticated: ['GET /user'],
        getByUsername: ['GET /users/{username}'],
        getContextForUser: ['GET /users/{username}/hovercard'],
        getGpgKeyForAuthenticated: ['GET /user/gpg_keys/{gpg_key_id}'],
        getPublicSshKeyForAuthenticated: ['GET /user/keys/{key_id}'],
        list: ['GET /users'],
        listBlockedByAuthenticated: ['GET /user/blocks'],
        listEmailsForAuthenticated: ['GET /user/emails'],
        listFollowedByAuthenticated: ['GET /user/following'],
        listFollowersForAuthenticatedUser: ['GET /user/followers'],
        listFollowersForUser: ['GET /users/{username}/followers'],
        listFollowingForUser: ['GET /users/{username}/following'],
        listGpgKeysForAuthenticated: ['GET /user/gpg_keys'],
        listGpgKeysForUser: ['GET /users/{username}/gpg_keys'],
        listPublicEmailsForAuthenticated: ['GET /user/public_emails'],
        listPublicKeysForUser: ['GET /users/{username}/keys'],
        listPublicSshKeysForAuthenticated: ['GET /user/keys'],
        setPrimaryEmailVisibilityForAuthenticated: ['PATCH /user/email/visibility'],
        unblock: ['DELETE /user/blocks/{username}'],
        unfollow: ['DELETE /user/following/{username}'],
        updateAuthenticated: ['PATCH /user']
      }
    };
    var VERSION = '5.4.2';
    function endpointsToMethods(octokit, endpointsMap) {
      const newMethods = {};
      for (const [scope, endpoints] of Object.entries(endpointsMap)) {
        for (const [methodName, endpoint] of Object.entries(endpoints)) {
          const [route, defaults, decorations] = endpoint;
          const [method, url] = route.split(/ /);
          const endpointDefaults = Object.assign(
            {
              method,
              url
            },
            defaults
          );
          if (!newMethods[scope]) {
            newMethods[scope] = {};
          }
          const scopeMethods = newMethods[scope];
          if (decorations) {
            scopeMethods[methodName] = decorate(octokit, scope, methodName, endpointDefaults, decorations);
            continue;
          }
          scopeMethods[methodName] = octokit.request.defaults(endpointDefaults);
        }
      }
      return newMethods;
    }
    function decorate(octokit, scope, methodName, defaults, decorations) {
      const requestWithDefaults = octokit.request.defaults(defaults);
      function withDecorations(...args) {
        let options = requestWithDefaults.endpoint.merge(...args);
        if (decorations.mapToData) {
          options = Object.assign({}, options, {
            data: options[decorations.mapToData],
            [decorations.mapToData]: void 0
          });
          return requestWithDefaults(options);
        }
        if (decorations.renamed) {
          const [newScope, newMethodName] = decorations.renamed;
          octokit.log.warn(`octokit.${scope}.${methodName}() has been renamed to octokit.${newScope}.${newMethodName}()`);
        }
        if (decorations.deprecated) {
          octokit.log.warn(decorations.deprecated);
        }
        if (decorations.renamedParameters) {
          const options2 = requestWithDefaults.endpoint.merge(...args);
          for (const [name, alias] of Object.entries(decorations.renamedParameters)) {
            if (name in options2) {
              octokit.log.warn(
                `"${name}" parameter is deprecated for "octokit.${scope}.${methodName}()". Use "${alias}" instead`
              );
              if (!(alias in options2)) {
                options2[alias] = options2[name];
              }
              delete options2[name];
            }
          }
          return requestWithDefaults(options2);
        }
        return requestWithDefaults(...args);
      }
      return Object.assign(withDecorations, requestWithDefaults);
    }
    function restEndpointMethods(octokit) {
      const api = endpointsToMethods(octokit, Endpoints);
      return {
        rest: api
      };
    }
    restEndpointMethods.VERSION = VERSION;
    function legacyRestEndpointMethods(octokit) {
      const api = endpointsToMethods(octokit, Endpoints);
      return _objectSpread2(
        _objectSpread2({}, api),
        {},
        {
          rest: api
        }
      );
    }
    legacyRestEndpointMethods.VERSION = VERSION;
    exports2.legacyRestEndpointMethods = legacyRestEndpointMethods;
    exports2.restEndpointMethods = restEndpointMethods;
  }
});

// node_modules/@octokit/plugin-paginate-rest/dist-node/index.js
var require_dist_node10 = __commonJS({
  'node_modules/@octokit/plugin-paginate-rest/dist-node/index.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    var VERSION = '2.14.0';
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
          symbols = symbols.filter(function (sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          });
        }
        keys.push.apply(keys, symbols);
      }
      return keys;
    }
    function _objectSpread2(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};
        if (i % 2) {
          ownKeys(Object(source), true).forEach(function (key) {
            _defineProperty(target, key, source[key]);
          });
        } else if (Object.getOwnPropertyDescriptors) {
          Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
          ownKeys(Object(source)).forEach(function (key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
      }
      return target;
    }
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    function normalizePaginatedListResponse(response) {
      if (!response.data) {
        return _objectSpread2(
          _objectSpread2({}, response),
          {},
          {
            data: []
          }
        );
      }
      const responseNeedsNormalization = 'total_count' in response.data && !('url' in response.data);
      if (!responseNeedsNormalization) return response;
      const incompleteResults = response.data.incomplete_results;
      const repositorySelection = response.data.repository_selection;
      const totalCount = response.data.total_count;
      delete response.data.incomplete_results;
      delete response.data.repository_selection;
      delete response.data.total_count;
      const namespaceKey = Object.keys(response.data)[0];
      const data = response.data[namespaceKey];
      response.data = data;
      if (typeof incompleteResults !== 'undefined') {
        response.data.incomplete_results = incompleteResults;
      }
      if (typeof repositorySelection !== 'undefined') {
        response.data.repository_selection = repositorySelection;
      }
      response.data.total_count = totalCount;
      return response;
    }
    function iterator(octokit, route, parameters) {
      const options = typeof route === 'function' ? route.endpoint(parameters) : octokit.request.endpoint(route, parameters);
      const requestMethod = typeof route === 'function' ? route : octokit.request;
      const method = options.method;
      const headers = options.headers;
      let url = options.url;
      return {
        [Symbol.asyncIterator]: () => ({
          async next() {
            if (!url)
              return {
                done: true
              };
            try {
              const response = await requestMethod({
                method,
                url,
                headers
              });
              const normalizedResponse = normalizePaginatedListResponse(response);
              url = ((normalizedResponse.headers.link || '').match(/<([^>]+)>;\s*rel="next"/) || [])[1];
              return {
                value: normalizedResponse
              };
            } catch (error) {
              if (error.status !== 409) throw error;
              url = '';
              return {
                value: {
                  status: 200,
                  headers: {},
                  data: []
                }
              };
            }
          }
        })
      };
    }
    function paginate(octokit, route, parameters, mapFn) {
      if (typeof parameters === 'function') {
        mapFn = parameters;
        parameters = void 0;
      }
      return gather(octokit, [], iterator(octokit, route, parameters)[Symbol.asyncIterator](), mapFn);
    }
    function gather(octokit, results, iterator2, mapFn) {
      return iterator2.next().then(result => {
        if (result.done) {
          return results;
        }
        let earlyExit = false;
        function done() {
          earlyExit = true;
        }
        results = results.concat(mapFn ? mapFn(result.value, done) : result.value.data);
        if (earlyExit) {
          return results;
        }
        return gather(octokit, results, iterator2, mapFn);
      });
    }
    var composePaginateRest = Object.assign(paginate, {
      iterator
    });
    var paginatingEndpoints = [
      'GET /app/hook/deliveries',
      'GET /app/installations',
      'GET /applications/grants',
      'GET /authorizations',
      'GET /enterprises/{enterprise}/actions/permissions/organizations',
      'GET /enterprises/{enterprise}/actions/runner-groups',
      'GET /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/organizations',
      'GET /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/runners',
      'GET /enterprises/{enterprise}/actions/runners',
      'GET /enterprises/{enterprise}/actions/runners/downloads',
      'GET /events',
      'GET /gists',
      'GET /gists/public',
      'GET /gists/starred',
      'GET /gists/{gist_id}/comments',
      'GET /gists/{gist_id}/commits',
      'GET /gists/{gist_id}/forks',
      'GET /installation/repositories',
      'GET /issues',
      'GET /marketplace_listing/plans',
      'GET /marketplace_listing/plans/{plan_id}/accounts',
      'GET /marketplace_listing/stubbed/plans',
      'GET /marketplace_listing/stubbed/plans/{plan_id}/accounts',
      'GET /networks/{owner}/{repo}/events',
      'GET /notifications',
      'GET /organizations',
      'GET /orgs/{org}/actions/permissions/repositories',
      'GET /orgs/{org}/actions/runner-groups',
      'GET /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories',
      'GET /orgs/{org}/actions/runner-groups/{runner_group_id}/runners',
      'GET /orgs/{org}/actions/runners',
      'GET /orgs/{org}/actions/runners/downloads',
      'GET /orgs/{org}/actions/secrets',
      'GET /orgs/{org}/actions/secrets/{secret_name}/repositories',
      'GET /orgs/{org}/blocks',
      'GET /orgs/{org}/credential-authorizations',
      'GET /orgs/{org}/events',
      'GET /orgs/{org}/failed_invitations',
      'GET /orgs/{org}/hooks',
      'GET /orgs/{org}/hooks/{hook_id}/deliveries',
      'GET /orgs/{org}/installations',
      'GET /orgs/{org}/invitations',
      'GET /orgs/{org}/invitations/{invitation_id}/teams',
      'GET /orgs/{org}/issues',
      'GET /orgs/{org}/members',
      'GET /orgs/{org}/migrations',
      'GET /orgs/{org}/migrations/{migration_id}/repositories',
      'GET /orgs/{org}/outside_collaborators',
      'GET /orgs/{org}/projects',
      'GET /orgs/{org}/public_members',
      'GET /orgs/{org}/repos',
      'GET /orgs/{org}/team-sync/groups',
      'GET /orgs/{org}/teams',
      'GET /orgs/{org}/teams/{team_slug}/discussions',
      'GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments',
      'GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions',
      'GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions',
      'GET /orgs/{org}/teams/{team_slug}/invitations',
      'GET /orgs/{org}/teams/{team_slug}/members',
      'GET /orgs/{org}/teams/{team_slug}/projects',
      'GET /orgs/{org}/teams/{team_slug}/repos',
      'GET /orgs/{org}/teams/{team_slug}/team-sync/group-mappings',
      'GET /orgs/{org}/teams/{team_slug}/teams',
      'GET /projects/columns/{column_id}/cards',
      'GET /projects/{project_id}/collaborators',
      'GET /projects/{project_id}/columns',
      'GET /repos/{owner}/{repo}/actions/artifacts',
      'GET /repos/{owner}/{repo}/actions/runners',
      'GET /repos/{owner}/{repo}/actions/runners/downloads',
      'GET /repos/{owner}/{repo}/actions/runs',
      'GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts',
      'GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs',
      'GET /repos/{owner}/{repo}/actions/secrets',
      'GET /repos/{owner}/{repo}/actions/workflows',
      'GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs',
      'GET /repos/{owner}/{repo}/assignees',
      'GET /repos/{owner}/{repo}/branches',
      'GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations',
      'GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs',
      'GET /repos/{owner}/{repo}/code-scanning/alerts',
      'GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances',
      'GET /repos/{owner}/{repo}/code-scanning/analyses',
      'GET /repos/{owner}/{repo}/collaborators',
      'GET /repos/{owner}/{repo}/comments',
      'GET /repos/{owner}/{repo}/comments/{comment_id}/reactions',
      'GET /repos/{owner}/{repo}/commits',
      'GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head',
      'GET /repos/{owner}/{repo}/commits/{commit_sha}/comments',
      'GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls',
      'GET /repos/{owner}/{repo}/commits/{ref}/check-runs',
      'GET /repos/{owner}/{repo}/commits/{ref}/check-suites',
      'GET /repos/{owner}/{repo}/commits/{ref}/statuses',
      'GET /repos/{owner}/{repo}/contributors',
      'GET /repos/{owner}/{repo}/deployments',
      'GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses',
      'GET /repos/{owner}/{repo}/events',
      'GET /repos/{owner}/{repo}/forks',
      'GET /repos/{owner}/{repo}/git/matching-refs/{ref}',
      'GET /repos/{owner}/{repo}/hooks',
      'GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries',
      'GET /repos/{owner}/{repo}/invitations',
      'GET /repos/{owner}/{repo}/issues',
      'GET /repos/{owner}/{repo}/issues/comments',
      'GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions',
      'GET /repos/{owner}/{repo}/issues/events',
      'GET /repos/{owner}/{repo}/issues/{issue_number}/comments',
      'GET /repos/{owner}/{repo}/issues/{issue_number}/events',
      'GET /repos/{owner}/{repo}/issues/{issue_number}/labels',
      'GET /repos/{owner}/{repo}/issues/{issue_number}/reactions',
      'GET /repos/{owner}/{repo}/issues/{issue_number}/timeline',
      'GET /repos/{owner}/{repo}/keys',
      'GET /repos/{owner}/{repo}/labels',
      'GET /repos/{owner}/{repo}/milestones',
      'GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels',
      'GET /repos/{owner}/{repo}/notifications',
      'GET /repos/{owner}/{repo}/pages/builds',
      'GET /repos/{owner}/{repo}/projects',
      'GET /repos/{owner}/{repo}/pulls',
      'GET /repos/{owner}/{repo}/pulls/comments',
      'GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions',
      'GET /repos/{owner}/{repo}/pulls/{pull_number}/comments',
      'GET /repos/{owner}/{repo}/pulls/{pull_number}/commits',
      'GET /repos/{owner}/{repo}/pulls/{pull_number}/files',
      'GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers',
      'GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews',
      'GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments',
      'GET /repos/{owner}/{repo}/releases',
      'GET /repos/{owner}/{repo}/releases/{release_id}/assets',
      'GET /repos/{owner}/{repo}/secret-scanning/alerts',
      'GET /repos/{owner}/{repo}/stargazers',
      'GET /repos/{owner}/{repo}/subscribers',
      'GET /repos/{owner}/{repo}/tags',
      'GET /repos/{owner}/{repo}/teams',
      'GET /repositories',
      'GET /repositories/{repository_id}/environments/{environment_name}/secrets',
      'GET /scim/v2/enterprises/{enterprise}/Groups',
      'GET /scim/v2/enterprises/{enterprise}/Users',
      'GET /scim/v2/organizations/{org}/Users',
      'GET /search/code',
      'GET /search/commits',
      'GET /search/issues',
      'GET /search/labels',
      'GET /search/repositories',
      'GET /search/topics',
      'GET /search/users',
      'GET /teams/{team_id}/discussions',
      'GET /teams/{team_id}/discussions/{discussion_number}/comments',
      'GET /teams/{team_id}/discussions/{discussion_number}/comments/{comment_number}/reactions',
      'GET /teams/{team_id}/discussions/{discussion_number}/reactions',
      'GET /teams/{team_id}/invitations',
      'GET /teams/{team_id}/members',
      'GET /teams/{team_id}/projects',
      'GET /teams/{team_id}/repos',
      'GET /teams/{team_id}/team-sync/group-mappings',
      'GET /teams/{team_id}/teams',
      'GET /user/blocks',
      'GET /user/emails',
      'GET /user/followers',
      'GET /user/following',
      'GET /user/gpg_keys',
      'GET /user/installations',
      'GET /user/installations/{installation_id}/repositories',
      'GET /user/issues',
      'GET /user/keys',
      'GET /user/marketplace_purchases',
      'GET /user/marketplace_purchases/stubbed',
      'GET /user/memberships/orgs',
      'GET /user/migrations',
      'GET /user/migrations/{migration_id}/repositories',
      'GET /user/orgs',
      'GET /user/public_emails',
      'GET /user/repos',
      'GET /user/repository_invitations',
      'GET /user/starred',
      'GET /user/subscriptions',
      'GET /user/teams',
      'GET /users',
      'GET /users/{username}/events',
      'GET /users/{username}/events/orgs/{org}',
      'GET /users/{username}/events/public',
      'GET /users/{username}/followers',
      'GET /users/{username}/following',
      'GET /users/{username}/gists',
      'GET /users/{username}/gpg_keys',
      'GET /users/{username}/keys',
      'GET /users/{username}/orgs',
      'GET /users/{username}/projects',
      'GET /users/{username}/received_events',
      'GET /users/{username}/received_events/public',
      'GET /users/{username}/repos',
      'GET /users/{username}/starred',
      'GET /users/{username}/subscriptions'
    ];
    function isPaginatingEndpoint(arg) {
      if (typeof arg === 'string') {
        return paginatingEndpoints.includes(arg);
      } else {
        return false;
      }
    }
    function paginateRest(octokit) {
      return {
        paginate: Object.assign(paginate.bind(null, octokit), {
          iterator: iterator.bind(null, octokit)
        })
      };
    }
    paginateRest.VERSION = VERSION;
    exports2.composePaginateRest = composePaginateRest;
    exports2.isPaginatingEndpoint = isPaginatingEndpoint;
    exports2.paginateRest = paginateRest;
    exports2.paginatingEndpoints = paginatingEndpoints;
  }
});

// node_modules/@actions/github/lib/utils.js
var require_utils4 = __commonJS({
  'node_modules/@actions/github/lib/utils.js'(exports2) {
    'use strict';
    var __createBinding =
      (exports2 && exports2.__createBinding) ||
      (Object.create
        ? function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            Object.defineProperty(o, k2, {
              enumerable: true,
              get: function () {
                return m[k];
              }
            });
          }
        : function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            o[k2] = m[k];
          });
    var __setModuleDefault =
      (exports2 && exports2.__setModuleDefault) ||
      (Object.create
        ? function (o, v) {
            Object.defineProperty(o, 'default', { enumerable: true, value: v });
          }
        : function (o, v) {
            o['default'] = v;
          });
    var __importStar =
      (exports2 && exports2.__importStar) ||
      function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k in mod) if (k !== 'default' && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.getOctokitOptions = exports2.GitHub = exports2.context = void 0;
    var Context = __importStar(require_context());
    var Utils = __importStar(require_utils3());
    var core_1 = require_dist_node8();
    var plugin_rest_endpoint_methods_1 = require_dist_node9();
    var plugin_paginate_rest_1 = require_dist_node10();
    exports2.context = new Context.Context();
    var baseUrl = Utils.getApiBaseUrl();
    var defaults = {
      baseUrl,
      request: {
        agent: Utils.getProxyAgent(baseUrl)
      }
    };
    exports2.GitHub = core_1.Octokit.plugin(
      plugin_rest_endpoint_methods_1.restEndpointMethods,
      plugin_paginate_rest_1.paginateRest
    ).defaults(defaults);
    function getOctokitOptions(token2, options) {
      const opts = Object.assign({}, options || {});
      const auth = Utils.getAuthString(token2, opts);
      if (auth) {
        opts.auth = auth;
      }
      return opts;
    }
    exports2.getOctokitOptions = getOctokitOptions;
  }
});

// node_modules/@actions/github/lib/github.js
var require_github = __commonJS({
  'node_modules/@actions/github/lib/github.js'(exports2) {
    'use strict';
    var __createBinding =
      (exports2 && exports2.__createBinding) ||
      (Object.create
        ? function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            Object.defineProperty(o, k2, {
              enumerable: true,
              get: function () {
                return m[k];
              }
            });
          }
        : function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            o[k2] = m[k];
          });
    var __setModuleDefault =
      (exports2 && exports2.__setModuleDefault) ||
      (Object.create
        ? function (o, v) {
            Object.defineProperty(o, 'default', { enumerable: true, value: v });
          }
        : function (o, v) {
            o['default'] = v;
          });
    var __importStar =
      (exports2 && exports2.__importStar) ||
      function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k in mod) if (k !== 'default' && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.getOctokit = exports2.context = void 0;
    var Context = __importStar(require_context());
    var utils_1 = require_utils4();
    exports2.context = new Context.Context();
    function getOctokit(token2, options) {
      return new utils_1.GitHub(utils_1.getOctokitOptions(token2, options));
    }
    exports2.getOctokit = getOctokit;
  }
});

// src/github.js
var require_github2 = __commonJS({
  'src/github.js'(exports2, module2) {
    var core2 = require_core();
    var github = require_github();
    async function createStatusCheck2(repoToken, reportData, markupData, conclusion) {
      try {
        core2.info(`Creating Status check for ${reportData.ReportMetaData.ReportTitle}...`);
        const octokit = github.getOctokit(repoToken);
        let git_sha =
          github.context.eventName === 'pull_request' ? github.context.payload.pull_request.head.sha : github.context.sha;
        core2.info(`Creating status check for GitSha: ${git_sha} on a ${github.context.eventName} event.`);
        const checkTime = new Date().toUTCString();
        core2.info(`Check time is: ${checkTime}`);
        const response = await octokit.rest.checks.create({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          name: `status check - ${reportData.ReportMetaData.ReportName.toLowerCase()}`,
          head_sha: git_sha,
          status: 'completed',
          conclusion,
          output: {
            title: reportData.ReportMetaData.ReportTitle,
            summary: `This test run completed at \`${checkTime}\``,
            text: markupData
          }
        });
        if (response.status !== 201) {
          throw new Error(`Failed to create status check. Error code: ${response.status}`);
        } else {
          core2.info(`Created check: ${response.data.name} with response status ${response.status}`);
        }
      } catch (error) {
        core2.setFailed(error.message);
      }
    }
    async function lookForExistingComment(octokit, markupPrefix) {
      let hasMoreComments = true;
      let page = 1;
      const maxResultsPerPage = 30;
      while (hasMoreComments) {
        const commentsResponse = await octokit.rest.issues.listComments({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          issue_number: github.context.payload.pull_request.number,
          per_page: maxResultsPerPage,
          page
        });
        if (commentsResponse.status == 200) {
          if (commentsResponse.data) {
            if (commentsResponse.data.length < maxResultsPerPage) {
              hasMoreComments = false;
            } else {
              page += 1;
            }
            const existingComment = commentsResponse.data.find(c => c.body.startsWith(markupPrefix));
            if (existingComment) {
              core2.info(`An existing dotnet test results comment (${existingComment.id}) was found and will be udpated.`);
              return existingComment.id;
            }
          }
        } else {
          core2.info(
            `Failed to list PR comments. Error code: ${commentsResponse.status}.  Will create new comment instead.`
          );
          return null;
        }
      }
      core2.info(`Finished getting comments for PR #${github.context.payload.pull_request.number}.`);
      core2.info('An existing dotnet test results comment was not found, will create a new one instead.');
      return null;
    }
    async function createPrComment2(repoToken, markupData, updateCommentIfOneExists2, commentIdentifier2) {
      try {
        if (github.context.eventName != 'pull_request') {
          core2.info('This event was not triggered by a pull_request.  No comment will be created or updated.');
          return;
        }
        const markupPrefix = `<!-- im-open/process-dotnet-test-results ${commentIdentifier2} -->`;
        const octokit = github.getOctokit(repoToken);
        let existingCommentId = null;
        if (updateCommentIfOneExists2) {
          core2.info('Checking for existing comment on PR....');
          existingCommentId = await lookForExistingComment(octokit, markupPrefix);
        }
        let response;
        let success;
        if (existingCommentId) {
          core2.info(`Updating existing PR #${existingCommentId} comment...`);
          response = await octokit.rest.issues.updateComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            body: `${markupPrefix}
${markupData}`,
            comment_id: existingCommentId
          });
          success = response.status === 200;
        } else {
          core2.info(`Creating a new PR comment...`);
          response = await octokit.rest.issues.createComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            body: `${markupPrefix}
${markupData}`,
            issue_number: github.context.payload.pull_request.number
          });
          success = response.status === 201;
        }
        const action = existingCommentId ? 'create' : 'update';
        if (success) {
          core2.info(`PR comment was ${action}d.  ID: ${response.data.id}.`);
        } else {
          core2.setFailed(`Failed to ${action} PR comment. Error code: ${response.status}.`);
        }
      } catch (error) {
        core2.setFailed(`An error occurred trying to create or update the PR comment: ${error}`);
      }
    }
    module2.exports = {
      createStatusCheck: createStatusCheck2,
      createPrComment: createPrComment2
    };
  }
});

// node_modules/date-fns/_lib/requiredArgs/index.js
var require_requiredArgs = __commonJS({
  'node_modules/date-fns/_lib/requiredArgs/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = requiredArgs;
    function requiredArgs(required, args) {
      if (args.length < required) {
        throw new TypeError(
          required + ' argument' + (required > 1 ? 's' : '') + ' required, but only ' + args.length + ' present'
        );
      }
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/toDate/index.js
var require_toDate = __commonJS({
  'node_modules/date-fns/toDate/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = toDate;
    var _index = _interopRequireDefault(require_requiredArgs());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function toDate(argument) {
      (0, _index.default)(1, arguments);
      var argStr = Object.prototype.toString.call(argument);
      if (argument instanceof Date || (typeof argument === 'object' && argStr === '[object Date]')) {
        return new Date(argument.getTime());
      } else if (typeof argument === 'number' || argStr === '[object Number]') {
        return new Date(argument);
      } else {
        if ((typeof argument === 'string' || argStr === '[object String]') && typeof console !== 'undefined') {
          console.warn(
            "Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule"
          );
          console.warn(new Error().stack);
        }
        return new Date(NaN);
      }
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/isValid/index.js
var require_isValid = __commonJS({
  'node_modules/date-fns/isValid/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = isValid;
    var _index = _interopRequireDefault(require_toDate());
    var _index2 = _interopRequireDefault(require_requiredArgs());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function isValid(dirtyDate) {
      (0, _index2.default)(1, arguments);
      var date = (0, _index.default)(dirtyDate);
      return !isNaN(date);
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/locale/en-US/_lib/formatDistance/index.js
var require_formatDistance = __commonJS({
  'node_modules/date-fns/locale/en-US/_lib/formatDistance/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = formatDistance;
    var formatDistanceLocale = {
      lessThanXSeconds: {
        one: 'less than a second',
        other: 'less than {{count}} seconds'
      },
      xSeconds: {
        one: '1 second',
        other: '{{count}} seconds'
      },
      halfAMinute: 'half a minute',
      lessThanXMinutes: {
        one: 'less than a minute',
        other: 'less than {{count}} minutes'
      },
      xMinutes: {
        one: '1 minute',
        other: '{{count}} minutes'
      },
      aboutXHours: {
        one: 'about 1 hour',
        other: 'about {{count}} hours'
      },
      xHours: {
        one: '1 hour',
        other: '{{count}} hours'
      },
      xDays: {
        one: '1 day',
        other: '{{count}} days'
      },
      aboutXWeeks: {
        one: 'about 1 week',
        other: 'about {{count}} weeks'
      },
      xWeeks: {
        one: '1 week',
        other: '{{count}} weeks'
      },
      aboutXMonths: {
        one: 'about 1 month',
        other: 'about {{count}} months'
      },
      xMonths: {
        one: '1 month',
        other: '{{count}} months'
      },
      aboutXYears: {
        one: 'about 1 year',
        other: 'about {{count}} years'
      },
      xYears: {
        one: '1 year',
        other: '{{count}} years'
      },
      overXYears: {
        one: 'over 1 year',
        other: 'over {{count}} years'
      },
      almostXYears: {
        one: 'almost 1 year',
        other: 'almost {{count}} years'
      }
    };
    function formatDistance(token2, count, options) {
      options = options || {};
      var result;
      if (typeof formatDistanceLocale[token2] === 'string') {
        result = formatDistanceLocale[token2];
      } else if (count === 1) {
        result = formatDistanceLocale[token2].one;
      } else {
        result = formatDistanceLocale[token2].other.replace('{{count}}', count);
      }
      if (options.addSuffix) {
        if (options.comparison > 0) {
          return 'in ' + result;
        } else {
          return result + ' ago';
        }
      }
      return result;
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/locale/_lib/buildFormatLongFn/index.js
var require_buildFormatLongFn = __commonJS({
  'node_modules/date-fns/locale/_lib/buildFormatLongFn/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = buildFormatLongFn;
    function buildFormatLongFn(args) {
      return function (dirtyOptions) {
        var options = dirtyOptions || {};
        var width = options.width ? String(options.width) : args.defaultWidth;
        var format = args.formats[width] || args.formats[args.defaultWidth];
        return format;
      };
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/locale/en-US/_lib/formatLong/index.js
var require_formatLong = __commonJS({
  'node_modules/date-fns/locale/en-US/_lib/formatLong/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = void 0;
    var _index = _interopRequireDefault(require_buildFormatLongFn());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var dateFormats = {
      full: 'EEEE, MMMM do, y',
      long: 'MMMM do, y',
      medium: 'MMM d, y',
      short: 'MM/dd/yyyy'
    };
    var timeFormats = {
      full: 'h:mm:ss a zzzz',
      long: 'h:mm:ss a z',
      medium: 'h:mm:ss a',
      short: 'h:mm a'
    };
    var dateTimeFormats = {
      full: "{{date}} 'at' {{time}}",
      long: "{{date}} 'at' {{time}}",
      medium: '{{date}}, {{time}}',
      short: '{{date}}, {{time}}'
    };
    var formatLong = {
      date: (0, _index.default)({
        formats: dateFormats,
        defaultWidth: 'full'
      }),
      time: (0, _index.default)({
        formats: timeFormats,
        defaultWidth: 'full'
      }),
      dateTime: (0, _index.default)({
        formats: dateTimeFormats,
        defaultWidth: 'full'
      })
    };
    var _default = formatLong;
    exports2.default = _default;
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/locale/en-US/_lib/formatRelative/index.js
var require_formatRelative = __commonJS({
  'node_modules/date-fns/locale/en-US/_lib/formatRelative/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = formatRelative;
    var formatRelativeLocale = {
      lastWeek: "'last' eeee 'at' p",
      yesterday: "'yesterday at' p",
      today: "'today at' p",
      tomorrow: "'tomorrow at' p",
      nextWeek: "eeee 'at' p",
      other: 'P'
    };
    function formatRelative(token2, _date, _baseDate, _options) {
      return formatRelativeLocale[token2];
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/locale/_lib/buildLocalizeFn/index.js
var require_buildLocalizeFn = __commonJS({
  'node_modules/date-fns/locale/_lib/buildLocalizeFn/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = buildLocalizeFn;
    function buildLocalizeFn(args) {
      return function (dirtyIndex, dirtyOptions) {
        var options = dirtyOptions || {};
        var context = options.context ? String(options.context) : 'standalone';
        var valuesArray;
        if (context === 'formatting' && args.formattingValues) {
          var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
          var width = options.width ? String(options.width) : defaultWidth;
          valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
        } else {
          var _defaultWidth = args.defaultWidth;
          var _width = options.width ? String(options.width) : args.defaultWidth;
          valuesArray = args.values[_width] || args.values[_defaultWidth];
        }
        var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex;
        return valuesArray[index];
      };
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/locale/en-US/_lib/localize/index.js
var require_localize = __commonJS({
  'node_modules/date-fns/locale/en-US/_lib/localize/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = void 0;
    var _index = _interopRequireDefault(require_buildLocalizeFn());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var eraValues = {
      narrow: ['B', 'A'],
      abbreviated: ['BC', 'AD'],
      wide: ['Before Christ', 'Anno Domini']
    };
    var quarterValues = {
      narrow: ['1', '2', '3', '4'],
      abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
      wide: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter']
    };
    var monthValues = {
      narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      wide: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ]
    };
    var dayValues = {
      narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    var dayPeriodValues = {
      narrow: {
        am: 'a',
        pm: 'p',
        midnight: 'mi',
        noon: 'n',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      },
      abbreviated: {
        am: 'AM',
        pm: 'PM',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      },
      wide: {
        am: 'a.m.',
        pm: 'p.m.',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      }
    };
    var formattingDayPeriodValues = {
      narrow: {
        am: 'a',
        pm: 'p',
        midnight: 'mi',
        noon: 'n',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      },
      abbreviated: {
        am: 'AM',
        pm: 'PM',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      },
      wide: {
        am: 'a.m.',
        pm: 'p.m.',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      }
    };
    function ordinalNumber(dirtyNumber, _dirtyOptions) {
      var number = Number(dirtyNumber);
      var rem100 = number % 100;
      if (rem100 > 20 || rem100 < 10) {
        switch (rem100 % 10) {
          case 1:
            return number + 'st';
          case 2:
            return number + 'nd';
          case 3:
            return number + 'rd';
        }
      }
      return number + 'th';
    }
    var localize = {
      ordinalNumber,
      era: (0, _index.default)({
        values: eraValues,
        defaultWidth: 'wide'
      }),
      quarter: (0, _index.default)({
        values: quarterValues,
        defaultWidth: 'wide',
        argumentCallback: function (quarter) {
          return Number(quarter) - 1;
        }
      }),
      month: (0, _index.default)({
        values: monthValues,
        defaultWidth: 'wide'
      }),
      day: (0, _index.default)({
        values: dayValues,
        defaultWidth: 'wide'
      }),
      dayPeriod: (0, _index.default)({
        values: dayPeriodValues,
        defaultWidth: 'wide',
        formattingValues: formattingDayPeriodValues,
        defaultFormattingWidth: 'wide'
      })
    };
    var _default = localize;
    exports2.default = _default;
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/locale/_lib/buildMatchPatternFn/index.js
var require_buildMatchPatternFn = __commonJS({
  'node_modules/date-fns/locale/_lib/buildMatchPatternFn/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = buildMatchPatternFn;
    function buildMatchPatternFn(args) {
      return function (dirtyString, dirtyOptions) {
        var string = String(dirtyString);
        var options = dirtyOptions || {};
        var matchResult = string.match(args.matchPattern);
        if (!matchResult) {
          return null;
        }
        var matchedString = matchResult[0];
        var parseResult = string.match(args.parsePattern);
        if (!parseResult) {
          return null;
        }
        var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
        value = options.valueCallback ? options.valueCallback(value) : value;
        return {
          value,
          rest: string.slice(matchedString.length)
        };
      };
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/locale/_lib/buildMatchFn/index.js
var require_buildMatchFn = __commonJS({
  'node_modules/date-fns/locale/_lib/buildMatchFn/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = buildMatchFn;
    function buildMatchFn(args) {
      return function (dirtyString, dirtyOptions) {
        var string = String(dirtyString);
        var options = dirtyOptions || {};
        var width = options.width;
        var matchPattern = (width && args.matchPatterns[width]) || args.matchPatterns[args.defaultMatchWidth];
        var matchResult = string.match(matchPattern);
        if (!matchResult) {
          return null;
        }
        var matchedString = matchResult[0];
        var parsePatterns = (width && args.parsePatterns[width]) || args.parsePatterns[args.defaultParseWidth];
        var value;
        if (Object.prototype.toString.call(parsePatterns) === '[object Array]') {
          value = findIndex(parsePatterns, function (pattern) {
            return pattern.test(matchedString);
          });
        } else {
          value = findKey(parsePatterns, function (pattern) {
            return pattern.test(matchedString);
          });
        }
        value = args.valueCallback ? args.valueCallback(value) : value;
        value = options.valueCallback ? options.valueCallback(value) : value;
        return {
          value,
          rest: string.slice(matchedString.length)
        };
      };
    }
    function findKey(object, predicate) {
      for (var key in object) {
        if (object.hasOwnProperty(key) && predicate(object[key])) {
          return key;
        }
      }
    }
    function findIndex(array, predicate) {
      for (var key = 0; key < array.length; key++) {
        if (predicate(array[key])) {
          return key;
        }
      }
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/locale/en-US/_lib/match/index.js
var require_match = __commonJS({
  'node_modules/date-fns/locale/en-US/_lib/match/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = void 0;
    var _index = _interopRequireDefault(require_buildMatchPatternFn());
    var _index2 = _interopRequireDefault(require_buildMatchFn());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
    var parseOrdinalNumberPattern = /\d+/i;
    var matchEraPatterns = {
      narrow: /^(b|a)/i,
      abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
      wide: /^(before christ|before common era|anno domini|common era)/i
    };
    var parseEraPatterns = {
      any: [/^b/i, /^(a|c)/i]
    };
    var matchQuarterPatterns = {
      narrow: /^[1234]/i,
      abbreviated: /^q[1234]/i,
      wide: /^[1234](th|st|nd|rd)? quarter/i
    };
    var parseQuarterPatterns = {
      any: [/1/i, /2/i, /3/i, /4/i]
    };
    var matchMonthPatterns = {
      narrow: /^[jfmasond]/i,
      abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
      wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
    };
    var parseMonthPatterns = {
      narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
      any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
    };
    var matchDayPatterns = {
      narrow: /^[smtwf]/i,
      short: /^(su|mo|tu|we|th|fr|sa)/i,
      abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
      wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
    };
    var parseDayPatterns = {
      narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
      any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
    };
    var matchDayPeriodPatterns = {
      narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
      any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
    };
    var parseDayPeriodPatterns = {
      any: {
        am: /^a/i,
        pm: /^p/i,
        midnight: /^mi/i,
        noon: /^no/i,
        morning: /morning/i,
        afternoon: /afternoon/i,
        evening: /evening/i,
        night: /night/i
      }
    };
    var match = {
      ordinalNumber: (0, _index.default)({
        matchPattern: matchOrdinalNumberPattern,
        parsePattern: parseOrdinalNumberPattern,
        valueCallback: function (value) {
          return parseInt(value, 10);
        }
      }),
      era: (0, _index2.default)({
        matchPatterns: matchEraPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseEraPatterns,
        defaultParseWidth: 'any'
      }),
      quarter: (0, _index2.default)({
        matchPatterns: matchQuarterPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseQuarterPatterns,
        defaultParseWidth: 'any',
        valueCallback: function (index) {
          return index + 1;
        }
      }),
      month: (0, _index2.default)({
        matchPatterns: matchMonthPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseMonthPatterns,
        defaultParseWidth: 'any'
      }),
      day: (0, _index2.default)({
        matchPatterns: matchDayPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseDayPatterns,
        defaultParseWidth: 'any'
      }),
      dayPeriod: (0, _index2.default)({
        matchPatterns: matchDayPeriodPatterns,
        defaultMatchWidth: 'any',
        parsePatterns: parseDayPeriodPatterns,
        defaultParseWidth: 'any'
      })
    };
    var _default = match;
    exports2.default = _default;
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/locale/en-US/index.js
var require_en_US = __commonJS({
  'node_modules/date-fns/locale/en-US/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = void 0;
    var _index = _interopRequireDefault(require_formatDistance());
    var _index2 = _interopRequireDefault(require_formatLong());
    var _index3 = _interopRequireDefault(require_formatRelative());
    var _index4 = _interopRequireDefault(require_localize());
    var _index5 = _interopRequireDefault(require_match());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var locale = {
      code: 'en-US',
      formatDistance: _index.default,
      formatLong: _index2.default,
      formatRelative: _index3.default,
      localize: _index4.default,
      match: _index5.default,
      options: {
        weekStartsOn: 0,
        firstWeekContainsDate: 1
      }
    };
    var _default = locale;
    exports2.default = _default;
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/toInteger/index.js
var require_toInteger = __commonJS({
  'node_modules/date-fns/_lib/toInteger/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = toInteger;
    function toInteger(dirtyNumber) {
      if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
        return NaN;
      }
      var number = Number(dirtyNumber);
      if (isNaN(number)) {
        return number;
      }
      return number < 0 ? Math.ceil(number) : Math.floor(number);
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/addMilliseconds/index.js
var require_addMilliseconds = __commonJS({
  'node_modules/date-fns/addMilliseconds/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = addMilliseconds;
    var _index = _interopRequireDefault(require_toInteger());
    var _index2 = _interopRequireDefault(require_toDate());
    var _index3 = _interopRequireDefault(require_requiredArgs());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function addMilliseconds(dirtyDate, dirtyAmount) {
      (0, _index3.default)(2, arguments);
      var timestamp = (0, _index2.default)(dirtyDate).getTime();
      var amount = (0, _index.default)(dirtyAmount);
      return new Date(timestamp + amount);
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/subMilliseconds/index.js
var require_subMilliseconds = __commonJS({
  'node_modules/date-fns/subMilliseconds/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = subMilliseconds;
    var _index = _interopRequireDefault(require_toInteger());
    var _index2 = _interopRequireDefault(require_addMilliseconds());
    var _index3 = _interopRequireDefault(require_requiredArgs());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function subMilliseconds(dirtyDate, dirtyAmount) {
      (0, _index3.default)(2, arguments);
      var amount = (0, _index.default)(dirtyAmount);
      return (0, _index2.default)(dirtyDate, -amount);
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/addLeadingZeros/index.js
var require_addLeadingZeros = __commonJS({
  'node_modules/date-fns/_lib/addLeadingZeros/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = addLeadingZeros;
    function addLeadingZeros(number, targetLength) {
      var sign = number < 0 ? '-' : '';
      var output = Math.abs(number).toString();
      while (output.length < targetLength) {
        output = '0' + output;
      }
      return sign + output;
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/format/lightFormatters/index.js
var require_lightFormatters = __commonJS({
  'node_modules/date-fns/_lib/format/lightFormatters/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = void 0;
    var _index = _interopRequireDefault(require_addLeadingZeros());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var formatters = {
      y: function (date, token2) {
        var signedYear = date.getUTCFullYear();
        var year = signedYear > 0 ? signedYear : 1 - signedYear;
        return (0, _index.default)(token2 === 'yy' ? year % 100 : year, token2.length);
      },
      M: function (date, token2) {
        var month = date.getUTCMonth();
        return token2 === 'M' ? String(month + 1) : (0, _index.default)(month + 1, 2);
      },
      d: function (date, token2) {
        return (0, _index.default)(date.getUTCDate(), token2.length);
      },
      a: function (date, token2) {
        var dayPeriodEnumValue = date.getUTCHours() / 12 >= 1 ? 'pm' : 'am';
        switch (token2) {
          case 'a':
          case 'aa':
            return dayPeriodEnumValue.toUpperCase();
          case 'aaa':
            return dayPeriodEnumValue;
          case 'aaaaa':
            return dayPeriodEnumValue[0];
          case 'aaaa':
          default:
            return dayPeriodEnumValue === 'am' ? 'a.m.' : 'p.m.';
        }
      },
      h: function (date, token2) {
        return (0, _index.default)(date.getUTCHours() % 12 || 12, token2.length);
      },
      H: function (date, token2) {
        return (0, _index.default)(date.getUTCHours(), token2.length);
      },
      m: function (date, token2) {
        return (0, _index.default)(date.getUTCMinutes(), token2.length);
      },
      s: function (date, token2) {
        return (0, _index.default)(date.getUTCSeconds(), token2.length);
      },
      S: function (date, token2) {
        var numberOfDigits = token2.length;
        var milliseconds = date.getUTCMilliseconds();
        var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
        return (0, _index.default)(fractionalSeconds, token2.length);
      }
    };
    var _default = formatters;
    exports2.default = _default;
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/getUTCDayOfYear/index.js
var require_getUTCDayOfYear = __commonJS({
  'node_modules/date-fns/_lib/getUTCDayOfYear/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = getUTCDayOfYear;
    var _index = _interopRequireDefault(require_toDate());
    var _index2 = _interopRequireDefault(require_requiredArgs());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var MILLISECONDS_IN_DAY = 864e5;
    function getUTCDayOfYear(dirtyDate) {
      (0, _index2.default)(1, arguments);
      var date = (0, _index.default)(dirtyDate);
      var timestamp = date.getTime();
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
      var startOfYearTimestamp = date.getTime();
      var difference = timestamp - startOfYearTimestamp;
      return Math.floor(difference / MILLISECONDS_IN_DAY) + 1;
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/startOfUTCISOWeek/index.js
var require_startOfUTCISOWeek = __commonJS({
  'node_modules/date-fns/_lib/startOfUTCISOWeek/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = startOfUTCISOWeek;
    var _index = _interopRequireDefault(require_toDate());
    var _index2 = _interopRequireDefault(require_requiredArgs());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function startOfUTCISOWeek(dirtyDate) {
      (0, _index2.default)(1, arguments);
      var weekStartsOn = 1;
      var date = (0, _index.default)(dirtyDate);
      var day = date.getUTCDay();
      var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
      date.setUTCDate(date.getUTCDate() - diff);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/getUTCISOWeekYear/index.js
var require_getUTCISOWeekYear = __commonJS({
  'node_modules/date-fns/_lib/getUTCISOWeekYear/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = getUTCISOWeekYear;
    var _index = _interopRequireDefault(require_toDate());
    var _index2 = _interopRequireDefault(require_startOfUTCISOWeek());
    var _index3 = _interopRequireDefault(require_requiredArgs());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function getUTCISOWeekYear(dirtyDate) {
      (0, _index3.default)(1, arguments);
      var date = (0, _index.default)(dirtyDate);
      var year = date.getUTCFullYear();
      var fourthOfJanuaryOfNextYear = new Date(0);
      fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
      fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
      var startOfNextYear = (0, _index2.default)(fourthOfJanuaryOfNextYear);
      var fourthOfJanuaryOfThisYear = new Date(0);
      fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
      fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
      var startOfThisYear = (0, _index2.default)(fourthOfJanuaryOfThisYear);
      if (date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
      } else if (date.getTime() >= startOfThisYear.getTime()) {
        return year;
      } else {
        return year - 1;
      }
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/startOfUTCISOWeekYear/index.js
var require_startOfUTCISOWeekYear = __commonJS({
  'node_modules/date-fns/_lib/startOfUTCISOWeekYear/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = startOfUTCISOWeekYear;
    var _index = _interopRequireDefault(require_getUTCISOWeekYear());
    var _index2 = _interopRequireDefault(require_startOfUTCISOWeek());
    var _index3 = _interopRequireDefault(require_requiredArgs());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function startOfUTCISOWeekYear(dirtyDate) {
      (0, _index3.default)(1, arguments);
      var year = (0, _index.default)(dirtyDate);
      var fourthOfJanuary = new Date(0);
      fourthOfJanuary.setUTCFullYear(year, 0, 4);
      fourthOfJanuary.setUTCHours(0, 0, 0, 0);
      var date = (0, _index2.default)(fourthOfJanuary);
      return date;
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/getUTCISOWeek/index.js
var require_getUTCISOWeek = __commonJS({
  'node_modules/date-fns/_lib/getUTCISOWeek/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = getUTCISOWeek;
    var _index = _interopRequireDefault(require_toDate());
    var _index2 = _interopRequireDefault(require_startOfUTCISOWeek());
    var _index3 = _interopRequireDefault(require_startOfUTCISOWeekYear());
    var _index4 = _interopRequireDefault(require_requiredArgs());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var MILLISECONDS_IN_WEEK = 6048e5;
    function getUTCISOWeek(dirtyDate) {
      (0, _index4.default)(1, arguments);
      var date = (0, _index.default)(dirtyDate);
      var diff = (0, _index2.default)(date).getTime() - (0, _index3.default)(date).getTime();
      return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/startOfUTCWeek/index.js
var require_startOfUTCWeek = __commonJS({
  'node_modules/date-fns/_lib/startOfUTCWeek/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = startOfUTCWeek;
    var _index = _interopRequireDefault(require_toInteger());
    var _index2 = _interopRequireDefault(require_toDate());
    var _index3 = _interopRequireDefault(require_requiredArgs());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function startOfUTCWeek(dirtyDate, dirtyOptions) {
      (0, _index3.default)(1, arguments);
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeWeekStartsOn = locale && locale.options && locale.options.weekStartsOn;
      var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : (0, _index.default)(localeWeekStartsOn);
      var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : (0, _index.default)(options.weekStartsOn);
      if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
        throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
      }
      var date = (0, _index2.default)(dirtyDate);
      var day = date.getUTCDay();
      var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
      date.setUTCDate(date.getUTCDate() - diff);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/getUTCWeekYear/index.js
var require_getUTCWeekYear = __commonJS({
  'node_modules/date-fns/_lib/getUTCWeekYear/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = getUTCWeekYear;
    var _index = _interopRequireDefault(require_toInteger());
    var _index2 = _interopRequireDefault(require_toDate());
    var _index3 = _interopRequireDefault(require_startOfUTCWeek());
    var _index4 = _interopRequireDefault(require_requiredArgs());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function getUTCWeekYear(dirtyDate, dirtyOptions) {
      (0, _index4.default)(1, arguments);
      var date = (0, _index2.default)(dirtyDate, dirtyOptions);
      var year = date.getUTCFullYear();
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate =
        localeFirstWeekContainsDate == null ? 1 : (0, _index.default)(localeFirstWeekContainsDate);
      var firstWeekContainsDate =
        options.firstWeekContainsDate == null
          ? defaultFirstWeekContainsDate
          : (0, _index.default)(options.firstWeekContainsDate);
      if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
        throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
      }
      var firstWeekOfNextYear = new Date(0);
      firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
      firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
      var startOfNextYear = (0, _index3.default)(firstWeekOfNextYear, dirtyOptions);
      var firstWeekOfThisYear = new Date(0);
      firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
      firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
      var startOfThisYear = (0, _index3.default)(firstWeekOfThisYear, dirtyOptions);
      if (date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
      } else if (date.getTime() >= startOfThisYear.getTime()) {
        return year;
      } else {
        return year - 1;
      }
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/startOfUTCWeekYear/index.js
var require_startOfUTCWeekYear = __commonJS({
  'node_modules/date-fns/_lib/startOfUTCWeekYear/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = startOfUTCWeekYear;
    var _index = _interopRequireDefault(require_toInteger());
    var _index2 = _interopRequireDefault(require_getUTCWeekYear());
    var _index3 = _interopRequireDefault(require_startOfUTCWeek());
    var _index4 = _interopRequireDefault(require_requiredArgs());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function startOfUTCWeekYear(dirtyDate, dirtyOptions) {
      (0, _index4.default)(1, arguments);
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate =
        localeFirstWeekContainsDate == null ? 1 : (0, _index.default)(localeFirstWeekContainsDate);
      var firstWeekContainsDate =
        options.firstWeekContainsDate == null
          ? defaultFirstWeekContainsDate
          : (0, _index.default)(options.firstWeekContainsDate);
      var year = (0, _index2.default)(dirtyDate, dirtyOptions);
      var firstWeek = new Date(0);
      firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
      firstWeek.setUTCHours(0, 0, 0, 0);
      var date = (0, _index3.default)(firstWeek, dirtyOptions);
      return date;
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/getUTCWeek/index.js
var require_getUTCWeek = __commonJS({
  'node_modules/date-fns/_lib/getUTCWeek/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = getUTCWeek;
    var _index = _interopRequireDefault(require_toDate());
    var _index2 = _interopRequireDefault(require_startOfUTCWeek());
    var _index3 = _interopRequireDefault(require_startOfUTCWeekYear());
    var _index4 = _interopRequireDefault(require_requiredArgs());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var MILLISECONDS_IN_WEEK = 6048e5;
    function getUTCWeek(dirtyDate, options) {
      (0, _index4.default)(1, arguments);
      var date = (0, _index.default)(dirtyDate);
      var diff = (0, _index2.default)(date, options).getTime() - (0, _index3.default)(date, options).getTime();
      return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/format/formatters/index.js
var require_formatters = __commonJS({
  'node_modules/date-fns/_lib/format/formatters/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = void 0;
    var _index = _interopRequireDefault(require_lightFormatters());
    var _index2 = _interopRequireDefault(require_getUTCDayOfYear());
    var _index3 = _interopRequireDefault(require_getUTCISOWeek());
    var _index4 = _interopRequireDefault(require_getUTCISOWeekYear());
    var _index5 = _interopRequireDefault(require_getUTCWeek());
    var _index6 = _interopRequireDefault(require_getUTCWeekYear());
    var _index7 = _interopRequireDefault(require_addLeadingZeros());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var dayPeriodEnum = {
      am: 'am',
      pm: 'pm',
      midnight: 'midnight',
      noon: 'noon',
      morning: 'morning',
      afternoon: 'afternoon',
      evening: 'evening',
      night: 'night'
    };
    var formatters = {
      G: function (date, token2, localize) {
        var era = date.getUTCFullYear() > 0 ? 1 : 0;
        switch (token2) {
          case 'G':
          case 'GG':
          case 'GGG':
            return localize.era(era, {
              width: 'abbreviated'
            });
          case 'GGGGG':
            return localize.era(era, {
              width: 'narrow'
            });
          case 'GGGG':
          default:
            return localize.era(era, {
              width: 'wide'
            });
        }
      },
      y: function (date, token2, localize) {
        if (token2 === 'yo') {
          var signedYear = date.getUTCFullYear();
          var year = signedYear > 0 ? signedYear : 1 - signedYear;
          return localize.ordinalNumber(year, {
            unit: 'year'
          });
        }
        return _index.default.y(date, token2);
      },
      Y: function (date, token2, localize, options) {
        var signedWeekYear = (0, _index6.default)(date, options);
        var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
        if (token2 === 'YY') {
          var twoDigitYear = weekYear % 100;
          return (0, _index7.default)(twoDigitYear, 2);
        }
        if (token2 === 'Yo') {
          return localize.ordinalNumber(weekYear, {
            unit: 'year'
          });
        }
        return (0, _index7.default)(weekYear, token2.length);
      },
      R: function (date, token2) {
        var isoWeekYear = (0, _index4.default)(date);
        return (0, _index7.default)(isoWeekYear, token2.length);
      },
      u: function (date, token2) {
        var year = date.getUTCFullYear();
        return (0, _index7.default)(year, token2.length);
      },
      Q: function (date, token2, localize) {
        var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);
        switch (token2) {
          case 'Q':
            return String(quarter);
          case 'QQ':
            return (0, _index7.default)(quarter, 2);
          case 'Qo':
            return localize.ordinalNumber(quarter, {
              unit: 'quarter'
            });
          case 'QQQ':
            return localize.quarter(quarter, {
              width: 'abbreviated',
              context: 'formatting'
            });
          case 'QQQQQ':
            return localize.quarter(quarter, {
              width: 'narrow',
              context: 'formatting'
            });
          case 'QQQQ':
          default:
            return localize.quarter(quarter, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      q: function (date, token2, localize) {
        var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);
        switch (token2) {
          case 'q':
            return String(quarter);
          case 'qq':
            return (0, _index7.default)(quarter, 2);
          case 'qo':
            return localize.ordinalNumber(quarter, {
              unit: 'quarter'
            });
          case 'qqq':
            return localize.quarter(quarter, {
              width: 'abbreviated',
              context: 'standalone'
            });
          case 'qqqqq':
            return localize.quarter(quarter, {
              width: 'narrow',
              context: 'standalone'
            });
          case 'qqqq':
          default:
            return localize.quarter(quarter, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      M: function (date, token2, localize) {
        var month = date.getUTCMonth();
        switch (token2) {
          case 'M':
          case 'MM':
            return _index.default.M(date, token2);
          case 'Mo':
            return localize.ordinalNumber(month + 1, {
              unit: 'month'
            });
          case 'MMM':
            return localize.month(month, {
              width: 'abbreviated',
              context: 'formatting'
            });
          case 'MMMMM':
            return localize.month(month, {
              width: 'narrow',
              context: 'formatting'
            });
          case 'MMMM':
          default:
            return localize.month(month, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      L: function (date, token2, localize) {
        var month = date.getUTCMonth();
        switch (token2) {
          case 'L':
            return String(month + 1);
          case 'LL':
            return (0, _index7.default)(month + 1, 2);
          case 'Lo':
            return localize.ordinalNumber(month + 1, {
              unit: 'month'
            });
          case 'LLL':
            return localize.month(month, {
              width: 'abbreviated',
              context: 'standalone'
            });
          case 'LLLLL':
            return localize.month(month, {
              width: 'narrow',
              context: 'standalone'
            });
          case 'LLLL':
          default:
            return localize.month(month, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      w: function (date, token2, localize, options) {
        var week = (0, _index5.default)(date, options);
        if (token2 === 'wo') {
          return localize.ordinalNumber(week, {
            unit: 'week'
          });
        }
        return (0, _index7.default)(week, token2.length);
      },
      I: function (date, token2, localize) {
        var isoWeek = (0, _index3.default)(date);
        if (token2 === 'Io') {
          return localize.ordinalNumber(isoWeek, {
            unit: 'week'
          });
        }
        return (0, _index7.default)(isoWeek, token2.length);
      },
      d: function (date, token2, localize) {
        if (token2 === 'do') {
          return localize.ordinalNumber(date.getUTCDate(), {
            unit: 'date'
          });
        }
        return _index.default.d(date, token2);
      },
      D: function (date, token2, localize) {
        var dayOfYear = (0, _index2.default)(date);
        if (token2 === 'Do') {
          return localize.ordinalNumber(dayOfYear, {
            unit: 'dayOfYear'
          });
        }
        return (0, _index7.default)(dayOfYear, token2.length);
      },
      E: function (date, token2, localize) {
        var dayOfWeek = date.getUTCDay();
        switch (token2) {
          case 'E':
          case 'EE':
          case 'EEE':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          case 'EEEEE':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          case 'EEEEEE':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          case 'EEEE':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      e: function (date, token2, localize, options) {
        var dayOfWeek = date.getUTCDay();
        var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
        switch (token2) {
          case 'e':
            return String(localDayOfWeek);
          case 'ee':
            return (0, _index7.default)(localDayOfWeek, 2);
          case 'eo':
            return localize.ordinalNumber(localDayOfWeek, {
              unit: 'day'
            });
          case 'eee':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          case 'eeeee':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          case 'eeeeee':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          case 'eeee':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      c: function (date, token2, localize, options) {
        var dayOfWeek = date.getUTCDay();
        var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
        switch (token2) {
          case 'c':
            return String(localDayOfWeek);
          case 'cc':
            return (0, _index7.default)(localDayOfWeek, token2.length);
          case 'co':
            return localize.ordinalNumber(localDayOfWeek, {
              unit: 'day'
            });
          case 'ccc':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'standalone'
            });
          case 'ccccc':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'standalone'
            });
          case 'cccccc':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'standalone'
            });
          case 'cccc':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      i: function (date, token2, localize) {
        var dayOfWeek = date.getUTCDay();
        var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
        switch (token2) {
          case 'i':
            return String(isoDayOfWeek);
          case 'ii':
            return (0, _index7.default)(isoDayOfWeek, token2.length);
          case 'io':
            return localize.ordinalNumber(isoDayOfWeek, {
              unit: 'day'
            });
          case 'iii':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          case 'iiiii':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          case 'iiiiii':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          case 'iiii':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      a: function (date, token2, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';
        switch (token2) {
          case 'a':
          case 'aa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });
          case 'aaa':
            return localize
              .dayPeriod(dayPeriodEnumValue, {
                width: 'abbreviated',
                context: 'formatting'
              })
              .toLowerCase();
          case 'aaaaa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });
          case 'aaaa':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      b: function (date, token2, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue;
        if (hours === 12) {
          dayPeriodEnumValue = dayPeriodEnum.noon;
        } else if (hours === 0) {
          dayPeriodEnumValue = dayPeriodEnum.midnight;
        } else {
          dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';
        }
        switch (token2) {
          case 'b':
          case 'bb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });
          case 'bbb':
            return localize
              .dayPeriod(dayPeriodEnumValue, {
                width: 'abbreviated',
                context: 'formatting'
              })
              .toLowerCase();
          case 'bbbbb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });
          case 'bbbb':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      B: function (date, token2, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue;
        if (hours >= 17) {
          dayPeriodEnumValue = dayPeriodEnum.evening;
        } else if (hours >= 12) {
          dayPeriodEnumValue = dayPeriodEnum.afternoon;
        } else if (hours >= 4) {
          dayPeriodEnumValue = dayPeriodEnum.morning;
        } else {
          dayPeriodEnumValue = dayPeriodEnum.night;
        }
        switch (token2) {
          case 'B':
          case 'BB':
          case 'BBB':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });
          case 'BBBBB':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });
          case 'BBBB':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      h: function (date, token2, localize) {
        if (token2 === 'ho') {
          var hours = date.getUTCHours() % 12;
          if (hours === 0) hours = 12;
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }
        return _index.default.h(date, token2);
      },
      H: function (date, token2, localize) {
        if (token2 === 'Ho') {
          return localize.ordinalNumber(date.getUTCHours(), {
            unit: 'hour'
          });
        }
        return _index.default.H(date, token2);
      },
      K: function (date, token2, localize) {
        var hours = date.getUTCHours() % 12;
        if (token2 === 'Ko') {
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }
        return (0, _index7.default)(hours, token2.length);
      },
      k: function (date, token2, localize) {
        var hours = date.getUTCHours();
        if (hours === 0) hours = 24;
        if (token2 === 'ko') {
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }
        return (0, _index7.default)(hours, token2.length);
      },
      m: function (date, token2, localize) {
        if (token2 === 'mo') {
          return localize.ordinalNumber(date.getUTCMinutes(), {
            unit: 'minute'
          });
        }
        return _index.default.m(date, token2);
      },
      s: function (date, token2, localize) {
        if (token2 === 'so') {
          return localize.ordinalNumber(date.getUTCSeconds(), {
            unit: 'second'
          });
        }
        return _index.default.s(date, token2);
      },
      S: function (date, token2) {
        return _index.default.S(date, token2);
      },
      X: function (date, token2, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();
        if (timezoneOffset === 0) {
          return 'Z';
        }
        switch (token2) {
          case 'X':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          case 'XXXX':
          case 'XX':
            return formatTimezone(timezoneOffset);
          case 'XXXXX':
          case 'XXX':
          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      x: function (date, token2, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();
        switch (token2) {
          case 'x':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          case 'xxxx':
          case 'xx':
            return formatTimezone(timezoneOffset);
          case 'xxxxx':
          case 'xxx':
          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      O: function (date, token2, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();
        switch (token2) {
          case 'O':
          case 'OO':
          case 'OOO':
            return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
          case 'OOOO':
          default:
            return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
      },
      z: function (date, token2, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();
        switch (token2) {
          case 'z':
          case 'zz':
          case 'zzz':
            return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
          case 'zzzz':
          default:
            return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
      },
      t: function (date, token2, _localize, options) {
        var originalDate = options._originalDate || date;
        var timestamp = Math.floor(originalDate.getTime() / 1e3);
        return (0, _index7.default)(timestamp, token2.length);
      },
      T: function (date, token2, _localize, options) {
        var originalDate = options._originalDate || date;
        var timestamp = originalDate.getTime();
        return (0, _index7.default)(timestamp, token2.length);
      }
    };
    function formatTimezoneShort(offset, dirtyDelimiter) {
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = Math.floor(absOffset / 60);
      var minutes = absOffset % 60;
      if (minutes === 0) {
        return sign + String(hours);
      }
      var delimiter = dirtyDelimiter || '';
      return sign + String(hours) + delimiter + (0, _index7.default)(minutes, 2);
    }
    function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
      if (offset % 60 === 0) {
        var sign = offset > 0 ? '-' : '+';
        return sign + (0, _index7.default)(Math.abs(offset) / 60, 2);
      }
      return formatTimezone(offset, dirtyDelimiter);
    }
    function formatTimezone(offset, dirtyDelimiter) {
      var delimiter = dirtyDelimiter || '';
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = (0, _index7.default)(Math.floor(absOffset / 60), 2);
      var minutes = (0, _index7.default)(absOffset % 60, 2);
      return sign + hours + delimiter + minutes;
    }
    var _default = formatters;
    exports2.default = _default;
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/format/longFormatters/index.js
var require_longFormatters = __commonJS({
  'node_modules/date-fns/_lib/format/longFormatters/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = void 0;
    function dateLongFormatter(pattern, formatLong) {
      switch (pattern) {
        case 'P':
          return formatLong.date({
            width: 'short'
          });
        case 'PP':
          return formatLong.date({
            width: 'medium'
          });
        case 'PPP':
          return formatLong.date({
            width: 'long'
          });
        case 'PPPP':
        default:
          return formatLong.date({
            width: 'full'
          });
      }
    }
    function timeLongFormatter(pattern, formatLong) {
      switch (pattern) {
        case 'p':
          return formatLong.time({
            width: 'short'
          });
        case 'pp':
          return formatLong.time({
            width: 'medium'
          });
        case 'ppp':
          return formatLong.time({
            width: 'long'
          });
        case 'pppp':
        default:
          return formatLong.time({
            width: 'full'
          });
      }
    }
    function dateTimeLongFormatter(pattern, formatLong) {
      var matchResult = pattern.match(/(P+)(p+)?/);
      var datePattern = matchResult[1];
      var timePattern = matchResult[2];
      if (!timePattern) {
        return dateLongFormatter(pattern, formatLong);
      }
      var dateTimeFormat;
      switch (datePattern) {
        case 'P':
          dateTimeFormat = formatLong.dateTime({
            width: 'short'
          });
          break;
        case 'PP':
          dateTimeFormat = formatLong.dateTime({
            width: 'medium'
          });
          break;
        case 'PPP':
          dateTimeFormat = formatLong.dateTime({
            width: 'long'
          });
          break;
        case 'PPPP':
        default:
          dateTimeFormat = formatLong.dateTime({
            width: 'full'
          });
          break;
      }
      return dateTimeFormat
        .replace('{{date}}', dateLongFormatter(datePattern, formatLong))
        .replace('{{time}}', timeLongFormatter(timePattern, formatLong));
    }
    var longFormatters = {
      p: timeLongFormatter,
      P: dateTimeLongFormatter
    };
    var _default = longFormatters;
    exports2.default = _default;
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds/index.js
var require_getTimezoneOffsetInMilliseconds = __commonJS({
  'node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = getTimezoneOffsetInMilliseconds;
    function getTimezoneOffsetInMilliseconds(date) {
      var utcDate = new Date(
        Date.UTC(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
          date.getMilliseconds()
        )
      );
      utcDate.setUTCFullYear(date.getFullYear());
      return date.getTime() - utcDate.getTime();
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/protectedTokens/index.js
var require_protectedTokens = __commonJS({
  'node_modules/date-fns/_lib/protectedTokens/index.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.isProtectedDayOfYearToken = isProtectedDayOfYearToken;
    exports2.isProtectedWeekYearToken = isProtectedWeekYearToken;
    exports2.throwProtectedError = throwProtectedError;
    var protectedDayOfYearTokens = ['D', 'DD'];
    var protectedWeekYearTokens = ['YY', 'YYYY'];
    function isProtectedDayOfYearToken(token2) {
      return protectedDayOfYearTokens.indexOf(token2) !== -1;
    }
    function isProtectedWeekYearToken(token2) {
      return protectedWeekYearTokens.indexOf(token2) !== -1;
    }
    function throwProtectedError(token2, format, input) {
      if (token2 === 'YYYY') {
        throw new RangeError(
          'Use `yyyy` instead of `YYYY` (in `'
            .concat(format, '`) for formatting years to the input `')
            .concat(input, '`; see: https://git.io/fxCyr')
        );
      } else if (token2 === 'YY') {
        throw new RangeError(
          'Use `yy` instead of `YY` (in `'
            .concat(format, '`) for formatting years to the input `')
            .concat(input, '`; see: https://git.io/fxCyr')
        );
      } else if (token2 === 'D') {
        throw new RangeError(
          'Use `d` instead of `D` (in `'
            .concat(format, '`) for formatting days of the month to the input `')
            .concat(input, '`; see: https://git.io/fxCyr')
        );
      } else if (token2 === 'DD') {
        throw new RangeError(
          'Use `dd` instead of `DD` (in `'
            .concat(format, '`) for formatting days of the month to the input `')
            .concat(input, '`; see: https://git.io/fxCyr')
        );
      }
    }
  }
});

// node_modules/date-fns/format/index.js
var require_format = __commonJS({
  'node_modules/date-fns/format/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = format;
    var _index = _interopRequireDefault(require_isValid());
    var _index2 = _interopRequireDefault(require_en_US());
    var _index3 = _interopRequireDefault(require_subMilliseconds());
    var _index4 = _interopRequireDefault(require_toDate());
    var _index5 = _interopRequireDefault(require_formatters());
    var _index6 = _interopRequireDefault(require_longFormatters());
    var _index7 = _interopRequireDefault(require_getTimezoneOffsetInMilliseconds());
    var _index8 = require_protectedTokens();
    var _index9 = _interopRequireDefault(require_toInteger());
    var _index10 = _interopRequireDefault(require_requiredArgs());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
    var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
    var escapedStringRegExp = /^'([^]*?)'?$/;
    var doubleQuoteRegExp = /''/g;
    var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
    function format(dirtyDate, dirtyFormatStr, dirtyOptions) {
      (0, _index10.default)(2, arguments);
      var formatStr = String(dirtyFormatStr);
      var options = dirtyOptions || {};
      var locale = options.locale || _index2.default;
      var localeFirstWeekContainsDate = locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate =
        localeFirstWeekContainsDate == null ? 1 : (0, _index9.default)(localeFirstWeekContainsDate);
      var firstWeekContainsDate =
        options.firstWeekContainsDate == null
          ? defaultFirstWeekContainsDate
          : (0, _index9.default)(options.firstWeekContainsDate);
      if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
        throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
      }
      var localeWeekStartsOn = locale.options && locale.options.weekStartsOn;
      var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : (0, _index9.default)(localeWeekStartsOn);
      var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : (0, _index9.default)(options.weekStartsOn);
      if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
        throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
      }
      if (!locale.localize) {
        throw new RangeError('locale must contain localize property');
      }
      if (!locale.formatLong) {
        throw new RangeError('locale must contain formatLong property');
      }
      var originalDate = (0, _index4.default)(dirtyDate);
      if (!(0, _index.default)(originalDate)) {
        throw new RangeError('Invalid time value');
      }
      var timezoneOffset = (0, _index7.default)(originalDate);
      var utcDate = (0, _index3.default)(originalDate, timezoneOffset);
      var formatterOptions = {
        firstWeekContainsDate,
        weekStartsOn,
        locale,
        _originalDate: originalDate
      };
      var result = formatStr
        .match(longFormattingTokensRegExp)
        .map(function (substring) {
          var firstCharacter = substring[0];
          if (firstCharacter === 'p' || firstCharacter === 'P') {
            var longFormatter = _index6.default[firstCharacter];
            return longFormatter(substring, locale.formatLong, formatterOptions);
          }
          return substring;
        })
        .join('')
        .match(formattingTokensRegExp)
        .map(function (substring) {
          if (substring === "''") {
            return "'";
          }
          var firstCharacter = substring[0];
          if (firstCharacter === "'") {
            return cleanEscapedString(substring);
          }
          var formatter = _index5.default[firstCharacter];
          if (formatter) {
            if (!options.useAdditionalWeekYearTokens && (0, _index8.isProtectedWeekYearToken)(substring)) {
              (0, _index8.throwProtectedError)(substring, dirtyFormatStr, dirtyDate);
            }
            if (!options.useAdditionalDayOfYearTokens && (0, _index8.isProtectedDayOfYearToken)(substring)) {
              (0, _index8.throwProtectedError)(substring, dirtyFormatStr, dirtyDate);
            }
            return formatter(utcDate, substring, locale.localize, formatterOptions);
          }
          if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
            throw new RangeError('Format string contains an unescaped latin alphabet character `' + firstCharacter + '`');
          }
          return substring;
        })
        .join('');
      return result;
    }
    function cleanEscapedString(input) {
      return input.match(escapedStringRegExp)[1].replace(doubleQuoteRegExp, "'");
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns-tz/_lib/tzIntlTimeZoneName/index.js
var require_tzIntlTimeZoneName = __commonJS({
  'node_modules/date-fns-tz/_lib/tzIntlTimeZoneName/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = tzIntlTimeZoneName;
    function tzIntlTimeZoneName(length, date, options) {
      var dtf = getDTF(length, options.timeZone, options.locale);
      return dtf.formatToParts ? partsTimeZone(dtf, date) : hackyTimeZone(dtf, date);
    }
    function partsTimeZone(dtf, date) {
      var formatted = dtf.formatToParts(date);
      return formatted[formatted.length - 1].value;
    }
    function hackyTimeZone(dtf, date) {
      var formatted = dtf.format(date).replace(/\u200E/g, '');
      var tzNameMatch = / [\w-+ ]+$/.exec(formatted);
      return tzNameMatch ? tzNameMatch[0].substr(1) : '';
    }
    function getDTF(length, timeZone, locale) {
      if (locale && !locale.code) {
        throw new Error(
          "date-fns-tz error: Please set a language code on the locale object imported from date-fns, e.g. `locale.code = 'en-US'`"
        );
      }
      return new Intl.DateTimeFormat(locale ? [locale.code, 'en-US'] : void 0, {
        timeZone,
        timeZoneName: length
      });
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns-tz/_lib/tzTokenizeDate/index.js
var require_tzTokenizeDate = __commonJS({
  'node_modules/date-fns-tz/_lib/tzTokenizeDate/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = tzTokenizeDate;
    function tzTokenizeDate(date, timeZone) {
      var dtf = getDateTimeFormat(timeZone);
      return dtf.formatToParts ? partsOffset(dtf, date) : hackyOffset(dtf, date);
    }
    var typeToPos = {
      year: 0,
      month: 1,
      day: 2,
      hour: 3,
      minute: 4,
      second: 5
    };
    function partsOffset(dtf, date) {
      var formatted = dtf.formatToParts(date);
      var filled = [];
      for (var i = 0; i < formatted.length; i++) {
        var pos = typeToPos[formatted[i].type];
        if (pos >= 0) {
          filled[pos] = parseInt(formatted[i].value, 10);
        }
      }
      return filled;
    }
    function hackyOffset(dtf, date) {
      var formatted = dtf.format(date).replace(/\u200E/g, '');
      var parsed = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(formatted);
      return [parsed[3], parsed[1], parsed[2], parsed[4], parsed[5], parsed[6]];
    }
    var dtfCache = {};
    function getDateTimeFormat(timeZone) {
      if (!dtfCache[timeZone]) {
        var testDateFormatted = new Intl.DateTimeFormat('en-US', {
          hour12: false,
          timeZone: 'America/New_York',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).format(new Date('2014-06-25T04:00:00.123Z'));
        var hourCycleSupported =
          testDateFormatted === '06/25/2014, 00:00:00' ||
          testDateFormatted === '\u200E06\u200E/\u200E25\u200E/\u200E2014\u200E \u200E00\u200E:\u200E00\u200E:\u200E00';
        dtfCache[timeZone] = hourCycleSupported
          ? new Intl.DateTimeFormat('en-US', {
              hour12: false,
              timeZone,
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })
          : new Intl.DateTimeFormat('en-US', {
              hourCycle: 'h23',
              timeZone,
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
      }
      return dtfCache[timeZone];
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns-tz/_lib/tzParseTimezone/index.js
var require_tzParseTimezone = __commonJS({
  'node_modules/date-fns-tz/_lib/tzParseTimezone/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = tzParseTimezone;
    var _index = _interopRequireDefault(require_tzTokenizeDate());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var MILLISECONDS_IN_HOUR = 36e5;
    var MILLISECONDS_IN_MINUTE = 6e4;
    var patterns = {
      timezone: /([Z+-].*)$/,
      timezoneZ: /^(Z)$/,
      timezoneHH: /^([+-])(\d{2})$/,
      timezoneHHMM: /^([+-])(\d{2}):?(\d{2})$/,
      timezoneIANA: /(UTC|(?:[a-zA-Z]+\/[a-zA-Z_-]+(?:\/[a-zA-Z_]+)?))$/
    };
    function tzParseTimezone(timezoneString, date, isUtcDate) {
      var token2;
      var absoluteOffset;
      token2 = patterns.timezoneZ.exec(timezoneString);
      if (token2) {
        return 0;
      }
      var hours;
      token2 = patterns.timezoneHH.exec(timezoneString);
      if (token2) {
        hours = parseInt(token2[2], 10);
        if (!validateTimezone(hours)) {
          return NaN;
        }
        absoluteOffset = hours * MILLISECONDS_IN_HOUR;
        return token2[1] === '+' ? -absoluteOffset : absoluteOffset;
      }
      token2 = patterns.timezoneHHMM.exec(timezoneString);
      if (token2) {
        hours = parseInt(token2[2], 10);
        var minutes = parseInt(token2[3], 10);
        if (!validateTimezone(hours, minutes)) {
          return NaN;
        }
        absoluteOffset = hours * MILLISECONDS_IN_HOUR + minutes * MILLISECONDS_IN_MINUTE;
        return token2[1] === '+' ? -absoluteOffset : absoluteOffset;
      }
      token2 = patterns.timezoneIANA.exec(timezoneString);
      if (token2) {
        date = new Date(date || Date.now());
        var utcDate = isUtcDate ? date : toUtcDate(date);
        var offset = calcOffset(utcDate, timezoneString);
        var fixedOffset = isUtcDate ? offset : fixOffset(date, offset, timezoneString);
        return -fixedOffset;
      }
      return 0;
    }
    function toUtcDate(date) {
      return new Date(
        Date.UTC(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
          date.getMilliseconds()
        )
      );
    }
    function calcOffset(date, timezoneString) {
      var tokens = (0, _index.default)(date, timezoneString);
      var asUTC = Date.UTC(tokens[0], tokens[1] - 1, tokens[2], tokens[3] % 24, tokens[4], tokens[5]);
      var asTS = date.getTime();
      var over = asTS % 1e3;
      asTS -= over >= 0 ? over : 1e3 + over;
      return asUTC - asTS;
    }
    function fixOffset(date, offset, timezoneString) {
      var localTS = date.getTime();
      var utcGuess = localTS - offset;
      var o2 = calcOffset(new Date(utcGuess), timezoneString);
      if (offset === o2) {
        return offset;
      }
      utcGuess -= o2 - offset;
      var o3 = calcOffset(new Date(utcGuess), timezoneString);
      if (o2 === o3) {
        return o2;
      }
      return Math.max(o2, o3);
    }
    function validateTimezone(hours, minutes) {
      if (minutes != null && (minutes < 0 || minutes > 59)) {
        return false;
      }
      return true;
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns-tz/format/formatters/index.js
var require_formatters2 = __commonJS({
  'node_modules/date-fns-tz/format/formatters/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = void 0;
    var _tzIntlTimeZoneName = _interopRequireDefault(require_tzIntlTimeZoneName());
    var _tzParseTimezone = _interopRequireDefault(require_tzParseTimezone());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var MILLISECONDS_IN_MINUTE = 60 * 1e3;
    var formatters = {
      X: function (date, token2, localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = options.timeZone
          ? (0, _tzParseTimezone.default)(options.timeZone, originalDate) / MILLISECONDS_IN_MINUTE
          : originalDate.getTimezoneOffset();
        if (timezoneOffset === 0) {
          return 'Z';
        }
        switch (token2) {
          case 'X':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          case 'XXXX':
          case 'XX':
            return formatTimezone(timezoneOffset);
          case 'XXXXX':
          case 'XXX':
          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      x: function (date, token2, localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = options.timeZone
          ? (0, _tzParseTimezone.default)(options.timeZone, originalDate) / MILLISECONDS_IN_MINUTE
          : originalDate.getTimezoneOffset();
        switch (token2) {
          case 'x':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          case 'xxxx':
          case 'xx':
            return formatTimezone(timezoneOffset);
          case 'xxxxx':
          case 'xxx':
          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      O: function (date, token2, localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = options.timeZone
          ? (0, _tzParseTimezone.default)(options.timeZone, originalDate) / MILLISECONDS_IN_MINUTE
          : originalDate.getTimezoneOffset();
        switch (token2) {
          case 'O':
          case 'OO':
          case 'OOO':
            return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
          case 'OOOO':
          default:
            return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
      },
      z: function (date, token2, localize, options) {
        var originalDate = options._originalDate || date;
        switch (token2) {
          case 'z':
          case 'zz':
          case 'zzz':
            return (0, _tzIntlTimeZoneName.default)('short', originalDate, options);
          case 'zzzz':
          default:
            return (0, _tzIntlTimeZoneName.default)('long', originalDate, options);
        }
      }
    };
    function addLeadingZeros(number, targetLength) {
      var sign = number < 0 ? '-' : '';
      var output = Math.abs(number).toString();
      while (output.length < targetLength) {
        output = '0' + output;
      }
      return sign + output;
    }
    function formatTimezone(offset, dirtyDelimeter) {
      var delimeter = dirtyDelimeter || '';
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
      var minutes = addLeadingZeros(absOffset % 60, 2);
      return sign + hours + delimeter + minutes;
    }
    function formatTimezoneWithOptionalMinutes(offset, dirtyDelimeter) {
      if (offset % 60 === 0) {
        var sign = offset > 0 ? '-' : '+';
        return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
      }
      return formatTimezone(offset, dirtyDelimeter);
    }
    function formatTimezoneShort(offset, dirtyDelimeter) {
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = Math.floor(absOffset / 60);
      var minutes = absOffset % 60;
      if (minutes === 0) {
        return sign + String(hours);
      }
      var delimeter = dirtyDelimeter || '';
      return sign + String(hours) + delimeter + addLeadingZeros(minutes, 2);
    }
    var _default = formatters;
    exports2.default = _default;
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns-tz/toDate/index.js
var require_toDate2 = __commonJS({
  'node_modules/date-fns-tz/toDate/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = toDate;
    var _index = _interopRequireDefault(require_toInteger());
    var _index2 = _interopRequireDefault(require_getTimezoneOffsetInMilliseconds());
    var _tzParseTimezone = _interopRequireDefault(require_tzParseTimezone());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var MILLISECONDS_IN_HOUR = 36e5;
    var MILLISECONDS_IN_MINUTE = 6e4;
    var DEFAULT_ADDITIONAL_DIGITS = 2;
    var patterns = {
      dateTimeDelimeter: /[T ]/,
      plainTime: /:/,
      timeZoneDelimeter: /[Z ]/i,
      YY: /^(\d{2})$/,
      YYY: [/^([+-]\d{2})$/, /^([+-]\d{3})$/, /^([+-]\d{4})$/],
      YYYY: /^(\d{4})/,
      YYYYY: [/^([+-]\d{4})/, /^([+-]\d{5})/, /^([+-]\d{6})/],
      MM: /^-(\d{2})$/,
      DDD: /^-?(\d{3})$/,
      MMDD: /^-?(\d{2})-?(\d{2})$/,
      Www: /^-?W(\d{2})$/,
      WwwD: /^-?W(\d{2})-?(\d{1})$/,
      HH: /^(\d{2}([.,]\d*)?)$/,
      HHMM: /^(\d{2}):?(\d{2}([.,]\d*)?)$/,
      HHMMSS: /^(\d{2}):?(\d{2}):?(\d{2}([.,]\d*)?)$/,
      timezone: /([Z+-].*| UTC|(?:[a-zA-Z]+\/[a-zA-Z_]+(?:\/[a-zA-Z_]+)?))$/
    };
    function toDate(argument, dirtyOptions) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }
      if (argument === null) {
        return new Date(NaN);
      }
      var options = dirtyOptions || {};
      var additionalDigits =
        options.additionalDigits == null ? DEFAULT_ADDITIONAL_DIGITS : (0, _index.default)(options.additionalDigits);
      if (additionalDigits !== 2 && additionalDigits !== 1 && additionalDigits !== 0) {
        throw new RangeError('additionalDigits must be 0, 1 or 2');
      }
      if (
        argument instanceof Date ||
        (typeof argument === 'object' && Object.prototype.toString.call(argument) === '[object Date]')
      ) {
        return new Date(argument.getTime());
      } else if (typeof argument === 'number' || Object.prototype.toString.call(argument) === '[object Number]') {
        return new Date(argument);
      } else if (!(typeof argument === 'string' || Object.prototype.toString.call(argument) === '[object String]')) {
        return new Date(NaN);
      }
      var dateStrings = splitDateString(argument);
      var parseYearResult = parseYear(dateStrings.date, additionalDigits);
      var year = parseYearResult.year;
      var restDateString = parseYearResult.restDateString;
      var date = parseDate(restDateString, year);
      if (isNaN(date)) {
        return new Date(NaN);
      }
      if (date) {
        var timestamp = date.getTime();
        var time = 0;
        var offset;
        if (dateStrings.time) {
          time = parseTime(dateStrings.time);
          if (isNaN(time)) {
            return new Date(NaN);
          }
        }
        if (dateStrings.timezone || options.timeZone) {
          offset = (0, _tzParseTimezone.default)(dateStrings.timezone || options.timeZone, new Date(timestamp + time));
          if (isNaN(offset)) {
            return new Date(NaN);
          }
        } else {
          offset = (0, _index2.default)(new Date(timestamp + time));
          offset = (0, _index2.default)(new Date(timestamp + time + offset));
        }
        return new Date(timestamp + time + offset);
      } else {
        return new Date(NaN);
      }
    }
    function splitDateString(dateString) {
      var dateStrings = {};
      var array = dateString.split(patterns.dateTimeDelimeter);
      var timeString;
      if (patterns.plainTime.test(array[0])) {
        dateStrings.date = null;
        timeString = array[0];
      } else {
        dateStrings.date = array[0];
        timeString = array[1];
        dateStrings.timezone = array[2];
        if (patterns.timeZoneDelimeter.test(dateStrings.date)) {
          dateStrings.date = dateString.split(patterns.timeZoneDelimeter)[0];
          timeString = dateString.substr(dateStrings.date.length, dateString.length);
        }
      }
      if (timeString) {
        var token2 = patterns.timezone.exec(timeString);
        if (token2) {
          dateStrings.time = timeString.replace(token2[1], '');
          dateStrings.timezone = token2[1];
        } else {
          dateStrings.time = timeString;
        }
      }
      return dateStrings;
    }
    function parseYear(dateString, additionalDigits) {
      var patternYYY = patterns.YYY[additionalDigits];
      var patternYYYYY = patterns.YYYYY[additionalDigits];
      var token2;
      token2 = patterns.YYYY.exec(dateString) || patternYYYYY.exec(dateString);
      if (token2) {
        var yearString = token2[1];
        return {
          year: parseInt(yearString, 10),
          restDateString: dateString.slice(yearString.length)
        };
      }
      token2 = patterns.YY.exec(dateString) || patternYYY.exec(dateString);
      if (token2) {
        var centuryString = token2[1];
        return {
          year: parseInt(centuryString, 10) * 100,
          restDateString: dateString.slice(centuryString.length)
        };
      }
      return {
        year: null
      };
    }
    function parseDate(dateString, year) {
      if (year === null) {
        return null;
      }
      var token2;
      var date;
      var month;
      var week;
      if (dateString.length === 0) {
        date = new Date(0);
        date.setUTCFullYear(year);
        return date;
      }
      token2 = patterns.MM.exec(dateString);
      if (token2) {
        date = new Date(0);
        month = parseInt(token2[1], 10) - 1;
        if (!validateDate(year, month)) {
          return new Date(NaN);
        }
        date.setUTCFullYear(year, month);
        return date;
      }
      token2 = patterns.DDD.exec(dateString);
      if (token2) {
        date = new Date(0);
        var dayOfYear = parseInt(token2[1], 10);
        if (!validateDayOfYearDate(year, dayOfYear)) {
          return new Date(NaN);
        }
        date.setUTCFullYear(year, 0, dayOfYear);
        return date;
      }
      token2 = patterns.MMDD.exec(dateString);
      if (token2) {
        date = new Date(0);
        month = parseInt(token2[1], 10) - 1;
        var day = parseInt(token2[2], 10);
        if (!validateDate(year, month, day)) {
          return new Date(NaN);
        }
        date.setUTCFullYear(year, month, day);
        return date;
      }
      token2 = patterns.Www.exec(dateString);
      if (token2) {
        week = parseInt(token2[1], 10) - 1;
        if (!validateWeekDate(year, week)) {
          return new Date(NaN);
        }
        return dayOfISOWeekYear(year, week);
      }
      token2 = patterns.WwwD.exec(dateString);
      if (token2) {
        week = parseInt(token2[1], 10) - 1;
        var dayOfWeek = parseInt(token2[2], 10) - 1;
        if (!validateWeekDate(year, week, dayOfWeek)) {
          return new Date(NaN);
        }
        return dayOfISOWeekYear(year, week, dayOfWeek);
      }
      return null;
    }
    function parseTime(timeString) {
      var token2;
      var hours;
      var minutes;
      token2 = patterns.HH.exec(timeString);
      if (token2) {
        hours = parseFloat(token2[1].replace(',', '.'));
        if (!validateTime(hours)) {
          return NaN;
        }
        return (hours % 24) * MILLISECONDS_IN_HOUR;
      }
      token2 = patterns.HHMM.exec(timeString);
      if (token2) {
        hours = parseInt(token2[1], 10);
        minutes = parseFloat(token2[2].replace(',', '.'));
        if (!validateTime(hours, minutes)) {
          return NaN;
        }
        return (hours % 24) * MILLISECONDS_IN_HOUR + minutes * MILLISECONDS_IN_MINUTE;
      }
      token2 = patterns.HHMMSS.exec(timeString);
      if (token2) {
        hours = parseInt(token2[1], 10);
        minutes = parseInt(token2[2], 10);
        var seconds = parseFloat(token2[3].replace(',', '.'));
        if (!validateTime(hours, minutes, seconds)) {
          return NaN;
        }
        return (hours % 24) * MILLISECONDS_IN_HOUR + minutes * MILLISECONDS_IN_MINUTE + seconds * 1e3;
      }
      return null;
    }
    function dayOfISOWeekYear(isoWeekYear, week, day) {
      week = week || 0;
      day = day || 0;
      var date = new Date(0);
      date.setUTCFullYear(isoWeekYear, 0, 4);
      var fourthOfJanuaryDay = date.getUTCDay() || 7;
      var diff = week * 7 + day + 1 - fourthOfJanuaryDay;
      date.setUTCDate(date.getUTCDate() + diff);
      return date;
    }
    var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var DAYS_IN_MONTH_LEAP_YEAR = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function isLeapYearIndex(year) {
      return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
    }
    function validateDate(year, month, date) {
      if (month < 0 || month > 11) {
        return false;
      }
      if (date != null) {
        if (date < 1) {
          return false;
        }
        var isLeapYear = isLeapYearIndex(year);
        if (isLeapYear && date > DAYS_IN_MONTH_LEAP_YEAR[month]) {
          return false;
        }
        if (!isLeapYear && date > DAYS_IN_MONTH[month]) {
          return false;
        }
      }
      return true;
    }
    function validateDayOfYearDate(year, dayOfYear) {
      if (dayOfYear < 1) {
        return false;
      }
      var isLeapYear = isLeapYearIndex(year);
      if (isLeapYear && dayOfYear > 366) {
        return false;
      }
      if (!isLeapYear && dayOfYear > 365) {
        return false;
      }
      return true;
    }
    function validateWeekDate(year, week, day) {
      if (week < 0 || week > 52) {
        return false;
      }
      if (day != null && (day < 0 || day > 6)) {
        return false;
      }
      return true;
    }
    function validateTime(hours, minutes, seconds) {
      if (hours != null && (hours < 0 || hours >= 25)) {
        return false;
      }
      if (minutes != null && (minutes < 0 || minutes >= 60)) {
        return false;
      }
      if (seconds != null && (seconds < 0 || seconds >= 60)) {
        return false;
      }
      return true;
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns-tz/format/index.js
var require_format2 = __commonJS({
  'node_modules/date-fns-tz/format/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = format;
    var _format = _interopRequireDefault(require_format());
    var _formatters = _interopRequireDefault(require_formatters2());
    var _toDate = _interopRequireDefault(require_toDate2());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var tzFormattingTokensRegExp = /([xXOz]+)|''|'(''|[^'])+('|$)/g;
    function format(dirtyDate, dirtyFormatStr, dirtyOptions) {
      var formatStr = String(dirtyFormatStr);
      var options = dirtyOptions || {};
      var matches = formatStr.match(tzFormattingTokensRegExp);
      if (matches) {
        var date = (0, _toDate.default)(dirtyDate, options);
        formatStr = matches.reduce(function (result, token2) {
          return token2[0] === "'"
            ? result
            : result.replace(token2, "'" + _formatters.default[token2[0]](date, token2, null, options) + "'");
        }, formatStr);
      }
      return (0, _format.default)(dirtyDate, formatStr, options);
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns-tz/getTimezoneOffset/index.js
var require_getTimezoneOffset = __commonJS({
  'node_modules/date-fns-tz/getTimezoneOffset/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = getTimezoneOffset;
    var _tzParseTimezone = _interopRequireDefault(require_tzParseTimezone());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function getTimezoneOffset(timeZone, date) {
      return -(0, _tzParseTimezone.default)(timeZone, date);
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns-tz/utcToZonedTime/index.js
var require_utcToZonedTime = __commonJS({
  'node_modules/date-fns-tz/utcToZonedTime/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = utcToZonedTime;
    var _tzParseTimezone = _interopRequireDefault(require_tzParseTimezone());
    var _toDate = _interopRequireDefault(require_toDate2());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function utcToZonedTime(dirtyDate, timeZone, options) {
      var date = (0, _toDate.default)(dirtyDate, options);
      var offsetMilliseconds = (0, _tzParseTimezone.default)(timeZone, date, true) || 0;
      var d = new Date(date.getTime() - offsetMilliseconds);
      var zonedTime = new Date(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds(),
        d.getUTCMilliseconds()
      );
      return zonedTime;
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/assign/index.js
var require_assign = __commonJS({
  'node_modules/date-fns/_lib/assign/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = assign;
    function assign(target, dirtyObject) {
      if (target == null) {
        throw new TypeError('assign requires that input parameter not be null or undefined');
      }
      dirtyObject = dirtyObject || {};
      for (var property in dirtyObject) {
        if (dirtyObject.hasOwnProperty(property)) {
          target[property] = dirtyObject[property];
        }
      }
      return target;
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns/_lib/cloneObject/index.js
var require_cloneObject = __commonJS({
  'node_modules/date-fns/_lib/cloneObject/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = cloneObject;
    var _index = _interopRequireDefault(require_assign());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function cloneObject(dirtyObject) {
      return (0, _index.default)({}, dirtyObject);
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns-tz/zonedTimeToUtc/index.js
var require_zonedTimeToUtc = __commonJS({
  'node_modules/date-fns-tz/zonedTimeToUtc/index.js'(exports2, module2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', {
      value: true
    });
    exports2.default = zonedTimeToUtc;
    var _cloneObject = _interopRequireDefault(require_cloneObject());
    var _format = _interopRequireDefault(require_format());
    var _toDate = _interopRequireDefault(require_toDate2());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function zonedTimeToUtc(date, timeZone, options) {
      if (date instanceof Date) {
        date = (0, _format.default)(date, "yyyy-MM-dd'T'HH:mm:ss.SSS");
      }
      var extendedOptions = (0, _cloneObject.default)(options);
      extendedOptions.timeZone = timeZone;
      return (0, _toDate.default)(date, extendedOptions);
    }
    module2.exports = exports2.default;
  }
});

// node_modules/date-fns-tz/index.js
var require_date_fns_tz = __commonJS({
  'node_modules/date-fns-tz/index.js'(exports2, module2) {
    'use strict';
    module2.exports = {
      format: require_format2(),
      getTimezoneOffset: require_getTimezoneOffset(),
      toDate: require_toDate2(),
      utcToZonedTime: require_utcToZonedTime(),
      zonedTimeToUtc: require_zonedTimeToUtc()
    };
  }
});

// src/markup.js
var require_markup = __commonJS({
  'src/markup.js'(exports2, module2) {
    var core2 = require_core();
    var { format, utcToZonedTime } = require_date_fns_tz();
    var timezone = core2.getInput('timezone') || 'Etc/UTC';
    function getMarkupForTrx2(testData) {
      return `
  # ${testData.ReportMetaData.ReportTitle}
  ${getBadge(testData)}
  ${getTestTimes(testData)}
  ${getTestCounters(testData)}
  ${getTestResultsMarkup(testData)}
  `;
    }
    function getBadge(testData) {
      const failedCount = testData.TrxData.TestRun.ResultSummary.Counters._failed;
      const passedCount = testData.TrxData.TestRun.ResultSummary.Counters._passed;
      const totalCount = testData.TrxData.TestRun.ResultSummary.Counters._total;
      const testOutcome = testData.TrxData.TestRun.ResultSummary._outcome;
      const badgeCountText = failedCount > 0 ? `${`${failedCount}/${totalCount}`}` : `${`${passedCount}/${totalCount}`}`;
      const badgeStatusText = failedCount > 0 || testOutcome === 'Failed' ? 'FAILED' : 'PASSED';
      const badgeColor = failedCount > 0 || testOutcome === 'Failed' ? 'red' : 'brightgreen';
      return `![Generic badge](https://img.shields.io/badge/${badgeCountText}-${badgeStatusText}-${badgeColor}.svg)`;
    }
    function formatDate(dateToFormat) {
      if (timezone && timezone.length > 0) {
        let dateWithTimezone = utcToZonedTime(dateToFormat, timezone);
        return `${format(dateWithTimezone, 'yyyy-MM-dd HH:mm:ss.SSS zzz', { timeZone: timezone })}`;
      } else {
        return format(dateToFormat, 'yyyy-MM-dd HH:mm:ss.SSS zzz');
      }
    }
    function getTestTimes(testData) {
      const startTimeSeconds = new Date(testData.TrxData.TestRun.Times._start).valueOf();
      const endTimeSeconds = new Date(testData.TrxData.TestRun.Times._finish).valueOf();
      const duration = (endTimeSeconds - startTimeSeconds) / 1e3;
      return `
  <details>  
    <summary> Duration: ${duration} seconds </summary>
    <table>
      <tr>
          <th>Start:</th>
          <td><code>${formatDate(testData.TrxData.TestRun.Times._start)}</code></td>
      </tr>
      <tr>
          <th>Creation:</th>
          <td><code>${formatDate(testData.TrxData.TestRun.Times._creation)}</code></td>
      </tr>
      <tr>
          <th>Queuing:</th>
          <td><code>${formatDate(testData.TrxData.TestRun.Times._queuing)}</code></td>
      </tr>
      <tr>
          <th>Finish:</th>
          <td><code>${formatDate(testData.TrxData.TestRun.Times._finish)}</code></td>    
      </tr>
      <tr>
          <th>Duration:</th>
          <td><code>${duration} seconds</code></td>
      </tr>
    </table>
  </details>
  `;
    }
    function getTestCounters(testData) {
      let extraProps = getTableRowIfHasValue('Error:', testData.TrxData.TestRun.ResultSummary.Counters._error);
      extraProps += getTableRowIfHasValue('Timeout:', testData.TrxData.TestRun.ResultSummary.Counters._timeout);
      extraProps += getTableRowIfHasValue('Aborted:', testData.TrxData.TestRun.ResultSummary.Counters._aborted);
      extraProps += getTableRowIfHasValue('Inconclusive:', testData.TrxData.TestRun.ResultSummary.Counters._inconclusive);
      extraProps += getTableRowIfHasValue(
        'PassedButRunAborted:',
        testData.TrxData.TestRun.ResultSummary.Counters._passedButRunAborted
      );
      extraProps += getTableRowIfHasValue('NotRunnable:', testData.TrxData.TestRun.ResultSummary.Counters._notRunnable);
      extraProps += getTableRowIfHasValue('NotExecuted:', testData.TrxData.TestRun.ResultSummary.Counters._notExecuted);
      extraProps += getTableRowIfHasValue('Disconnected:', testData.TrxData.TestRun.ResultSummary.Counters._disconnected);
      extraProps += getTableRowIfHasValue('Warning:', testData.TrxData.TestRun.ResultSummary.Counters._warning);
      extraProps += getTableRowIfHasValue('Completed:', testData.TrxData.TestRun.ResultSummary.Counters._completed);
      extraProps += getTableRowIfHasValue('InProgress:', testData.TrxData.TestRun.ResultSummary.Counters._inProgress);
      extraProps += getTableRowIfHasValue('Pending:', testData.TrxData.TestRun.ResultSummary.Counters._pending);
      return `
  <details>
    <summary> Outcome: ${testData.TrxData.TestRun.ResultSummary._outcome} | Total Tests: ${testData.TrxData.TestRun.ResultSummary.Counters._total} | Passed: ${testData.TrxData.TestRun.ResultSummary.Counters._passed} | Failed: ${testData.TrxData.TestRun.ResultSummary.Counters._failed} </summary>
    <table>
      <tr>
         <th>Total:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._total}</td>
      </tr>
      <tr>
         <th>Executed:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._executed}</td>
      </tr>
      <tr>
         <th>Passed:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._passed}</td>
      </tr>
      <tr>
         <th>Failed:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._failed}</td>    
      </tr>${extraProps}
    </table>
  </details>

  `;
    }
    function getTableRowIfHasValue(heading, data) {
      if (data && data.length > 0 && parseInt(data) > 0) {
        return `
<tr>
  <th>${heading}</th>
  <td>${data}</td>
</tr>`;
      }
      return '';
    }
    function getTestResultsMarkup(testData) {
      let resultsMarkup = '';
      if (testData.IsEmpty) {
        return getNoResultsMarkup(testData);
      } else {
        let unitTests = testData.TrxData.TestRun.TestDefinitions.UnitTest;
        let unitTestResults = testData.TrxData.TestRun.Results.UnitTestResult;
        for (const data of unitTests) {
          const testResult = unitTestResults.find(x => x._testId === data._id);
          if (testResult && testResult._outcome === 'Failed') {
            resultsMarkup += getFailedTestMarkup(data, testResult);
          }
        }
        return resultsMarkup.trim();
      }
    }
    function getNoResultsMarkup(testData) {
      const runInfo = testData.TrxData.TestRun.ResultSummary.RunInfos.RunInfo;
      const testResultIcon = getTestOutcomeIcon(runInfo._outcome);
      const resultsMarkup = `
  <details>
    <summary>${testResultIcon} ${runInfo._computerName}</summary> 
    <table>
      <tr>
        <th>Run Info</th>
        <td><code>${runInfo.Text}</code></td>
      </tr>
    </table>      
    </details>
  `;
      return resultsMarkup;
    }
    function getTestOutcomeIcon(testOutcome) {
      if (testOutcome === 'Passed') return ':heavy_check_mark:';
      if (testOutcome === 'Failed' || testOutcome === 'Error') return ':x:';
      if (testOutcome === 'NotExecuted') return ':radio_button:';
      return ':grey_question:';
    }
    function getFailedTestMarkup(data, testResult) {
      core2.debug(`Processing ${data._name}`);
      const testResultIcon = getTestOutcomeIcon(testResult._outcome);
      let stacktrace = '';
      let errorMessage = '';
      if (testResult && testResult.Output) {
        stacktrace = `<tr>
        <th>Stack Trace:</th>
        <td><pre>${testResult.Output.ErrorInfo.StackTrace}</pre></td>
      </tr>`;
        errorMessage = `<tr>
        <th>Error Message:</th>
        <td><pre>${testResult.Output.ErrorInfo.Message}</pre></td>
      </tr>`;
      }
      return `
  <details>
    <summary>${testResultIcon} ${data._name}</summary>    
    <table>
      <tr>
         <th>Name:</th>
         <td><code>${data._name}</code></td>
      </tr>
      <tr>
         <th>Outcome:</th>
         <td><code>${testResult._outcome}</code></td>
      </tr>
      <tr>
         <th>Start:</th>
         <td><code>${formatDate(testResult._startTime)}</code></td>
      </tr>
      <tr>
         <th>End:</th>
         <td><code>${formatDate(testResult._endTime)}</code></td>
      </tr>
      <tr>
         <th>Duration:</th>
         <td><code>${testResult._duration}</code></td>
      </tr>
      <tr>
        <th>Code Base</th>
        <td><code>${data.TestMethod._codeBase}</code></td>
      </tr>
      <tr>
        <th>Class Name</th>
        <td><code>${data.TestMethod._className}</code></td>
      </tr>
      <tr>
        <th>Method Name</th>
        <td><code>${data.TestMethod._name}</code></td>
      </tr>
      ${errorMessage}
      ${stacktrace}
    </table>
  </details>
  `.trim();
    }
    module2.exports = {
      getMarkupForTrx: getMarkupForTrx2
    };
  }
});

// src/main.js
var core = require_core();
var { findTrxFiles, transformAllTrxToJson, areThereAnyFailingTests } = require_utils2();
var { createStatusCheck, createPrComment } = require_github2();
var { getMarkupForTrx } = require_markup();
var requiredArgOptions = {
  required: true,
  trimWhitespace: true
};
var token = core.getInput('github-token', requiredArgOptions);
var baseDir = core.getInput('base-directory') || '.';
var ignoreTestFailures = core.getInput('ignore-test-failures') == 'true';
var shouldCreateStatusCheck = core.getInput('create-status-check') == 'true';
var shouldCreatePRComment = core.getInput('create-pr-comment') == 'true';
var updateCommentIfOneExists = core.getInput('update-comment-if-one-exists') == 'true';
var commentIdentifier = core.getInput('comment-identifier') || '';
async function run() {
  try {
    const trxFiles = findTrxFiles(baseDir);
    const trxToJson = await transformAllTrxToJson(trxFiles);
    const failingTestsFound = areThereAnyFailingTests(trxToJson);
    let markupForComment = [];
    for (const data of trxToJson) {
      const markupData = getMarkupForTrx(data);
      let conclusion = 'success';
      if (data.TrxData.TestRun.ResultSummary._outcome === 'Failed') {
        conclusion = ignoreTestFailures ? 'neutral' : 'failure';
      }
      if (shouldCreateStatusCheck) {
        await createStatusCheck(token, data, markupData, conclusion);
      }
      if (shouldCreatePRComment) {
        markupForComment.push(markupData);
      }
    }
    if (markupForComment.length > 0) {
      await createPrComment(token, markupForComment.join('\n'), updateCommentIfOneExists, commentIdentifier);
    }
    core.setOutput('test-outcome', failingTestsFound ? 'Failed' : 'Passed');
    core.setOutput('trx-files', trxFiles);
  } catch (error) {
    if (error instanceof RangeError) {
      core.info(error.message);
      core.setOutput('test-outcome', 'Failed');
      return;
    } else {
      core.setFailed(`An error occurred processing the trx files: ${error.message}`);
      core.setOutput('test-outcome', 'Failed');
    }
  }
}
run();
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */
/*! https://mths.be/he v1.2.0 by @mathias | MIT license */
