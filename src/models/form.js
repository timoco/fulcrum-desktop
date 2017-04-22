import { PersistentObject } from 'minidb';
import { Form as FormBase } from 'fulcrum-core';
import Record from './record';

export default class Form extends FormBase {
  static get tableName() {
    return 'forms';
  }

  static get columns() {
    return [
      { name: 'accountRowID', column: 'account_id', type: 'integer', null: false },
      { name: 'id', column: 'resource_id', type: 'string', null: false },
      { name: 'name', column: 'name', type: 'string', null: false },
      { name: 'version', column: 'version', type: 'integer', null: false },
      { name: 'description', column: 'description', type: 'string' },
      { name: 'elementsJSON', column: 'elements', type: 'json', null: false },
      { name: 'titleFieldKeysJSON', column: 'title_field_keys', type: 'json' },
      { name: 'statusFieldJSON', column: 'status_field', type: 'json' },
      { name: 'lastSync', column: 'last_sync', type: 'datetime' },
      { name: 'createdAt', column: 'created_at', type: 'datetime', null: false },
      { name: 'updatedAt', column: 'updated_at', type: 'datetime', null: false },
      { name: 'deletedAt', column: 'deleted_at', type: 'datetime' }
    ];
  }

  findEachRecord(where, callback) {
    return Record.findEach(this.db, {where: {...where, form_id: this.rowID}}, callback);
  }

  async findRecordsBySQL(sql, values) {
    const tableName = `account_${this._accountRowID}_form_${this.rowID}_view_full`;

    sql = 'SELECT * FROM ' + tableName + (sql ? ' WHERE ' + sql : '');

    const rows = await this.db.all(sql, values);

    const records = [];

    for (const row of rows) {
      const attributes = Record.queryRowToAttributes(row);

      const record = new Record(attributes, this);

      record._db = this.db;

      records.push(record);
    }

    return records;
  }
}

PersistentObject.register(Form);
