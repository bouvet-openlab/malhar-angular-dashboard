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
                layouts: [
                  {
                    id: 1,
                    title: 'Default Layout 1'
                  }
                ]
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
      defaultLayouts: [],
      storageId: 'uniqueStorageId1',
      storageHash: 'ds5f9d1f',
      stringifyStorage: true,
      widgetDefinitions: [

      ],
      widgetButtons: false,
      explicitSave: false
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

    it('should set storageHash to empty string if not provided', function(){
      delete options.storageHash;
      var newStorage = new GroupedStorage(options);

      expect(newStorage.storageHash).toBe('');
    });

    it('should set stringifyStorage to true if not provided', function(){
      delete options.stringifyStorage;
      var newStorage = new GroupedStorage(options);

      expect(newStorage.stringifyStorage).toBe(true);
    });

    it('should create a groups array and states object', function () {
      expect(storage.groups instanceof Array).toEqual(true, 'groups should be array');
      expect(typeof storage.states).toEqual('object', 'states should be object');
    });

    it('should set a subset of the options directly on the GroupStorage instance itself', function () {
      var properties = {
        storage: 'storage',
        defaultLayoutGroups: 'defaultLayoutGroups',
        id: 'storageId',
        defaultWidgets: 'defaultWidgets',
        storageHash: 'storageHash',
        stringifyStorage: 'stringifyStorage',
        widgetDefinitions: 'widgetDefinitions',
        defaultLayouts: 'defaultLayouts',
        widgetButtons: 'widgetButtons',
        explicitSave: 'explicitSave',
        settingsModalOptions: {optionProp: 'something'},
        onSettingsClose: function() {

        },
        onSettingsDismiss: function() {

        }
      };

      angular.forEach(properties, function (val, key) {
        expect(storage[key]).toEqual(options[val], 'option: ' + val);
      });

      expect(storage.options).toBe(options);
      expect(storage.options.unsavedChangeCount).toBe(0)
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

  describe('the addLayout method', function(){
    beforeEach(function(){
      storage = new GroupedStorage(options);
    });

    it('should add to layoutGroup.layouts', function(){
      options.defaultGroupLayouts.groups[0].layoutGroups[0].layouts = [];
      storage = new GroupedStorage(options);

      var layoutGroup = storage.groups[0].layoutGroups[0];
      var newLayout = { title: 'another layout' };
      storage.addLayout(layoutGroup, newLayout);
      expect(storage.groups[0].layoutGroups[0].layouts[0]).toBe(newLayout);
    });

    it('should be able to take an array of new layouts', function() {
      var newLayouts = [ { title: 'my-layout' }, { title: 'my-layout-2' } ];
      var layoutGroup = storage.groups[0].layoutGroups[0];
      layoutGroup.layouts = [];

      storage.addLayout(layoutGroup, newLayouts);
      expect(layoutGroup.layouts.length).toEqual(2);
      expect(layoutGroup.layouts.indexOf(newLayouts[0])).not.toEqual(-1);
      expect(layoutGroup.layouts.indexOf(newLayouts[1])).not.toEqual(-1);
    });

    it('should look for defaultWidgets on storage options if not supplied on layout definition', function() {
      options.defaultWidgets = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
      storage = new GroupedStorage(options);

      var layoutGroup = storage.groups[0].layoutGroups[0];

      var newLayouts = [ { title: 'my-layout', defaultWidgets: [] }, { title: 'my-layout-2' } ];
      storage.addLayout(layoutGroup, newLayouts);
      expect(newLayouts[0].dashboard.defaultWidgets === newLayouts[0].defaultWidgets).toEqual(true, 'should keep existing defaultWidgets');
      expect(newLayouts[1].dashboard.defaultWidgets === options.defaultWidgets).toEqual(true, 'should use default widgets from options if not on layout');
    });

    it('should use defaultWidgets if supplied in the layout definition', function() {
      options.defaultWidgets = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
      storage = new GroupedStorage(options);

      var layoutGroup = storage.groups[0].layoutGroups[0];

      var newLayouts = [ { title: 'my-layout', defaultWidgets: [] }, { title: 'my-layout-2' } ];
      storage.addLayout(layoutGroup, newLayouts);
      expect(newLayouts[0].dashboard.defaultWidgets).toEqual([]);
      expect(newLayouts[1].dashboard.defaultWidgets).toEqual(options.defaultWidgets);
    });

    it('should set dashboard options layout', function(){
      options.defaultGroupLayouts.groups[0].layoutGroups[0].layouts = [];
      storage = new GroupedStorage(options);

      var layoutGroup = storage.groups[0].layoutGroups[0];
      var newLayout = { title: 'another layout' };
      storage.addLayout(layoutGroup, newLayout);
      expect(storage.groups[0].layoutGroups[0].layouts[0]).toBe(newLayout);

      expect(newLayout.dashboard.storage).toBe(storage);
      expect(newLayout.dashboard.widgetDefinitions).toBe(options.widgetDefinitions);
      expect(newLayout.dashboard.stringifyStorage).toBe(false);
      expect(newLayout.dashboard.widgetButtons).toBe(options.widgetButtons);
      expect(newLayout.dashboard.explicitSave).toBe(options.explicitSave);
      expect(newLayout.dashboard.settingsModalOptions).toBe(options.settingsModalOptions);
      expect(newLayout.dashboard.onSettingsClose).toBe(options.onSettingsClose);
      expect(newLayout.dashboard.onSettingsDismiss).toBe(options.onSettingsDismiss);
    });

    it('should call _getLayoutId to generate next id', function () {
      var layoutGroup = storage.groups[0].layoutGroups[0];
      var layout = { title: 'another layout' };

      var beforeLength = layoutGroup.layouts.length;

      expect(beforeLength > 0).toBe(true);

      storage.addLayout(layoutGroup, layout);

      var newLayout = layoutGroup.layouts[beforeLength];

      expect(newLayout.id > beforeLength).toBe(true, 'id should be a number higher than previous number of items in collection');
      expect(newLayout.id).toBe(newLayout.dashboard.storageId);
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

  describe('the setItem method', function() {

    it('should set storage.states[id] to the second argument', function() {
      var state = { some: 'thing'};
      storage.setItem('id', state);
      expect(storage.states.id).toEqual(state);
    });

    it('should call save', function() {
      spyOn(storage, 'save');
      var state = { some: 'thing'};
      storage.setItem('id', state);
      expect(storage.save).toHaveBeenCalled();
    });

  });

  describe('the getItem method', function() {

    it('should return states[id]', function() {
      storage.states['myId'] = {};
      var result = storage.getItem('myId');
      expect(result === storage.states['myId']).toEqual(true);
    });

  });

  describe('the removeItem', function() {

    it('should remove states[id]', function() {
      var state = {};
      storage.setItem('1', state);
      storage.removeItem('1');
      expect(storage.states['1']).toBeUndefined();
    });

    it('should call save', function() {
      spyOn(storage, 'save');
      var state = {};
      storage.setItem('1', state);
      storage.removeItem('1');
      expect(storage.save).toHaveBeenCalled();
    });

  });
});