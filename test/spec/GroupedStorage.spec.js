/**
 * Created by EIBEL on 30.10.2014.
 */
'use strict';

describe('GroupedStorage service', function () {
  var storage, options;

  // mock UI Sortable
  beforeEach(function () {
    angular.module('ui.sortable', []);
  });

  // load the service's module
  beforeEach(module('ui.dashboard'));

  // instantiate service
  var GroupedStorage;
  beforeEach(inject(function (_GroupedStorage_) {
    GroupedStorage = _GroupedStorage_;
  }));

  beforeEach(function(){
    options = {
      storage: {
        setItem: function (key, value) {

        },
        getItem: function (key) {

        },
        removeItem: function (key) {

        }
      },
      defaultGroupLayouts: {
        groups: [
          {
            id: 1,
            groupTitle: 'Default group 1',
            layoutGroups: [
              {
                id: 1,
                layoutGroupTitle: 'Default Layout group 1',
                layouts: []
              },
              {
                id: 2,
                layoutGroupTitle: 'Default Layout group 2',
                layouts: []
              }
            ]
          },
          {
            id: 2,
            groupTitle: 'Default group 2',
            layoutGroups: [
              {
                id: 3,
                layoutGroupTitle: 'Default Layout group 3',
                layouts: []
              }
            ]
          },
          {
            id: 3,
            groupTitle: 'Default group 3',
            layoutGroups: []
          }
        ]
      },
      storageId: 'uniqueStorageId1'
    };
  });

  it('Exists - ice breaker', function(){
    storage = new GroupedStorage(options);

    expect(storage).toBeDefined();
  });

  describe('the constructor', function(){


    beforeEach(function(){
      storage = new GroupedStorage(options);
    });

    it('should provide and empty implementation of storage if it is not provided', function(){
      delete options.storage;
      var stateless = new GroupedStorage(options);
      var noop = stateless.storage;
      angular.forEach(['setItem', 'getItem', 'removeItem'], function (method) {
        expect(typeof noop[method]).toEqual('function');
        expect(noop[method]).not.toThrow();
        noop[method]();
      });
    });

    it('should create a groups array', function () {
      expect(storage.groups instanceof Array).toEqual(true, 'groups should be array');
    });

    it('should set a subset of the options directly on the GroupStorage instance itself', function () {
      var properties = {
        storage: 'storage',
        defaultLayoutGroups: 'defaultLayoutGroups',
        id: 'storageId'
      };

      angular.forEach(properties, function (val, key) {
        expect(storage[key]).toEqual(options[val], 'option: ' + val);
      });

    });

    it('should call load', function () {
      spyOn(GroupedStorage.prototype, 'load');
      storage = new GroupedStorage(options);
      expect(GroupedStorage.prototype.load).toHaveBeenCalled();
    });
  });

  describe('the load method', function(){
    beforeEach(function(){
      storage = new GroupedStorage(options);
    });

    it('should use the default group layouts if no stored info was found', function () {
      expect(storage.groups.length).toEqual(options.defaultGroupLayouts.groups.length, 'Should use default');
    });
  });

  describe('the add method', function(){
    beforeEach(function(){
      storage = new GroupedStorage(options);
    });

    it('should add to storage.groups', function () {
      options.defaultGroupLayouts.groups = [];
      storage = new GroupedStorage(options);

      var newGroup = { groupTitle: 'another group' };
      storage.add(newGroup);
      expect(storage.groups[0]).toEqual(newGroup);
    });

    it('should call _getGroupId to generate next id', function () {
      var group = {groupTitle: 'Test', layoutGroups: []};
      var beforeLength = storage.groups.length;

      storage.add(group);

      expect(storage.groups.indexOf(group)).toBe(beforeLength);

      var newGroup = storage.groups[beforeLength];

      expect(newGroup.id > beforeLength).toBe(true, 'id should be a number higher than previous number of items in collection');
    });

    it('does nothing if group is undefined', function () {
      var beforeLength = storage.groups.length;

      storage.add();
      storage.add(undefined);

      expect(storage.groups.length).toBe(beforeLength);
    });

    it('should ensure default values on group if not set', function(){
      options.defaultGroupLayouts.groups = [];
      storage = new GroupedStorage(options);

      var newGroup = { };
      storage.add(newGroup);
      expect(storage.groups[0]).toBe(newGroup);

      expect(typeof newGroup.groupTitle).toBe('string', 'should add layoutGroupTitle');
      expect(newGroup.groupTitle).toBe('Custom Group');
      expect(newGroup.layoutGroups instanceof Array).toBe(true, 'should initialize array for layouts');
      expect(newGroup.layoutGroups.length).toBe(0);
    });

    it('should override default values', function(){
      options.defaultGroupLayouts.groups = [];
      storage = new GroupedStorage(options);

      var group =  { groupTitle: 'a title', layoutGroups: [{layoutGroupTitle: 'a layout group'}] };
      storage.add(group);
      expect(storage.groups[0]).toBe(group);

      expect(group.groupTitle).toBe('a title');
      expect(group.layoutGroups.length).toBe(1);
    });
  });

  describe('the remove method', function(){
    beforeEach(function(){
      storage = new GroupedStorage(options);
    });

    it('should remove the supplied group', function () {
      var group = storage.groups[2];
      var before = storage.groups.length;
      storage.remove(group);
      expect(storage.groups.indexOf(group)).toEqual(-1);
      var after = storage.groups.length;
      expect(after).toEqual(before - 1);
    });

    it('should do nothing if group is not in groups', function () {
      var group = {};
      var before = storage.groups.length;
      storage.remove(group);
      var after = storage.groups.length;
      expect(before).toEqual(after);
    });

    it('should not allow removing of a group if it contains any layoutGroup', function () {
      options.defaultGroupLayouts = {
        groups: [
          {
            groupTitle: 'Group 1'
          },
          {
            groupTitle: 'Group 2',
            layoutGroups: [
              {
                layoutGroupTitle: 'Some layout group'
              }
            ]
          }
        ]
      };

      storage = new GroupedStorage(options);
      var group = storage.groups[1];
      storage.remove(group);
      expect(storage.groups.indexOf(group)).toEqual(1);
    });
  });

  describe('the addLayoutGroup method', function(){
    beforeEach(function(){
      storage = new GroupedStorage(options);
    });

    it('should add to group.layoutGroups', function(){
      options.defaultGroupLayouts.groups[0].layoutGroups = [];
      storage = new GroupedStorage(options);

      var group = storage.groups[0];
      var newLayoutGroup = { layoutGroupTitle: 'another layout group' };
      storage.addLayoutGroup(group, newLayoutGroup);
      expect(storage.groups[0].layoutGroups[0]).toBe(newLayoutGroup);
    });

    it('should call _getLayoutGroupId to generate next id', function () {
      var layoutGroup = {layoutGroupTitle: 'Custom Layout Group'};

      var group = storage.groups[0];
      var beforeLength = group.layoutGroups.length;

      expect(beforeLength > 0).toBe(true);

      storage.addLayoutGroup(group, layoutGroup);

      var newLayoutGroup = group.layoutGroups[beforeLength];

      expect(newLayoutGroup.id > beforeLength).toBe(true, 'id should be a number higher than previous number of items in collection');
    });

    it('does nothing if group was not already present in groups array', function () {
      var layoutGroup = {layoutGroupTitle: 'Custom Layout Group'};
      var group = {groupTitle: 'some non existing group', layoutGroups: []};
      var beforeLength = group.layoutGroups.length;

      expect(storage.groups.indexOf(group)).toBe(-1);

      storage.addLayoutGroup(group, layoutGroup);

      expect(group.layoutGroups.length).toBe(beforeLength);
    });

    it('does nothing if layoutGroup is undefined', function () {
      var group = storage.groups[0];
      var beforeLength = group.layoutGroups.length;

      expect(storage.groups.indexOf(group)).toBe(0);

      storage.addLayoutGroup(group);
      storage.addLayoutGroup(group, undefined);

      expect(group.layoutGroups.length).toBe(beforeLength);
    });

    it('should ensure default values on layoutGroup if not set', function(){
      options.defaultGroupLayouts.groups[0].layoutGroups = [];
      storage = new GroupedStorage(options);

      var group = storage.groups[0];
      var newLayoutGroup = { };
      storage.addLayoutGroup(group, newLayoutGroup);
      expect(storage.groups[0].layoutGroups[0]).toBe(newLayoutGroup);

      expect(typeof newLayoutGroup.layoutGroupTitle).toBe('string', 'should add layoutGroupTitle');
      expect(newLayoutGroup.layoutGroupTitle).toBe('Custom Layout Group');
      expect(newLayoutGroup.layouts instanceof Array).toBe(true, 'should initialize array for layouts');
      expect(newLayoutGroup.layouts.length).toBe(0);
    });

    it('should override default values', function(){
      options.defaultGroupLayouts.groups[0].layoutGroups = [];
      storage = new GroupedStorage(options);

      var group = storage.groups[0];
      var newLayoutGroup = { layoutGroupTitle: 'a title', layouts: [{title: 'a layout'}] };
      storage.addLayoutGroup(group, newLayoutGroup);
      expect(storage.groups[0].layoutGroups[0]).toBe(newLayoutGroup);

      expect(newLayoutGroup.layoutGroupTitle).toBe('a title');
      expect(newLayoutGroup.layouts.length).toBe(1);
    });
  });

  describe('the removeLayoutGroup method', function(){
    beforeEach(function(){
      storage = new GroupedStorage(options);
    });

    it('should remove the supplied layout group', function () {
      var layoutGroup = storage.groups[1].layoutGroups[0];
      var before = storage.groups[1].layoutGroups.length;
      storage.removeLayoutGroup(layoutGroup);
      expect(storage.groups[1].layoutGroups.indexOf(layoutGroup)).toEqual(-1);
      var after = storage.groups[1].layoutGroups.length;
      expect(after).toEqual(before - 1);
    });

    it('should do nothing if layoutGroup is not in a group', function () {
      var layoutGroup = {};

      var before = 0;
      storage.groups.map(function(group){before = before + group.layoutGroups.length});

      storage.removeLayoutGroup(layoutGroup);
      var after = 0;

      storage.groups.map(function(group){after = after + group.layoutGroups.length});
      expect(before).toEqual(after);
    });

    it('should not allow removing of a layoutGroup if it contains any layouts', function () {
      options.defaultGroupLayouts = {
        groups: [
          {
            groupTitle: 'Group 1',
            layoutGroups: [
              {
                layoutGroupTitle: 'Some layout group',
                layouts: []
              }
            ]
          },
          {
            groupTitle: 'Group 2',
            layoutGroups: [
              {
                layoutGroupTitle: 'Some other layout group',
                layouts: [
                  {
                    title: 'a layout'
                  }
                ]
              }
            ]
          }
        ]
      };

      storage = new GroupedStorage(options);
      var layoutGroup = storage.groups[1].layoutGroups[0];
      storage.removeLayoutGroup(layoutGroup);
      expect(storage.groups[1].layoutGroups.indexOf(layoutGroup)).toEqual(0);
    });
  });

  describe('the save method', function(){

    it('should call options.storage.setItem with a stringified object', function () {
      storage = new GroupedStorage(options);
      spyOn(options.storage, 'setItem');
      storage.save();
      expect(options.storage.setItem).toHaveBeenCalled();
      expect(options.storage.setItem.calls.argsFor(0)[0]).toEqual(storage.id);
      expect(typeof options.storage.setItem.calls.argsFor(0)[1]).toEqual('string');
      expect(function () {
        JSON.parse(options.storage.setItem.calls.argsFor(0)[1]);
      }).not.toThrow();
    });
  });
});