// import {format} from 'util';
// import _ from 'lodash';
// import {Record, RepeatableItemValue} from 'fulcrum-core';

import { format } from 'util';
import _ from 'lodash';
import { Record, RepeatableItemValue } from 'fulcrum-core';
import pgformat from 'pg-format';

export default class RecordValues {
  static updateForRecordStatements(db, record) {
    const statements = [];

    statements.push.apply(statements, this.deleteForRecordStatements(db, record, record.form));
    statements.push.apply(statements, this.insertForRecordStatements(db, record, record.form));

    return statements;
  }

  static insertForRecordStatements(db, record, form) {
    const statements = [];

    statements.push(this.insertRowForFeatureStatement(db, form, record, null, record));
    statements.push.apply(statements, this.insertChildFeaturesForFeatureStatements(db, form, record, record));
    statements.push.apply(statements, this.insertMultipleValuesForFeatureStatements(db, form, record, record));
    statements.push.apply(statements, this.insertChildMultipleValuesForFeatureStatements(db, form, record, record));

    return statements;
  }

  static insertRowForFeatureStatement(db, form, feature, parentFeature, record) {
    const values = this.columnValuesForFeature(feature);
    const systemValues = this.systemColumnValuesForFeature(feature, parentFeature, record);

    Object.assign(values, systemValues);

    let tableName = null;

    if (feature instanceof RepeatableItemValue) {
      // TODO(zhm) add public interface for accessing _element, like `get repeatableElement()`
      tableName = this.tableNameWithForm(form, feature._element);
    } else {
      tableName = this.tableNameWithForm(form, null);
    }

    return db.insertStatement(tableName, values, {pk: 'id'});
  }

  static insertChildFeaturesForFeatureStatements(db, form, feature, record) {
    const statements = [];

    for (const formValue of feature.formValues.all) {
      if (formValue.element.isRepeatableElement) {
        // TODO(zhm) add public interface for _items
        for (const repeatableItem of formValue._items) {
          statements.push(this.insertRowForFeatureStatement(db, form, repeatableItem, feature, record));
          statements.push.apply(statements, this.insertChildFeaturesForFeatureStatements(db, form, repeatableItem, record));
        }
      }
    }

    return statements;
  }

  static columnValuesForFeature(feature) {
    const values = {};

    for (const formValue of feature.formValues.all) {
      if (formValue.isEmpty) {
        continue;
      }

      let columnValue = formValue.columnValue;

      if (_.isNumber(columnValue) || _.isString(columnValue) || _.isArray(columnValue) || _.isDate(columnValue)) {
        // don't allow dates greater than 9999, yes - they exist in the wild
        if (_.isDate(columnValue) && columnValue.getFullYear() > 9999) {
          columnValue = null;
        }

        values['f' + formValue.element.key.toLowerCase()] = columnValue;
      } else if (columnValue) {
        Object.assign(values, columnValue);
      }
    }

    return values;
  }

  static insertMultipleValuesForFeatureStatements(db, form, feature, record) {
    const statements = [];

    const values = this.multipleValuesForFeature(feature, record);

    const tableName = this.multipleValueTableNameWithForm(form);

    let parentResourceId = null;

    if (feature instanceof RepeatableItemValue) {
      parentResourceId = feature.id;
    }

    for (const multipleValueItem of values) {
      const insertValues = Object.assign({}, {key: multipleValueItem.element.key, text_value: multipleValueItem.value},
                                         {record_id: record.rowID, record_resource_id: record.id, parent_resource_id: parentResourceId});

      statements.push(db.insertStatement(tableName, insertValues, {pk: 'id'}));
    }

    return statements;
  }

  static insertChildMultipleValuesForFeatureStatements(db, form, feature, record) {
    const statements = [];

    for (const formValue of feature.formValues.all) {
      if (formValue.isRepeatableElement) {
        for (const repeatableItem of formValue._items) {
          statements.push.apply(statements, this.insertMultipleValuesForFeatureStatements(db, form, repeatableItem, record));
          statements.push.apply(statements, this.insertChildMultipleValuesForFeatureStatements(db, form, repeatableItem, record));
        }
      }
    }

    return statements;
  }

  static multipleValuesForFeature(feature, record) {
    const values = [];

    for (const formValue of feature.formValues.all) {
      if (formValue.isEmpty) {
        continue;
      }

      const featureValues = formValue.multipleValues;

      if (featureValues) {
        values.push.apply(values, featureValues);
      }
    }

    return values;
  }

  static systemColumnValuesForFeature(feature, parentFeature, record) {
    const values = {};

    values.record_id = record.rowID;
    values.record_resource_id = record.id;

    if (feature instanceof Record) {
      if (record._projectRowID) {
        values.project_id = record._projectRowID;
        values.project_resource_id = record.projectID;
      }

      if (record._assignedToRowID) {
        values.assigned_to_id = record._assignedToRowID;
        values.assigned_to_resource_id = record.assignedToID;
      }

      if (record._createdByRowID) {
        values.created_by_id = record._createdByRowID;
        values.created_by_resource_id = record.createdByID;
      }

      if (record._updatedByRowID) {
        values.updated_by_id = record._updatedByRowID;
        values.updated_by_resource_id = record.updatedByID;
      }

      if (record._changesetRowID) {
        values.changeset_id = record._changesetRowID;
        values.changeset_resource_id = record.changesetID;
      }

      if (record.status) {
        values.status = record.status;
      }

      if (record.latitude) {
        values.latitude = record.latitude;
      }

      if (record.longitude) {
        values.longitude = record.longitude;
      }

      values.altitude = record.altitude;
      values.speed = record.speed;
      values.course = record.course;
      values.vertical_accuracy = record.verticalAccuracy;
      values.horizontal_accuracy = record.horizontalAccuracy;
    } else if (feature instanceof RepeatableItemValue) {
      values.resource_id = feature.id;
      values.index = feature.index;
      values.parent_resource_id = parentFeature.id;

      if (feature.hasCoordinate) {
        values.latitude = feature.latitude;
        values.longitude = feature.longitude;
      }

      // record values
      if (record.status) {
        values.record_status = record.status;
      }

      if (record._projectRowID) {
        values.record_project_id = record._projectRowID;
        values.record_project_resource_id = record.projectID;
      }

      if (record._assignedToRowID) {
        values.record_assigned_to_id = record._assignedToRowID;
        values.record_assigned_to_resource_id = record.assignedToID;
      }

      // linked fields
      if (feature.createdBy) {
        values.created_by_id = feature.createdBy.rowID;
        values.created_by_resource_id = feature.createdByID;
      }

      if (feature.updatedBy) {
        values.updated_by_id = feature.updatedBy.rowID;
        values.updated_by_resource_id = feature.updatedByID;
      }

      if (feature.changeset) {
        values.changeset_id = feature.changeset.rowID;
        values.changeset_resource_id = feature.changesetID;
      } else if (record._changesetRowID) {
        values.changeset_id = record._changesetRowID;
        values.changeset_resource_id = record.changesetID;
      }
    }

    values.title = feature.displayValue;

    const searchableValue = feature.searchableValue;

    values.form_values = JSON.stringify(feature.formValues.toJSON());
    values.record_index_text = searchableValue;
    // values.record_index = {raw: `to_tsvector(${ pgformat('%L', searchableValue) })`};

    // if (feature.hasCoordinate) {
    //   const wkt = pgformat('POINT(%s %s)', feature.longitude, feature.latitude);

    //   values.geometry = {raw: `ST_Force2D(ST_SetSRID(ST_GeomFromText('${ wkt }'), 4326))`};
    // } else {
    //   values.geometry = null;
    // }

    values.created_at = feature.clientCreatedAt || feature.createdAt;
    values.updated_at = feature.clientUpdatedAt || feature.updatedAt;
    values.version = feature.version;

    if (values.created_by_id == null) {
      values.created_by_id = -1;
    }

    if (values.updated_by_id == null) {
      values.updated_by_id = -1;
    }

    values.server_created_at = feature.createdAt;
    values.server_updated_at = feature.updatedAt;

    values.created_duration = feature.createdDuration;
    values.updated_duration = feature.updatedDuration;
    values.edited_duration = feature.editedDuration;

    values.created_latitude = feature.createdLatitude;
    values.created_longitude = feature.createdLongitude;
    values.created_altitude = feature.createdAltitude;
    values.created_horizontal_accuracy = feature.createdAccuracy;

    // if (feature.hasCreatedCoordinate) {
    //   const wkt = pgformat('POINT(%s %s)', feature.createdLongitude, feature.createdLatitude);

    //   values.created_geometry = {raw: `ST_Force2D(ST_SetSRID(ST_GeomFromText('${ wkt }'), 4326))`};
    // }

    values.updated_latitude = feature.updatedLatitude;
    values.updated_longitude = feature.updatedLongitude;
    values.updated_altitude = feature.updatedAltitude;
    values.updated_horizontal_accuracy = feature.updatedAccuracy;

    // if (feature.hasUpdatedCoordinate) {
    //   const wkt = pgformat('POINT(%s %s)', feature.updatedLongitude, feature.updatedLatitude);

    //   values.updated_geometry = {raw: `ST_Force2D(ST_SetSRID(ST_GeomFromText('${ wkt }'), 4326))`};
    // }

    return values;
  }

  static deleteRowsForRecordStatement(db, record, tableName) {
    return db.deleteStatement(tableName, {record_resource_id: record.id});
  }

  static deleteRowsStatement(db, tableName) {
    return db.deleteStatement(tableName, {});
  }

  static deleteForRecordStatements(db, record, form) {
    const repeatables = form.elementsOfType('Repeatable');

    const statements = [];

    let tableName = this.tableNameWithForm(form, null);

    statements.push(this.deleteRowsForRecordStatement(db, record, tableName));

    for (const repeatable of repeatables) {
      tableName = this.tableNameWithForm(form, repeatable);

      statements.push(this.deleteRowsForRecordStatement(db, record, tableName));
    }

    tableName = this.multipleValueTableNameWithForm(form);

    statements.push(this.deleteRowsForRecordStatement(db, record, tableName));

    return statements;
  }

  static deleteForFormStatements(db, form) {
    const repeatables = form.elementsOfType('Repeatable');

    const statements = [];

    let tableName = this.tableNameWithForm(form, null);

    statements.push(this.deleteRowsStatement(db, tableName));

    for (const repeatable of repeatables) {
      tableName = this.tableNameWithForm(form, repeatable);

      statements.push(this.deleteRowsStatement(db, tableName));
    }

    tableName = this.multipleValueTableNameWithForm(form);

    statements.push(this.deleteRowsStatement(db, tableName));

    return statements;
  }

  static multipleValueTableNameWithForm(form) {
    return format('account_%s_form_%s_values', form._accountRowID, form.rowID);
    // return format('form_%s_values', form.rowID);
  }

  static tableNameWithForm(form, repeatable) {
    if (repeatable == null) {
      return format('account_%s_form_%s', form._accountRowID, form.rowID);
    }

    return format('account_%s_form_%s_%s', form._accountRowID, form.rowID, repeatable.key);
    // if (repeatable == null) {
    //   return format('form_%s', form.rowID);
    // }

    // return format('form_%s_%s', form.rowID, repeatable.key);
  }

  // static multipleValueTableNameWithForm(form) {
  //   return format('account_%s_form_%s_values', form._accountRowID, form.rowID);
  // }

  // static tableNameWithForm(form, repeatable) {
  //   if (repeatable == null) {
  //     return format('account_%s_form_%s', form._accountRowID, form.rowID);
  //   }

  //   return format('account_%s_form_%s_%s', form._accountRowID, form.rowID, repeatable.key);
  // }
}
