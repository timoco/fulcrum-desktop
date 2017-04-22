'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _database = require('./db/database');

var _database2 = _interopRequireDefault(_database);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _account = require('./models/account');

var _account2 = _interopRequireDefault(_account);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let app = null;

class App {
  static get instance() {
    return app;
  }

  constructor() {
    this._plugins = [];
    this._pluginsByName = [];
    this._listeners = {};
    this._api = _api2.default;

    // TODO(zhm) this needs to be adjusted for Windows and Linux
    this._rootDirectory = _path2.default.join(_os2.default.homedir(), 'Documents', 'fulcrum-sync');

    this.mkdirp('data');
    this.mkdirp('plugins');
    this.mkdirp('media');
    this.mkdirp('reports');
  }

  get api() {
    return this._api;
  }

  dir(dir) {
    return _path2.default.join(this._rootDirectory, dir);
  }

  mkdirp(name) {
    _mkdirp2.default.sync(this.dir(name));
  }

  get db() {
    return this._db;
  }

  on(name, func) {
    if (!this._listeners[name]) {
      this._listeners[name] = [];
    }

    this._listeners[name].push(func);
  }

  off(name, func) {
    if (this._listeners[name]) {
      const index = this._listeners.indexOf(func);

      if (index > -1) {
        this._listeners.splice(index, 1);
      }
    }
  }

  emit(name, ...args) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (_this._listeners[name]) {
        for (const listener of _this._listeners[name]) {
          yield listener(...args);
        }
      }
    })();
  }

  initialize() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const file = _path2.default.join(_this2.dir('data'), 'fulcrum.db');

      _this2._db = yield (0, _database2.default)({ file });

      yield _this2.initializePlugins();
    })();
  }

  dispose() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      for (const plugin of _this3._plugins) {
        if (plugin.dispose) {
          yield plugin.dispose();
        }
      }

      yield _this3._db.close();
    })();
  }

  runTask(command) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const name = command.args._[1];

      const plugin = _this4._pluginsByName[name];

      if (plugin && plugin.runTask) {
        yield plugin.runTask({ app: _this4, yargs: _yargs2.default });
      } else {
        console.error('Plugin named', name, 'not found');
      }
    })();
  }

  initializePlugins() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      const pluginPaths = _glob2.default.sync(_path2.default.join(_this5.dir('plugins'), '*', 'plugin.js'));

      for (const pluginPath of pluginPaths) {
        const fullPath = _path2.default.resolve(pluginPath);

        const PluginClass = require(fullPath).default;

        const plugin = new PluginClass({ db: _this5.db, app: _this5 });

        const nameParts = _path2.default.dirname(fullPath).split(_path2.default.sep);
        const name = nameParts[nameParts.length - 1];

        _this5._pluginsByName[name] = plugin;
        _this5._plugins.push(plugin);

        console.log('Loading plugin', fullPath);

        yield plugin.initialize({ app: _this5 });
      }
    })();
  }

  fetchAccount(name) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      const where = {};

      if (name) {
        where.organization_name = name;
      }

      const accounts = yield _account2.default.findAll(_this6.db, where);

      return accounts[0];
    })();
  }
}

app = new App();

exports.default = app;
//# sourceMappingURL=app.js.map