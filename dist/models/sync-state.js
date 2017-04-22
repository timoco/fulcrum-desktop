'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _minidb = require('minidb');

class SyncState {
  static get tableName() {
    return 'sync_state';
  }

  static get columns() {
    return [{ name: 'accountRowID', column: 'account_id', type: 'integer', null: false }, { name: 'resource', column: 'resource', type: 'string', null: false }, { name: 'scope', column: 'scope', type: 'string' }, { name: 'hash', column: 'hash', type: 'string' }];
  }

  get hash() {
    return this._hash;
  }

  set hash(hash) {
    this._hash = hash;
  }

  get scope() {
    return this._scope;
  }

  set scope(scope) {
    this._scope = scope;
  }
}

exports.default = SyncState;
_minidb.PersistentObject.register(SyncState);
//# sourceMappingURL=sync-state.js.map