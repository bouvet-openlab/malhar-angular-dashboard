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

  beforeEach(function () {
    options = {
      storage: {
        setItem: function (key, value) {

        },
        getItem: function (key) {

        },
        removeItem: function (key) {

        }
      },
      isReadonly: false,
      defaultGroupLayouts: {
        homeLayout: {
          id: 10,
          title: 'Start'
        },
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
                  },
                  {
                    id: 2,
                    title: 'I am active',
                    active: true
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
        ],
        states: {
          "1": {content: 'text'},
          "2": {content: 'something else'}
        }
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

  it('Exists - ice breaker', function () {
    storage = new GroupedStorage(options);

    expect(storage).toBeDefined();
  });

  describe('the constructor', function () {

    beforeEach(function () {
      storage = new GroupedStorage(options);
    });

    it('should provide and empty implementation of storage if it is not provided', function () {
      delete options.storage;
      var stateless = new GroupedStorage(options);
      var noop = stateless.storage;
      angular.forEach(['setItem', 'getItem', 'removeItem'], function (method) {
        expect(typeof noop[method]).toEqual('function');
        expect(noop[method]).not.toThrow();
        noop[method]();
      });
    });

    it('should set storageHash to empty string if not provided', function () {
      delete options.storageHash;
      var newStorage = new GroupedStorage(options);

      expect(newStorage.storageHash).toBe('');
    });

    it('should set stringifyStorage to true if not provided', function () {
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
        isReadonly: 'isReadonly',
        settingsModalOptions: {optionProp: 'something'},
        onSettingsClose: function () {

        },
        onSettingsDismiss: function () {

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

  describe('the load method', function () {
    beforeEach(function () {
      storage = new GroupedStorage(options);
    });

    it('should use the default home and group layouts if no stored info was found', function () {
      expect(storage.groups.length).toEqual(options.defaultGroupLayouts.groups.length, 'Should use default group layouts');
      expect(storage.homeLayout).toBe(options.defaultGroupLayouts.homeLayout, 'should use default home layout');
    });

    it('should clone default layouts rather than use them directly', function () {
      expect(storage.groups.indexOf(options.defaultGroupLayouts.groups[0])).toEqual(-1);
    });

    it('should use the result from getItem for groups and homeLayout.', function () {
      spyOn(options.storage, 'getItem').and.returnValue(JSON.stringify({
        storageHash: 'ds5f9d1f',
        groups: [
          { id: 5, groupTitle: 'title' },
          { id: 1, groupTitle: 'title2' },
          { id: 2, groupTitle: 'title3' },
          { id: 3, groupTitle: 'custom' }
        ],
        homeLayout: {
          id: 54, title: 'Start page'
        },
        states: {
          0: {},
          1: {},
          2: {}
        }
      }));

      storage = new GroupedStorage(options);
      storage.load();
      expect(storage.groups.map(function (g) {
        return g.id
      })).toEqual([5, 1, 2, 3]);
      expect(storage.groups.map(function (g) {
        return g.groupTitle
      })).toEqual(['title', 'title2', 'title3', 'custom']);
      expect(storage.homeLayout.id).toEqual(54);
      expect(storage.homeLayout.title).toEqual('Start page');
    });

    it('should use the result from getItem for layoutGroups.', function () {
      spyOn(options.storage, 'getItem').and.returnValue(JSON.stringify({
        storageHash: 'ds5f9d1f',
        groups: [
          { id: 0, groupTitle: 'gtitle', layoutGroups: [
            {id: 5, layoutGroupTitle: 'title'},
            {id: 4, layoutGroupTitle: 'title2'},
            {id: 3, layoutGroupTitle: 'title3'},
            {id: 2, layoutGroupTitle: 'custom'}
          ]
          },
          { id: 1, groupTitle: 'gtitle2', layoutGroups: [
            {id: 8, layoutGroupTitle: 'title'},
            {id: 6, layoutGroupTitle: 'title2'},
            {id: 7, layoutGroupTitle: 'title3'},
            {id: 9, layoutGroupTitle: 'custom'}
          ] }
        ],
        states: {
          0: {},
          1: {},
          2: {}
        }
      }));

      storage.load();

      expect(storage.groups[0].layoutGroups.map(function (lg) {
        return lg.id
      })).toEqual([5, 4, 3, 2]);
      expect(storage.groups[1].layoutGroups.map(function (lg) {
        return lg.id
      })).toEqual([8, 6, 7, 9]);
      expect(storage.groups[0].layoutGroups.map(function (lg) {
        return lg.layoutGroupTitle
      })).toEqual(['title', 'title2', 'title3', 'custom']);
      expect(storage.groups[1].layoutGroups.map(function (lg) {
        return lg.layoutGroupTitle
      })).toEqual(['title', 'title2', 'title3', 'custom']);
    });

    it('should use the result from getItem for layouts.', function () {
      spyOn(options.storage, 'getItem').and.returnValue(JSON.stringify({
        storageHash: 'ds5f9d1f',
        groups: [
          { id: 0, groupTitle: 'gtitle', layoutGroups: [
            {id: 5, layoutGroupTitle: 'lgtitle', layouts: [
              {id: 5, title: 'title', defaultWidgets: [], active: true},
              {id: 4, title: 'title2', defaultWidgets: [], active: false},
              {id: 3, title: 'title3', defaultWidgets: [], active: false},
              {id: 2, title: 'custom', defaultWidgets: [], active: false}
            ]},
            {id: 4, layoutGroupTitle: 'lgtitle2', layouts: [
              {id: 8, title: 'title', defaultWidgets: [], active: true},
              {id: 6, title: 'title2', defaultWidgets: [], active: false},
              {id: 7, title: 'title3', defaultWidgets: [], active: false},
              {id: 9, title: 'custom', defaultWidgets: [], active: false}
            ]}
          ]
          }
        ],
        states: {
          0: {},
          1: {},
          2: {}
        }
      }));

      storage.load();

      expect(storage.groups[0].layoutGroups[0].layouts.map(function (l) {
        return l.id
      })).toEqual([5, 4, 3, 2]);
      expect(storage.groups[0].layoutGroups[1].layouts.map(function (l) {
        return l.id
      })).toEqual([8, 6, 7, 9]);
      expect(storage.groups[0].layoutGroups[0].layouts.map(function (l) {
        return l.title
      })).toEqual(['title', 'title2', 'title3', 'custom']);
      expect(storage.groups[0].layoutGroups[1].layouts.map(function (l) {
        return l.title
      })).toEqual(['title', 'title2', 'title3', 'custom']);
      expect(storage.groups[0].layoutGroups[0].layouts.map(function (l) {
        return l.active
      })).toEqual([true, false, false, false]);
      expect(storage.groups[0].layoutGroups[1].layouts.map(function (l) {
        return l.active
      })).toEqual([true, false, false, false]);
    });

    it('should use the result from getItem for layouts and add through regular methods.', function () {
      spyOn(GroupedStorage.prototype, 'addLayout').and.callThrough();
      spyOn(options.storage, 'getItem').and.returnValue(JSON.stringify({
        storageHash: 'ds5f9d1f',
        groups: [
          { id: 0, groupTitle: 'gtitle', layoutGroups: [
            {id: 5, layoutGroupTitle: 'lgtitle', layouts: [
              {id: 5, title: 'title', defaultWidgets: [], active: true}
            ]}
          ]
          }
        ],
        states: {
          0: {},
          1: {},
          2: {}
        }
      }));

      storage.load();

      expect(storage.groups[0].layoutGroups[0].layouts[0].dashboard.storage).toBe(storage);
      expect(GroupedStorage.prototype.addLayout).toHaveBeenCalled();
    });

    it('should NOT use result from getItem for layouts if the storageHash doesnt match', function () {
      spyOn(options.storage, 'getItem').and.returnValue(JSON.stringify({
        storageHash: 'alskdjf02iej',
        groups: [
          { id: 0, groupTitle: 'title' },
          { id: 1, groupTitle: 'title2' },
          { id: 2, groupTitle: 'title3' },
          { id: 3, groupTitle: 'custom' }
        ],
        states: {
          0: {},
          1: {},
          2: {}
        }
      }));
      storage.load();
      expect(storage.groups.map(function (l) {
        return l.groupTitle
      })).toEqual(['Default group 1', 'Default group 2', 'Default group 3']);
    });

    it('should be able to handle async loading via promise', inject(function ($rootScope, $q) {
      var deferred = $q.defer();
      spyOn(options.storage, 'getItem').and.returnValue(deferred.promise);
      storage.load();
      expect(storage.groups).toEqual([]);
      deferred.resolve(JSON.stringify({
        storageHash: 'ds5f9d1f',
        groups: [
          { id: 0, groupTitle: 'title' },
          { id: 1, groupTitle: 'title2' },
          { id: 2, groupTitle: 'title3' },
          { id: 3, groupTitle: 'custom' }
        ],
        states: {
          0: {},
          1: {},
          2: {}
        }
      }));
      $rootScope.$apply();
      expect(storage.groups.map(function (l) {
        return l.groupTitle
      })).toEqual(['title', 'title2', 'title3', 'custom']);
    }));

    it('should load defaults if the deferred is rejected', inject(function ($rootScope, $q) {
      var deferred = $q.defer();
      spyOn(options.storage, 'getItem').and.returnValue(deferred.promise);
      storage.load();
      deferred.reject();
      $rootScope.$apply();
      expect(storage.groups.map(function (l) {
        return l.groupTitle
      })).toEqual(['Default group 1', 'Default group 2', 'Default group 3']);
      expect(storage.homeLayout.id).toEqual(10);
      expect(storage.homeLayout.title).toEqual('Start');
    }));

    it('should load defaults if the json is malformed', inject(function ($rootScope, $q) {
      var deferred = $q.defer();
      spyOn(options.storage, 'getItem').and.returnValue(deferred.promise);
      storage.load();
      expect(storage.groups).toEqual([]);
      deferred.resolve(JSON.stringify({
        storageHash: 'ds5f9d1f',
        groups: [
          { id: 0, groupTitle: 'title' },
          { id: 1, groupTitle: 'title2' },
          { id: 2, groupTitle: 'title3' },
          { id: 3, groupTitle: 'custom' }
        ],
        homeLayout: {id: 54, title: 'Start page'},
        states: {
          0: {},
          1: {},
          2: {}
        }
      }).replace('{', '{{'));
      $rootScope.$apply();
      expect(storage.groups.map(function (l) {
        return l.groupTitle
      })).toEqual(['Default group 1', 'Default group 2', 'Default group 3']);
      expect(storage.homeLayout.id).toEqual(10);
      expect(storage.homeLayout.title).toEqual('Start');
    }));

    it('should not try to JSON.parse the result if stringifyStorage is false.', function () {
      options.stringifyStorage = false;
      storage = new GroupedStorage(options);
      spyOn(options.storage, 'getItem').and.returnValue({
        storageHash: 'ds5f9d1f',
        groups: [
          { id: 0, groupTitle: 'title' },
          { id: 1, groupTitle: 'title2' },
          { id: 2, groupTitle: 'title3' },
          { id: 3, groupTitle: 'custom' }
        ],
        homeLayout: {id: 54, title: 'Start page'},
        states: {
          0: {},
          1: {},
          2: {}
        }
      });
      storage = new GroupedStorage(options);
      storage.load();
      expect(storage.groups.map(function (l) {
        return l.groupTitle
      })).toEqual(['title', 'title2', 'title3', 'custom']);
      expect(storage.homeLayout.id).toEqual(54);
      expect(storage.homeLayout.title).toEqual('Start page');
    });

    it('should set states to states from serialized object', function () {
      var storedEntry = {
        storageHash: 'ds5f9d1f',
        groups: [
          {id: 1, groupTitle: 'title'}
        ],
        homeLayout: {id: 54, title: 'Start page'},
        states: {
          0: {title: 'item 1'},
          1: {title: 'item 2'},
          2: {title: 'item 3'}
        }
      };
      spyOn(options.storage, 'getItem').and.returnValue(JSON.stringify(storedEntry));
      storage.load();

      expect(storage.states).toEqual(storedEntry.states);
    });
  });

  describe('the _ensureActiveLayout method', function () {
    var groups;
    var homeLayout;

    beforeEach(function () {
      homeLayout = {active: false};
      groups = [
        {
          layoutGroups: [
            {
              active: false,
              layouts: [
                {active: false},
                {active: false}
              ]
            },
            {
              active: false,
              layouts: [
                {active: false},
                {active: false}
              ]
            }
          ]
        },
        {
          layoutGroups: [
            {
              active: false,
              layouts: [
                {active: false},
                {active: false}
              ]
            },
            {
              active: false,
              layouts: [
                {active: false},
                {active: false}
              ]
            }
          ]
        }
      ];
    });

    it('should be called on load', function () {
      spyOn(GroupedStorage.prototype, '_ensureActiveLayout').and.callThrough();

      storage = new GroupedStorage(options);

      expect(GroupedStorage.prototype._ensureActiveLayout).toHaveBeenCalled();
    });

    it('should not modify active when already set', function () {
      groups[1].layoutGroups[0].active = true;
      groups[1].layoutGroups[0].layouts[1].active = true;

      storage.groups = groups;
      storage.homeLayout = homeLayout;

      storage._ensureActiveLayout();

      expect(storage.homeLayout.active).toBe(false);

      expect(storage.groups[0].layoutGroups[0].active).toBe(false);
      expect(storage.groups[0].layoutGroups[0].layouts[0].active).toBe(false);
      expect(storage.groups[0].layoutGroups[0].layouts[1].active).toBe(false);

      expect(storage.groups[0].layoutGroups[1].active).toBe(false);
      expect(storage.groups[0].layoutGroups[1].layouts[0].active).toBe(false);
      expect(storage.groups[0].layoutGroups[1].layouts[1].active).toBe(false);

      expect(storage.groups[1].layoutGroups[0].active).toBe(true);
      expect(storage.groups[1].layoutGroups[0].layouts[0].active).toBe(false);
      expect(storage.groups[1].layoutGroups[0].layouts[1].active).toBe(true);

      expect(storage.groups[1].layoutGroups[1].active).toBe(false);
      expect(storage.groups[1].layoutGroups[1].layouts[0].active).toBe(false);
      expect(storage.groups[1].layoutGroups[1].layouts[1].active).toBe(false);
    });

    it('should set first layout to true if no active layout and no home layout', function () {
      storage.groups = groups;
      storage.homeLayout = undefined;

      storage._ensureActiveLayout();

      expect(storage.groups[0].layoutGroups[0].active).toBe(true);
      expect(storage.groups[0].layoutGroups[0].layouts[0].active).toBe(true);
      expect(storage.groups[0].layoutGroups[0].layouts[1].active).toBe(false);

      expect(storage.groups[0].layoutGroups[1].active).toBe(false);
      expect(storage.groups[0].layoutGroups[1].layouts[0].active).toBe(false);
      expect(storage.groups[0].layoutGroups[1].layouts[1].active).toBe(false);

      expect(storage.groups[1].layoutGroups[0].active).toBe(false);
      expect(storage.groups[1].layoutGroups[0].layouts[0].active).toBe(false);
      expect(storage.groups[1].layoutGroups[0].layouts[1].active).toBe(false);

      expect(storage.groups[1].layoutGroups[1].active).toBe(false);
      expect(storage.groups[1].layoutGroups[1].layouts[0].active).toBe(false);
      expect(storage.groups[1].layoutGroups[1].layouts[1].active).toBe(false);
    });

    it('should set home layout to true if no active layout', function () {
      storage.groups = groups;
      storage.homeLayout = homeLayout;

      storage._ensureActiveLayout();

      expect(storage.homeLayout.active).toBe(true);

      expect(storage.groups[0].layoutGroups[0].active).toBe(false);
      expect(storage.groups[0].layoutGroups[0].layouts[0].active).toBe(false);
      expect(storage.groups[0].layoutGroups[0].layouts[1].active).toBe(false);

      expect(storage.groups[0].layoutGroups[1].active).toBe(false);
      expect(storage.groups[0].layoutGroups[1].layouts[0].active).toBe(false);
      expect(storage.groups[0].layoutGroups[1].layouts[1].active).toBe(false);

      expect(storage.groups[1].layoutGroups[0].active).toBe(false);
      expect(storage.groups[1].layoutGroups[0].layouts[0].active).toBe(false);
      expect(storage.groups[1].layoutGroups[0].layouts[1].active).toBe(false);

      expect(storage.groups[1].layoutGroups[1].active).toBe(false);
      expect(storage.groups[1].layoutGroups[1].layouts[0].active).toBe(false);
      expect(storage.groups[1].layoutGroups[1].layouts[1].active).toBe(false);
    });

    it('should set first layoutGroup to active if one if its layouts are active', function () {
      storage.groups = groups;
      storage.homeLayout = homeLayout;

      storage.groups[0].layoutGroups[0].layouts[1].active = true;

      storage._ensureActiveLayout();

      expect(storage.homeLayout.active).toBe(false);

      expect(storage.groups[0].layoutGroups[0].active).toBe(true);
      expect(storage.groups[0].layoutGroups[0].layouts[0].active).toBe(false);
      expect(storage.groups[0].layoutGroups[0].layouts[1].active).toBe(true);
    });

    it('should keep only first layout as active if multiple are active', function () {
      storage.groups = groups;

      storage.groups[0].layoutGroups[0].active = true;
      storage.groups[0].layoutGroups[0].layouts[1].active = true;

      storage.groups[1].layoutGroups[1].active = true;
      storage.groups[1].layoutGroups[1].layouts[0].active = true;

      storage._ensureActiveLayout();

      expect(storage.groups[0].layoutGroups[0].active).toBe(true);
      expect(storage.groups[0].layoutGroups[0].layouts[1].active).toBe(true);

      expect(storage.groups[1].layoutGroups[1].active).toBe(false);
      expect(storage.groups[1].layoutGroups[1].layouts[0].active).toBe(false);
    });

    it('should cleanup the mess!', function () {
      storage.groups = groups;

      storage.groups[0].layoutGroups[0].active = false;
      storage.groups[0].layoutGroups[0].layouts[1].active = true;

      storage.groups[0].layoutGroups[1].layouts[0].active = true;
      storage.groups[0].layoutGroups[1].layouts[1].active = true;

      storage.groups[1].layoutGroups[0].active = true;

      storage.groups[1].layoutGroups[1].active = true;
      storage.groups[1].layoutGroups[1].layouts[0].active = true;
      storage.groups[1].layoutGroups[1].layouts[1].active = true;

      storage._ensureActiveLayout();

      expect(storage.groups[0].layoutGroups[0].active).toBe(true);
      expect(storage.groups[0].layoutGroups[0].layouts[0].active).toBe(false);
      expect(storage.groups[0].layoutGroups[0].layouts[1].active).toBe(true);

      expect(storage.groups[0].layoutGroups[1].active).toBe(false);
      expect(storage.groups[0].layoutGroups[1].layouts[0].active).toBe(false);
      expect(storage.groups[0].layoutGroups[1].layouts[1].active).toBe(false);

      expect(storage.groups[1].layoutGroups[0].active).toBe(false);
      expect(storage.groups[1].layoutGroups[0].layouts[0].active).toBe(false);
      expect(storage.groups[1].layoutGroups[0].layouts[1].active).toBe(false);

      expect(storage.groups[1].layoutGroups[1].active).toBe(false);
      expect(storage.groups[1].layoutGroups[1].layouts[0].active).toBe(false);
      expect(storage.groups[1].layoutGroups[1].layouts[1].active).toBe(false);
    });
  });

  describe('the getActiveLayout method', function () {

    beforeEach(function () {
      storage = new GroupedStorage(options);
    });

    it('should return the layout with active:true', function () {
      var layout = storage.getActiveLayout();

      expect(layout.title).toEqual('I am active');
    });

    it('should return homeLayout if it is active', function(){
      options.defaultGroupLayouts.homeLayout.active = true;
      storage = new GroupedStorage(options);
      var home = storage.homeLayout;

      var result = storage.getActiveLayout();
      expect(result).toBe(home);
    });

    it('should return false if no layout is active', function () {
      var layout = storage.getActiveLayout();
      layout.active = false;
      var result = storage.getActiveLayout();
      expect(result).toEqual(false);
    });
  });

  describe('the _serializeGroups method', function () {

    beforeEach(function () {
      storage = new GroupedStorage(options);
    });

    it('should serialize group values', function () {
      var groups = [
        {id: 1, groupTitle: 'some group'},
        {id: 7, groupTitle: 'other group'}
      ];
      storage.groups = groups;

      var result = storage._serializeGroups();

      expect(result.groups[0].id).toBe(1);
      expect(result.groups[0].groupTitle).toBe('some group');
      expect(result.groups[0].layoutGroups).toEqual([]);

      expect(result.groups[1].id).toBe(7);
      expect(result.groups[1].groupTitle).toBe('other group');
      expect(result.groups[1].layoutGroups).toEqual([]);
    });

    it('should serialize layoutGroup values', function () {
      var groups = [
        {id: 1, groupTitle: 'some group', layoutGroups: [
          {id: 4, layoutGroupTitle: 'some layoutGroup', active: true},
          {id: 6, layoutGroupTitle: 'other layoutGroup', active: false}
        ]}
      ];
      storage.groups = groups;

      var result = storage._serializeGroups();

      expect(result.groups[0].id).toBe(1);
      expect(result.groups[0].groupTitle).toBe('some group');

      expect(result.groups[0].layoutGroups[0].id).toBe(4);
      expect(result.groups[0].layoutGroups[0].layoutGroupTitle).toBe('some layoutGroup');
      expect(result.groups[0].layoutGroups[0].active).toBe(true);
      expect(result.groups[0].layoutGroups[0].layouts).toEqual([]);
      expect(result.groups[0].layoutGroups[1].id).toBe(6);
      expect(result.groups[0].layoutGroups[1].layoutGroupTitle).toBe('other layoutGroup');
      expect(result.groups[0].layoutGroups[1].active).toBe(false);
      expect(result.groups[0].layoutGroups[1].layouts).toEqual([]);
    });

    it('should serialize layout values', function () {

      var defWid = {aProperty: 'a'};
      var groups = [
        {id: 1, groupTitle: 'some group', layoutGroups: [
          {id: 4, layoutGroupTitle: 'some layoutGroup', active: true, layouts: [
            {id: 15, title: 'some layout', active: true, dashboard: {defaultWidgets: defWid }},
            {id: 19, title: 'other layout', active: false, locked: true, dashboard: {defaultWidgets: defWid }}
          ]}
        ]}
      ];
      var homeLayout = {id: 54, title: 'Start page', active: false, locked: true, dashboard: {defaultWidgets: defWid}};
      storage.groups = groups;
      storage.homeLayout = homeLayout;

      var result = storage._serializeGroups();

      expect(result.groups[0].id).toBe(1);
      expect(result.groups[0].groupTitle).toBe('some group');

      expect(result.groups[0].layoutGroups[0].id).toBe(4);
      expect(result.groups[0].layoutGroups[0].layoutGroupTitle).toBe('some layoutGroup');
      expect(result.groups[0].layoutGroups[0].active).toBe(true);

      expect(result.groups[0].layoutGroups[0].layouts[0].id).toBe(15);
      expect(result.groups[0].layoutGroups[0].layouts[0].title).toBe('some layout');
      expect(result.groups[0].layoutGroups[0].layouts[0].active).toBe(true);
      expect(result.groups[0].layoutGroups[0].layouts[0].locked).toBeUndefined();
      expect(result.groups[0].layoutGroups[0].layouts[0].defaultWidgets).toBe(defWid);
      expect(result.groups[0].layoutGroups[0].layouts[1].id).toBe(19);
      expect(result.groups[0].layoutGroups[0].layouts[1].title).toBe('other layout');
      expect(result.groups[0].layoutGroups[0].layouts[1].active).toBe(false);
      expect(result.groups[0].layoutGroups[0].layouts[1].locked).toBe(true);
      expect(result.groups[0].layoutGroups[0].layouts[1].defaultWidgets).toBe(defWid);

      expect(result.homeLayout.id).toBe(54);
      expect(result.homeLayout.title).toBe('Start page');
      expect(result.homeLayout.active).toBe(false);
      expect(result.homeLayout.locked).toBe(true);
      expect(result.homeLayout.defaultWidgets).toBe(defWid);
    });
  });

  describe('the add method', function () {
    beforeEach(function () {
      storage = new GroupedStorage(options);
    });

    it('should add to storage.groups', function () {
      options.defaultGroupLayouts.groups = [];
      storage = new GroupedStorage(options);

      var newGroup = { groupTitle: 'another group' };
      storage.add(newGroup);
      expect(storage.groups[0]).toEqual(newGroup);
    });

    it('should be able to take an array of new groups', function () {
      var newGroups = [
        { groupTitle: 'my-layout' },
        { groupTitle: 'my-layout-2' }
      ];
      storage.groups = [];

      storage.add(newGroups);
      expect(storage.groups.length).toEqual(2);
      expect(storage.groups.indexOf(newGroups[0])).not.toEqual(-1);
      expect(storage.groups.indexOf(newGroups[1])).not.toEqual(-1);
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

    it('should ensure default values on group if not set', function () {
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

    it('should override default values', function () {
      options.defaultGroupLayouts.groups = [];
      storage = new GroupedStorage(options);

      var group = { groupTitle: 'a title', layoutGroups: [
        {layoutGroupTitle: 'a layout group'}
      ] };
      storage.add(group);
      expect(storage.groups[0]).toBe(group);

      expect(group.groupTitle).toBe('a title');
      expect(group.layoutGroups.length).toBe(1);
    });
  });

  describe('the remove method', function () {
    beforeEach(function () {
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

  describe('the addLayoutGroup method', function () {
    beforeEach(function () {
      storage = new GroupedStorage(options);
    });

    it('should add to group.layoutGroups', function () {
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

    it('should ensure default values on layoutGroup if not set', function () {
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

    it('should override default values', function () {
      options.defaultGroupLayouts.groups[0].layoutGroups = [];
      storage = new GroupedStorage(options);

      var group = storage.groups[0];
      var newLayoutGroup = { layoutGroupTitle: 'a title', layouts: [
        {title: 'a layout'}
      ] };
      storage.addLayoutGroup(group, newLayoutGroup);
      expect(storage.groups[0].layoutGroups[0]).toBe(newLayoutGroup);

      expect(newLayoutGroup.layoutGroupTitle).toBe('a title');
      expect(newLayoutGroup.layouts.length).toBe(1);
    });
  });

  describe('the removeLayoutGroup method', function () {
    beforeEach(function () {
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
      storage.groups.map(function (group) {
        before = before + group.layoutGroups.length
      });

      storage.removeLayoutGroup(layoutGroup);
      var after = 0;

      storage.groups.map(function (group) {
        after = after + group.layoutGroups.length
      });
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

  describe('the addLayout method', function () {
    beforeEach(function () {
      storage = new GroupedStorage(options);
    });

    it('should add to layoutGroup.layouts', function () {
      options.defaultGroupLayouts.groups[0].layoutGroups[0].layouts = [];
      storage = new GroupedStorage(options);

      var layoutGroup = storage.groups[0].layoutGroups[0];
      var newLayout = { title: 'another layout' };
      storage.addLayout(layoutGroup, newLayout);
      expect(storage.groups[0].layoutGroups[0].layouts[0]).toBe(newLayout);
    });

    it('should be able to take an array of new layouts', function () {
      var newLayouts = [
        { title: 'my-layout' },
        { title: 'my-layout-2' }
      ];
      var layoutGroup = storage.groups[0].layoutGroups[0];
      layoutGroup.layouts = [];

      storage.addLayout(layoutGroup, newLayouts);
      expect(layoutGroup.layouts.length).toEqual(2);
      expect(layoutGroup.layouts.indexOf(newLayouts[0])).not.toEqual(-1);
      expect(layoutGroup.layouts.indexOf(newLayouts[1])).not.toEqual(-1);
    });

    it('should look for defaultWidgets on storage options if not supplied on layout definition', function () {
      options.defaultWidgets = [
        {name: 'a'},
        {name: 'b'},
        {name: 'c'}
      ];
      storage = new GroupedStorage(options);

      var layoutGroup = storage.groups[0].layoutGroups[0];

      var newLayouts = [
        { title: 'my-layout', defaultWidgets: [] },
        { title: 'my-layout-2' }
      ];
      storage.addLayout(layoutGroup, newLayouts);
      expect(newLayouts[0].dashboard.defaultWidgets === newLayouts[0].defaultWidgets).toEqual(true, 'should keep existing defaultWidgets');
      expect(newLayouts[1].dashboard.defaultWidgets === options.defaultWidgets).toEqual(true, 'should use default widgets from options if not on layout');
    });

    it('should use defaultWidgets if supplied in the layout definition', function () {
      options.defaultWidgets = [
        {name: 'a'},
        {name: 'b'},
        {name: 'c'}
      ];
      storage = new GroupedStorage(options);

      var layoutGroup = storage.groups[0].layoutGroups[0];

      var newLayouts = [
        { title: 'my-layout', defaultWidgets: [] },
        { title: 'my-layout-2' }
      ];
      storage.addLayout(layoutGroup, newLayouts);
      expect(newLayouts[0].dashboard.defaultWidgets).toEqual([]);
      expect(newLayouts[1].dashboard.defaultWidgets).toEqual(options.defaultWidgets);
    });

    it('should set dashboard options layout', function () {
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
      spyOn(GroupedStorage.prototype, '_getLayoutId').and.returnValue(33);

      var layoutGroup = storage.groups[0].layoutGroups[0];
      var layout = { title: 'another layout' };

      var beforeLength = layoutGroup.layouts.length;

      expect(beforeLength > 0).toBe(true);

      storage.addLayout(layoutGroup, layout);

      var newLayout = layoutGroup.layouts[beforeLength];

      expect(newLayout.id === 33).toBe(true, 'id should be return value from _getLayoutId');
      expect(newLayout.id).toBe(newLayout.dashboard.storageId);

      expect(GroupedStorage.prototype._getLayoutId).toHaveBeenCalled();
    });
  });

  describe('the removeLayout method', function () {

    it('should remove the supplied layout', function () {
      var layout = storage.groups[0].layoutGroups[0].layouts[1];
      storage.removeLayout(layout);
      expect(storage.groups[0].layoutGroups[0].layouts.indexOf(layout)).toEqual(-1);
    });

    it('should delete the state', function () {
      var layout = storage.groups[0].layoutGroups[0].layouts[1];
      storage.setItem(layout.id, {});
      storage.removeLayout(layout);
      expect(storage.states[layout.id]).toBeUndefined();
    });

    it('should do nothing if layout is not in layouts', function () {
      var layout = {};
      var before = storage.groups[0].layoutGroups[0].layouts.length;
      storage.removeLayout(layout);
      var after = storage.groups[0].layoutGroups[0].layouts.length;
      expect(before).toEqual(after);
    });

    it('should set another dashboard to active if the layout removed was active', function () {
      storage = new GroupedStorage(options);

      spyOn(GroupedStorage.prototype, '_ensureActiveLayout').and.callThrough();
      ;
      var layout = storage.groups[0].layoutGroups[0].layouts[1];
      storage.removeLayout(layout);
      expect(storage.groups[0].layoutGroups[0].layouts[1]).toBeUndefined();
      expect(storage.groups[0].layoutGroups[0].layouts[0].active).toEqual(true);

      expect(GroupedStorage.prototype._ensureActiveLayout).toHaveBeenCalled();
    });

    it('should set the layout at index 0 to active if the removed layout was 0', function () {
      storage = new GroupedStorage(options);
      storage.homeLayout.active = false;

      storage.groups[0].layoutGroups[0].layouts[0].active = true;
      storage.groups[0].layoutGroups[0].layouts[1].active = false;
      storage.removeLayout(storage.groups[0].layoutGroups[0].layouts[0]);
      expect(storage.groups[0].layoutGroups[0].layouts[0].active).toEqual(true);
    });

    it('should not change the active layout if it was not the one that got removed', function () {
      storage = new GroupedStorage(options);

      var active = storage.groups[0].layoutGroups[0].layouts[1];
      var layout = storage.groups[0].layoutGroups[0].layouts[0];
      storage.removeLayout(layout);
      expect(active.active).toEqual(true);
    });

    it('should set previous to active when active is not first or second', function () {
      options.defaultGroupLayouts.groups[0].layoutGroups[0].layouts[0].active = false;
      options.defaultGroupLayouts.groups[0].layoutGroups[0].layouts[1].active = false;
      options.defaultGroupLayouts.groups[0].layoutGroups[0].layouts.push({title: 'newTitle', id: 3, active: true});

      storage = new GroupedStorage(options);
      storage.removeLayout(storage.groups[0].layoutGroups[0].layouts[2]);
      expect(storage.groups[0].layoutGroups[0].layouts[0].active).toEqual(false);
      expect(storage.groups[0].layoutGroups[0].layouts[1].active).toEqual(true);
    })
  });

  describe('the addHomeLayout method', function () {
    beforeEach(function () {
      options.defaultGroupLayouts.homeLayout = undefined;
      storage = new GroupedStorage(options);
    });

    it('should add homeLayout', function () {
      var newLayout = { title: 'another layout' };
      storage.addHomeLayout(newLayout);
      expect(storage.homeLayout).toBe(newLayout);
    });

    it('should do nothing if homeLayout is not defined', function () {
      storage.addHomeLayout(undefined);
      expect(storage.homeLayout).toBeUndefined();
    });

    it('should do nothing if homeLayout already exist', function () {
      var newLayout = { title: 'another layout' };
      var oldLayout = {title: 'existing ', id: 17};

      storage.homeLayout = oldLayout;

      storage.addHomeLayout(newLayout);
      expect(storage.homeLayout).toBe(oldLayout);
    });

    it('should look for defaultWidgets on storage options if not supplied on layout definition', function () {
      options.defaultWidgets = [
        {name: 'a'},
        {name: 'b'},
        {name: 'c'}
      ];
      storage = new GroupedStorage(options);

      var newLayout = { title: 'another layout' };
      storage.addHomeLayout(newLayout);

      expect(newLayout.dashboard.defaultWidgets === options.defaultWidgets).toEqual(true, 'should use default widgets from options if not on layout');
    });

    it('should keep defaultWidgets supplied on layout definition', function () {
      options.defaultWidgets = [
        {name: 'a'},
        {name: 'b'},
        {name: 'c'}
      ];
      storage = new GroupedStorage(options);

      var newLayout = { title: 'another layout', defaultWidgets: [] };
      storage.addHomeLayout(newLayout);

      expect(newLayout.dashboard.defaultWidgets === newLayout.defaultWidgets).toEqual(true, 'should keep existing defaultWidgets');
    });

    it('should set dashboard options layout', function () {
      var newLayout = { title: 'another layout' };
      storage.addHomeLayout(newLayout);
      expect(storage.homeLayout).toBe(newLayout);

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
      spyOn(GroupedStorage.prototype, '_getLayoutId').and.returnValue(55);

      var layout = { title: 'another layout' };

      storage.addHomeLayout(layout);

      var newLayout = storage.homeLayout;

      expect(newLayout.id === 55).toBe(true, 'id should be return value of _getLayoutId');
      expect(newLayout.id).toBe(newLayout.dashboard.storageId);

      expect(GroupedStorage.prototype._getLayoutId).toHaveBeenCalled();
    });
  });

  describe('the removeHomeLayout method', function(){
    it('should remove homeLayout', function(){
      storage = new GroupedStorage(options);
      expect(storage.homeLayout).toBeDefined();
      storage.removeHomeLayout();
      expect(storage.homeLayout).toBeUndefined();
    });

    it('should delete the state', function () {
      storage = new GroupedStorage(options);
      var layout = storage.homeLayout;
      storage.setItem(layout.id, {});
      storage.removeHomeLayout();
      expect(storage.states[layout.id]).toBeUndefined();
    });

    it('should do nothing if homeLayout does not exist', function(){
      options.defaultGroupLayouts.homeLayout = undefined;
      storage = new GroupedStorage(options);
      storage.removeHomeLayout();
    });

    it('should set another layout to active if the homeLayout was active', function(){
      var layout = options.defaultGroupLayouts.homeLayout;
      layout.active = true;
      storage = new GroupedStorage(options);

      expect(storage.getActiveLayout()).toBe(layout);

      storage.removeHomeLayout();

      var active = storage.getActiveLayout();
      expect(active).toBeDefined();
      expect(active).not.toBe(layout);
    });

    it('should not change the active layout if it was not the homeLayout', function(){
      storage = new GroupedStorage(options);

      var layout = storage.getActiveLayout();

      expect(storage.homeLayout).not.toBe(layout);

      storage.removeHomeLayout();

      var active = storage.getActiveLayout();
      expect(active).toBeDefined();
      expect(active).toBe(layout);
    });
  });

  describe('the save method', function(){
    it('should increment the unsaved change count', function(){
      options.explicitSave = true;
      storage = new GroupedStorage(options);
      storage.options.unsavedChangeCount = 0;

      storage.save();
      expect(storage.options.unsavedChangeCount).toEqual(1);

      storage.save();
      storage.save();
      storage.save();
      expect(storage.options.unsavedChangeCount).toEqual(4);
    });

    it('should do nothing if isReadonly', function(){
      options.isReadonly = true;
      storage = new GroupedStorage(options);
      spyOn(storage, 'saveToStorage').and.callThrough();
      storage.options.unsavedChangeCount = 0;

      storage.options.unsavedChangeCount = 0;
      storage.save();
      expect(storage.options.unsavedChangeCount).toEqual(0);

      expect(storage.saveToStorage).not.toHaveBeenCalled();
    });

    it('should call saveToStorage if explicit save is false', function(){
      options.explicitSave = false;
      storage = new GroupedStorage(options);
      spyOn(storage, 'saveToStorage').and.callThrough();

      storage.options.unsavedChangeCount = 0;
      storage.save();
      expect(storage.options.unsavedChangeCount).toEqual(0);

      expect(storage.saveToStorage).toHaveBeenCalled();
    });

    it('should not call saveToStorage if explicit save is true', function(){
      options.explicitSave = true;
      storage = new GroupedStorage(options);
      spyOn(storage, 'saveToStorage').and.callThrough();

      storage.options.unsavedChangeCount = 0;
      storage.save();
      expect(storage.options.unsavedChangeCount).toEqual(1);

      expect(storage.saveToStorage).not.toHaveBeenCalled();
    });
  });

  describe('the saveToStorage method', function () {

    it('should call options.storage.setItem with a stringified object', function () {
      storage = new GroupedStorage(options);
      spyOn(options.storage, 'setItem');
      storage.saveToStorage();
      expect(options.storage.setItem).toHaveBeenCalled();
      expect(options.storage.setItem.calls.argsFor(0)[0]).toEqual(storage.id);
      expect(typeof options.storage.setItem.calls.argsFor(0)[1]).toEqual('string');
      expect(function () {
        JSON.parse(options.storage.setItem.calls.argsFor(0)[1]);
      }).not.toThrow();
    });

    it('should save an object that has groups, homeLayout, states, and storageHash', function () {
      spyOn(options.storage, 'setItem');
      storage = new GroupedStorage(options);
      storage.saveToStorage();

      var obj = JSON.parse(options.storage.setItem.calls.argsFor(0)[1]);
      expect(obj.hasOwnProperty('groups')).toEqual(true);
      expect(obj.groups instanceof Array).toEqual(true);
      expect(obj.hasOwnProperty('homeLayout')).toEqual(true);
      expect(typeof obj.homeLayout).toEqual('object');
      expect(obj.hasOwnProperty('states')).toEqual(true);
      expect(typeof obj.states).toEqual('object');
      expect(obj.hasOwnProperty('storageHash')).toEqual(true);
      expect(typeof obj.storageHash).toEqual('string');
    });

    it('should call options.storage.setItem with an object when stringifyStorage is false', function () {
      options.stringifyStorage = false;
      storage = new GroupedStorage(options);
      spyOn(options.storage, 'setItem');
      storage.saveToStorage();
      expect(options.storage.setItem).toHaveBeenCalled();
      expect(options.storage.setItem.calls.argsFor(0)[0]).toEqual(storage.id);
      expect(typeof options.storage.setItem.calls.argsFor(0)[1]).toEqual('object');
    });

    it('should reset unsaved change count', function(){
      storage = new GroupedStorage(options);
      spyOn(options.storage, 'setItem');
      storage.options.unsavedChangeCount = 10;
      storage.saveToStorage();
      expect(options.storage.setItem).toHaveBeenCalled();
      expect(storage.options.unsavedChangeCount).toEqual(0);
    });
  });

  describe('the setItem method', function () {

    it('should set storage.states[id] to the second argument', function () {
      var state = { some: 'thing'};
      storage.setItem('id', state);
      expect(storage.states.id).toEqual(state);
    });

    it('should call save', function () {
      spyOn(storage, 'save');
      var state = { some: 'thing'};
      storage.setItem('id', state);
      expect(storage.save).toHaveBeenCalled();
    });

  });

  describe('the getItem method', function () {

    it('should return states[id]', function () {
      storage.states['myId'] = {};
      var result = storage.getItem('myId');
      expect(result === storage.states['myId']).toEqual(true);
    });

  });

  describe('the removeItem method', function () {

    it('should remove states[id]', function () {
      var state = {};
      storage.setItem('1', state);
      storage.removeItem('1');
      expect(storage.states['1']).toBeUndefined();
    });

    it('should call save', function () {
      spyOn(storage, 'save');
      var state = {};
      storage.setItem('1', state);
      storage.removeItem('1');
      expect(storage.save).toHaveBeenCalled();
    });

  });
});