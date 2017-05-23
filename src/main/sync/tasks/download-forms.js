import Task from './task';
import Client from '../../api/client';
import Form from '../../models/form';
import {format} from 'util';
// import SQLiteRecordValues from '../../models/record-values/sqlite-record-values';

import Schema from 'fulcrum-schema/dist/schema';
import Metadata from 'fulcrum-schema/dist/metadata';
import V2 from 'fulcrum-schema/dist/schemas/postgres-query-v2';
import sqldiff from 'sqldiff';

const {SchemaDiffer, Sqlite} = sqldiff;

export default class DownloadForms extends Task {
  async run({account, dataSource}) {
    const sync = await this.checkSyncState(account, 'forms');

    if (!sync.needsUpdate) {
      return;
    }

    this.progress({message: this.downloading + ' forms'});

    const response = await Client.getForms(account);

    const objects = JSON.parse(response.body).forms;

    this.progress({message: this.processing + ' forms', count: 0, total: objects.length});

    const localObjects = await account.findForms();

    this.markDeletedObjects(localObjects, objects);

    for (let index = 0; index < objects.length; ++index) {
      const attributes = objects[index];

      const object = await Form.findOrCreate(account.db, {resource_id: attributes.id, account_id: account.rowID});

      let oldForm = null;

      if (object.isPersisted) {
        oldForm = {
          id: object._id,
          row_id: object.rowID,
          name: object._name,
          elements: object._elementsJSON
        };
      }

      const isChanged = !object.isPersisted || attributes.version !== object.version;

      object.updateFromAPIAttributes(attributes);
      object._deletedAt = null;

      await object.save();

      const newForm = {
        id: object.id,
        row_id: object.rowID,
        name: object._name,
        elements: object._elementsJSON
      };

      // await account.db.execute(format('DROP VIEW IF EXISTS %s',
      //                                 account.db.ident(object.name)));

      const statements = await this.updateFormTables(account, oldForm, newForm);

      // await account.db.execute(format('CREATE VIEW %s AS SELECT * FROM %s_view_full',
      //                                 account.db.ident(object.name),
      //                                 SQLiteRecordValues.tableNameWithForm(object)));

      if (isChanged) {
        await this.trigger('form:save', {form: object, account, statements, oldForm, newForm});
      }

      this.progress({message: this.processing + ' forms', count: index + 1, total: objects.length});
    }

    await sync.update();

    dataSource.source.invalidate('forms');

    this.progress({message: this.finished + ' forms', count: objects.length, total: objects.length});
  }

  async updateFormTables(account, oldForm, newForm) {
    let oldSchema = null;
    let newSchema = null;

    if (oldForm) {
      oldSchema = new Schema(oldForm, V2, null);
    }

    if (newForm) {
      newSchema = new Schema(newForm, V2, null);
    }

    const tablePrefix = 'account_' + account.rowID + '_';

    const differ = new SchemaDiffer(oldSchema, newSchema);

    const meta = new Metadata(differ, {tablePrefix, quote: '`', includeColumns: true});

    const generator = new Sqlite(differ, {afterTransform: meta.build.bind(meta)});

    generator.tablePrefix = tablePrefix;

    const statements = generator.generate();

    await account.db.transaction(async (db) => {
      for (const statement of statements) {
        await db.execute(statement);
      }
    });

    return statements;
  }
}
