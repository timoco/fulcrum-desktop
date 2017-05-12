'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _minidb = require('minidb');

var _fulcrumCore = require('fulcrum-core');

class ClassificationSet extends _fulcrumCore.ClassificationSet {
  static get tableName() {
    return 'classification_sets';
  }

  static get columns() {
    return [{ name: 'accountRowID', column: 'account_id', type: 'integer', null: false }, { name: 'id', column: 'resource_id', type: 'string', null: false }, { name: 'name', column: 'name', type: 'string', null: false }, { name: 'description', column: 'description', type: 'string' }, { name: 'itemsJSON', column: 'items', type: 'json', null: false }, { name: 'createdAt', column: 'created_at', type: 'datetime', null: false }, { name: 'updatedAt', column: 'updated_at', type: 'datetime', null: false }, { name: 'deletedAt', column: 'deleted_at', type: 'datetime' }];
  }
}

exports.default = ClassificationSet;
_minidb.PersistentObject.register(ClassificationSet);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tYWluL21vZGVscy9jbGFzc2lmaWNhdGlvbi1zZXQuanMiXSwibmFtZXMiOlsiQ2xhc3NpZmljYXRpb25TZXQiLCJ0YWJsZU5hbWUiLCJjb2x1bW5zIiwibmFtZSIsImNvbHVtbiIsInR5cGUiLCJudWxsIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOztBQUNBOztBQUVlLE1BQU1BLGlCQUFOLHdDQUFzRDtBQUNuRSxhQUFXQyxTQUFYLEdBQXVCO0FBQ3JCLFdBQU8scUJBQVA7QUFDRDs7QUFFRCxhQUFXQyxPQUFYLEdBQXFCO0FBQ25CLFdBQU8sQ0FDTCxFQUFFQyxNQUFNLGNBQVIsRUFBd0JDLFFBQVEsWUFBaEMsRUFBOENDLE1BQU0sU0FBcEQsRUFBK0RDLE1BQU0sS0FBckUsRUFESyxFQUVMLEVBQUVILE1BQU0sSUFBUixFQUFjQyxRQUFRLGFBQXRCLEVBQXFDQyxNQUFNLFFBQTNDLEVBQXFEQyxNQUFNLEtBQTNELEVBRkssRUFHTCxFQUFFSCxNQUFNLE1BQVIsRUFBZ0JDLFFBQVEsTUFBeEIsRUFBZ0NDLE1BQU0sUUFBdEMsRUFBZ0RDLE1BQU0sS0FBdEQsRUFISyxFQUlMLEVBQUVILE1BQU0sYUFBUixFQUF1QkMsUUFBUSxhQUEvQixFQUE4Q0MsTUFBTSxRQUFwRCxFQUpLLEVBS0wsRUFBRUYsTUFBTSxXQUFSLEVBQXFCQyxRQUFRLE9BQTdCLEVBQXNDQyxNQUFNLE1BQTVDLEVBQW9EQyxNQUFNLEtBQTFELEVBTEssRUFNTCxFQUFFSCxNQUFNLFdBQVIsRUFBcUJDLFFBQVEsWUFBN0IsRUFBMkNDLE1BQU0sVUFBakQsRUFBNkRDLE1BQU0sS0FBbkUsRUFOSyxFQU9MLEVBQUVILE1BQU0sV0FBUixFQUFxQkMsUUFBUSxZQUE3QixFQUEyQ0MsTUFBTSxVQUFqRCxFQUE2REMsTUFBTSxLQUFuRSxFQVBLLEVBUUwsRUFBRUgsTUFBTSxXQUFSLEVBQXFCQyxRQUFRLFlBQTdCLEVBQTJDQyxNQUFNLFVBQWpELEVBUkssQ0FBUDtBQVVEO0FBaEJrRTs7a0JBQWhETCxpQjtBQW1CckIseUJBQWlCTyxRQUFqQixDQUEwQlAsaUJBQTFCIiwiZmlsZSI6ImNsYXNzaWZpY2F0aW9uLXNldC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBlcnNpc3RlbnRPYmplY3QgfSBmcm9tICdtaW5pZGInO1xuaW1wb3J0IHsgQ2xhc3NpZmljYXRpb25TZXQgYXMgQ2xhc3NpZmljYXRpb25TZXRCYXNlIH0gZnJvbSAnZnVsY3J1bS1jb3JlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xhc3NpZmljYXRpb25TZXQgZXh0ZW5kcyBDbGFzc2lmaWNhdGlvblNldEJhc2Uge1xuICBzdGF0aWMgZ2V0IHRhYmxlTmFtZSgpIHtcbiAgICByZXR1cm4gJ2NsYXNzaWZpY2F0aW9uX3NldHMnO1xuICB9XG5cbiAgc3RhdGljIGdldCBjb2x1bW5zKCkge1xuICAgIHJldHVybiBbXG4gICAgICB7IG5hbWU6ICdhY2NvdW50Um93SUQnLCBjb2x1bW46ICdhY2NvdW50X2lkJywgdHlwZTogJ2ludGVnZXInLCBudWxsOiBmYWxzZSB9LFxuICAgICAgeyBuYW1lOiAnaWQnLCBjb2x1bW46ICdyZXNvdXJjZV9pZCcsIHR5cGU6ICdzdHJpbmcnLCBudWxsOiBmYWxzZSB9LFxuICAgICAgeyBuYW1lOiAnbmFtZScsIGNvbHVtbjogJ25hbWUnLCB0eXBlOiAnc3RyaW5nJywgbnVsbDogZmFsc2UgfSxcbiAgICAgIHsgbmFtZTogJ2Rlc2NyaXB0aW9uJywgY29sdW1uOiAnZGVzY3JpcHRpb24nLCB0eXBlOiAnc3RyaW5nJyB9LFxuICAgICAgeyBuYW1lOiAnaXRlbXNKU09OJywgY29sdW1uOiAnaXRlbXMnLCB0eXBlOiAnanNvbicsIG51bGw6IGZhbHNlIH0sXG4gICAgICB7IG5hbWU6ICdjcmVhdGVkQXQnLCBjb2x1bW46ICdjcmVhdGVkX2F0JywgdHlwZTogJ2RhdGV0aW1lJywgbnVsbDogZmFsc2UgfSxcbiAgICAgIHsgbmFtZTogJ3VwZGF0ZWRBdCcsIGNvbHVtbjogJ3VwZGF0ZWRfYXQnLCB0eXBlOiAnZGF0ZXRpbWUnLCBudWxsOiBmYWxzZSB9LFxuICAgICAgeyBuYW1lOiAnZGVsZXRlZEF0JywgY29sdW1uOiAnZGVsZXRlZF9hdCcsIHR5cGU6ICdkYXRldGltZScgfVxuICAgIF07XG4gIH1cbn1cblxuUGVyc2lzdGVudE9iamVjdC5yZWdpc3RlcihDbGFzc2lmaWNhdGlvblNldCk7XG4iXX0=