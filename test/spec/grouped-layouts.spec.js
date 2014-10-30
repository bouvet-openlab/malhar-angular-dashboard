/**
 * Created by EIBEL on 30.10.2014.
 */

'use strict';

describe('Directive: grouped-layouts', function(){
  var $rootScope;
  var element;
  var childScope;

  var GroupedStorage;

  var $mockModal;
  var $mockTimeout;

  var options;

  var toFn;

  // mock UI Sortable
  beforeEach(function(){
    angular.module('ui.sortable', []);
  });

  // load the directive's module
  beforeEach(module('ui.dashboard', function ($provide) {
    $mockModal = {
      open: function () {
      }
    };
    $mockTimeout = function (fn, delay) {
      toFn = fn;
    };
    $provide.value('$modal', $mockModal);
    $provide.value('$timeout', $mockTimeout);
  }));

  beforeEach(inject(function($compile, _$rootScope_, _GroupedStorage_){
    $rootScope = _$rootScope_;
    GroupedStorage = _GroupedStorage_;

    $rootScope.dashboardOptions = options = {
      defaultGroupLayouts: {
        groups: [
          {
            id: 1,
            groupTitle: 'Default group 1',
            layoutGroups: [
              {
                id: 1,
                layoutGroupTitle: 'Default layout group 1',
                layouts: [
                  {
                    id: 1,
                    title: 'a title'
                  }
                ]
              },
              {
                id: 2,
                layoutGroupTitle: 'Default layout group 2',
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
                layoutGroupTitle: 'Default layout group 3',
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
      }
    };

    element = $compile('<div grouped-layouts="dashboardOptions"></div>div>')($rootScope);
    $rootScope.$digest();
    childScope = element.scope();
  }));

  it('Exists - Ice breaker', function(){
    expect(childScope).toBeDefined();
  });

  it('should not require storage', inject(function ($compile) {
    delete $rootScope.dashboardOptions.storage;
    expect(function () {
      var noStorageEl = $compile('<div grouped-layouts="dashboardOptions"></div>')($rootScope);
      $rootScope.$digest();
    }).not.toThrow();
  }));

  it('should be able to use a different grouped-layouts template', inject(function ($compile, $templateCache) {
    $templateCache.put(
      'myCustomGroupedLayoutsTemplate.html', '<div class="custom-class"></div>'
    );
    var customElement = $compile('<div grouped-layouts="dashboardOptions" template-url="myCustomGroupedLayoutsTemplate.html"></div>')($rootScope);
    $rootScope.$digest();

    expect(customElement.find('div.custom-class').length).toEqual(1, 'Should contain div with class custom-class');
  }));

  it('should initialize scope variables', function(){
    expect(childScope.options).toBe(options);

    expect(options.defaultGroupLayouts.groups.length).toBe(childScope.groups.length);
    angular.forEach(options.defaultGroupLayouts.groups, function(group){
      expect(childScope.groups.indexOf(group) >= 0).toBe(true, 'group should be same instance');
    })
  });

  // TODO: Should set an active dashboard

  describe('the editTitle method', function(){
    it('should set the editingTitle attribute to true on the object it is passed', function() {
      var group = childScope.groups[0];
      childScope.editTitle(group, 'group' + group.id);
      $rootScope.$digest();
      expect(group.editingTitle).toEqual(true);
      toFn();
    });
  });

  describe(' the saveTitleEdit method', function(){
    it('should set editingTitle to false', function() {
      var group = { id: '1', editingTitle: true };
      childScope.saveTitleEdit(group);
      expect(group.editingTitle).toEqual(false);
    });

    it('should call layoutStorage.save', function() {
      var group = { id: '1' };
      spyOn(GroupedStorage.prototype, 'save').and.callThrough();
      childScope.saveTitleEdit(group);
      expect(GroupedStorage.prototype.save).toHaveBeenCalled();
    });
  });

  describe('the createGroup method', function(){
    it('should call the add and save methods of GroupStorage', function(){
      spyOn(GroupedStorage.prototype, 'add');
      spyOn(GroupedStorage.prototype, 'save');

      childScope.createGroup();

      expect(GroupedStorage.prototype.add).toHaveBeenCalled();
      expect(GroupedStorage.prototype.save).toHaveBeenCalled();
    });

    it('groups should be larger after create', function(){
      var beforeLength = childScope.groups.length;

      var result = childScope.createGroup();

      expect(childScope.groups.indexOf(result)).toBe(beforeLength);

      expect(childScope.groups.length).toBe(beforeLength + 1);
    });

    it('should return the newly created group object', function() {
      var result = childScope.createGroup();
      expect(typeof result).toEqual('object');

      expect(childScope.groups.indexOf(result) >= 0).toBe(true);
      expect(result.id > 0).toBe(true);
    });
  });

  describe('the removeGroup method', function(){
    it('should call the remove and save methods of GroupedStorage', function() {
      spyOn(GroupedStorage.prototype, 'remove');
      spyOn(GroupedStorage.prototype, 'save');

      var group = childScope.groups[2];

      childScope.removeGroup(group);

      expect(GroupedStorage.prototype.remove).toHaveBeenCalledWith(group);
      expect(GroupedStorage.prototype.save).toHaveBeenCalled();
    });

    it('groups should be smaller after remove', function(){
      var beforeLength = childScope.groups.length;

      var group = childScope.groups[2];

      childScope.removeGroup(group);

      expect(childScope.groups.indexOf(group)).toBe(-1);

      expect(childScope.groups.length).toBe(beforeLength - 1);
    });

    it('should call remove with the group it was passed', function() {
      spyOn(GroupedStorage.prototype, 'remove');
      var group = childScope.groups[0];
      childScope.removeGroup(group);
      expect(GroupedStorage.prototype.remove.calls.argsFor(0)[0]).toEqual(group);
    });
  });

  describe('the createLayoutGroup method', function(){
    it('should call the addLayoutGroup and save methods of GroupStorage', function(){
      spyOn(GroupedStorage.prototype, 'addLayoutGroup');
      spyOn(GroupedStorage.prototype, 'save');

      var group = childScope.groups[0];

      childScope.createLayoutGroup(group);

      expect(GroupedStorage.prototype.addLayoutGroup).toHaveBeenCalled();
      expect(GroupedStorage.prototype.save).toHaveBeenCalled();
    });

    it('group.layoutGroups should be larger after create', function(){
      var group = childScope.groups[0];

      var beforeLength = group.layoutGroups.length;

      var result = childScope.createLayoutGroup(group);

      expect(group.layoutGroups.indexOf(result)).toBe(beforeLength);

      expect(group.layoutGroups.length).toBe(beforeLength + 1);
    });

    it('should return the newly created layout group object', function() {
      var group = childScope.groups[0];

      var result = childScope.createLayoutGroup(group);
      expect(typeof result).toEqual('object');

      expect(group.layoutGroups.indexOf(result) >= 0).toBe(true);
      expect(result.id > 0).toBe(true);
    });
  });

  describe('the removeLayoutGroup method', function(){
    it('should call the removeLayoutGroup and save methods of GroupedStorage', function() {
      spyOn(GroupedStorage.prototype, 'removeLayoutGroup');
      spyOn(GroupedStorage.prototype, 'save');

      var layoutGroup = childScope.groups[1].layoutGroups[0];

      childScope.removeLayoutGroup(layoutGroup);

      expect(GroupedStorage.prototype.removeLayoutGroup).toHaveBeenCalledWith(layoutGroup);
      expect(GroupedStorage.prototype.save).toHaveBeenCalled();
    });

    it('groups should be smaller after remove', function(){
      var beforeLength = childScope.groups[1].layoutGroups.length;

      var layoutGroup = childScope.groups[1].layoutGroups[0];

      childScope.removeLayoutGroup(layoutGroup);

      expect(childScope.groups[1].layoutGroups.indexOf(layoutGroup)).toBe(-1);

      expect(childScope.groups[1].layoutGroups.length).toBe(beforeLength - 1);
    });

    it('should call removeLayoutGroup with the layout group it was passed', function() {
      spyOn(GroupedStorage.prototype, 'removeLayoutGroup');
      var layoutGroup = childScope.groups[1].layoutGroups[0];
      childScope.removeLayoutGroup(layoutGroup);
      expect(GroupedStorage.prototype.removeLayoutGroup.calls.argsFor(0)[0]).toEqual(layoutGroup);
    });
  });

  describe('the createLayout method', function(){

  });
});