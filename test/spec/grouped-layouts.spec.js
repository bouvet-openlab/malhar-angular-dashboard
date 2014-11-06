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

//  // mock dashboard directive
//  beforeEach(module('ui.dashboard', function($compileProvider){
//    $compileProvider.directive('dashboard', function(){
//      var def = {
//        priority: 9999,
//        terminal: true,
//        restrict:'EAC',
//        template:'<div class="mock">this is a mock</div>'
//      };
//      return def;
//    });
//  }));

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
      explicitSave: false,
      defaultGroupLayouts: {
        homeLayout: {
          id: 4,
          title: 'Start'
        },
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
                    title: 'a title',
                    active: true
                  },
                  {
                    id: 2,
                    title: 'a title2'
                  },
                  {
                    id: 3,
                    title: 'a title2'
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

    element = $compile('<div grouped-layouts="dashboardOptions"></div>')($rootScope);
    $rootScope.$digest();
    childScope = element.scope();
  }));

  describe('initialization', function(){

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

    it('should be able compile template', function () {
      expect(element.find('div#editableGroupedLayouts').length).toEqual(1, 'Should contain div with id editableGroupedLayouts');
    });

    it('should be able compile readonly template', inject(function ($compile) {
      var customElement = $compile('<div grouped-layouts="dashboardOptions" is-readonly></div>')($rootScope);
      $rootScope.$digest();

      expect(customElement.find('div#readonlyGroupedLayouts').length).toEqual(1, 'Should contain div with id readonlyGroupedLayouts');
    }));

    it('should be able to use a different grouped-layouts template', inject(function ($compile, $templateCache) {
      $templateCache.put(
        'myCustomGroupedLayoutsTemplate.html', '<div class="custom-class"></div>'
      );
      var customElement = $compile('<div grouped-layouts="dashboardOptions" template-url="myCustomGroupedLayoutsTemplate.html"></div>')($rootScope);
      $rootScope.$digest();

      expect(customElement.find('div.custom-class').length).toEqual(1, 'Should contain div with class custom-class');
    }));

//    it()

    it('should initialize scope variables', inject(function($compile){
      //$rootScope.dashboardOptions.explicitSave = true;
      options.explicitSave = true;
      spyOn(GroupedStorage.prototype, 'getActiveLayout').and.callThrough();

      element = $compile('<div grouped-layouts="dashboardOptions"></div>')($rootScope);
      $rootScope.$digest();
      childScope = element.scope();

      expect(childScope.options).toBe(options);

      expect(options.defaultGroupLayouts.groups.length).toBe(childScope.groups.length);
      expect(childScope.homeLayout).toBe(options.defaultGroupLayouts.homeLayout);
      expect(childScope.explicitSave).toBe(true);
    }));

  });

  describe('the editTitle method', function(){
    it('should set the editingTitle attribute to true on the object it is passed', function() {
      var group = childScope.groups[0];
      childScope.editTitle(group, 'group' + group.id);
      $rootScope.$digest();
      expect(group.editingTitle).toEqual(true);
      toFn();
    });
  });

  describe('the saveTitleEdit method', function(){
    it('should set editingTitle to false', function() {
      var group = { id: '1', editingTitle: true };
      childScope.saveTitleEdit(group);
      expect(group.editingTitle).toEqual(false);
    });

    it('should call groupedStorage.save', function() {
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
    it('should call the addLayout and save methods of GroupedStorage', function() {
      spyOn(GroupedStorage.prototype, 'addLayout');
      spyOn(GroupedStorage.prototype, 'save');

      var layoutGroup = childScope.groups[0].layoutGroups[0];

      childScope.createLayout(layoutGroup);
      expect(GroupedStorage.prototype.addLayout).toHaveBeenCalled();
      expect(GroupedStorage.prototype.save).toHaveBeenCalled();
    });

    it('layoutGroup.layouts should be larger after create', function(){
      var layoutGroup = childScope.groups[0].layoutGroups[0];

      var beforeLength = layoutGroup.layouts.length;

      var result = childScope.createLayout(layoutGroup);

      expect(layoutGroup.layouts.indexOf(result)).toBe(beforeLength);

      expect(layoutGroup.layouts.length).toBe(beforeLength + 1);
    });

    it('should return the newly created layout object', function() {
      var layoutGroup = childScope.groups[0].layoutGroups[0];

      var result = childScope.createLayout(layoutGroup);
      expect(typeof result).toEqual('object');

      expect(layoutGroup.layouts.indexOf(result) >= 0).toBe(true);
      expect(result.id > 0).toBe(true);
    });

    it('should set active=true on the newly created layout and pass to _makeLayoutActive', function() {
      spyOn(childScope, '_makeLayoutActive');
      var layoutGroup = childScope.groups[0].layoutGroups[0];

      var result = childScope.createLayout(layoutGroup);
      expect(result.active).toEqual(true);

      expect(childScope._makeLayoutActive).toHaveBeenCalledWith(result);
    });
  });

  describe('the removeLayout method', function(){
    it('should call the removeLayout and save methods of GroupedStorage', function() {
      spyOn(GroupedStorage.prototype, 'removeLayout');
      spyOn(GroupedStorage.prototype, 'save');

      childScope.removeLayout(childScope.groups[0].layoutGroups[0].layouts[0]);
      expect(GroupedStorage.prototype.removeLayout).toHaveBeenCalled();
      expect(GroupedStorage.prototype.save).toHaveBeenCalled();
    });

    it('should call remove with the layout it was passed', function() {
      spyOn(GroupedStorage.prototype, 'removeLayout');
      var layout = childScope.groups[0].layoutGroups[0].layouts[0];
      childScope.removeLayout(layout);
      expect(GroupedStorage.prototype.removeLayout.calls.argsFor(0)[0]).toEqual(layout);
    });
  });

  describe('the createHomeLayout method', function(){
    beforeEach(inject(function($compile){

      $rootScope.dashboardOptions.defaultGroupLayouts.homeLayout = undefined;

      element = $compile('<div grouped-layouts="dashboardOptions"></div>')($rootScope);
      $rootScope.$digest();
      childScope = element.scope();
    }));

    it('should call the addHomeLayout and save methods of GroupedStorage', function() {
      spyOn(GroupedStorage.prototype, 'addHomeLayout');
      spyOn(GroupedStorage.prototype, 'save');

      childScope.createHomeLayout();
      expect(GroupedStorage.prototype.addHomeLayout).toHaveBeenCalled();
      expect(GroupedStorage.prototype.save).toHaveBeenCalled();
    });

    it('should return the newly created layout object', function() {
      var result = childScope.createHomeLayout();
      expect(typeof result).toEqual('object');

      expect(result.id > 0).toBe(true);
      expect(result.title).toBe('Home');
      expect(result.dashboard).toBeDefined();
    });

    it('homeLayout should be set after create', function(){
      spyOn(childScope, 'bindHomeLayout').and.callThrough();
      expect(childScope.homeLayout).toBeUndefined();

      var result = childScope.createHomeLayout();

      expect(childScope.bindHomeLayout).toHaveBeenCalled();
      expect(childScope.homeLayout).toBe(result);
    });

    it('should set active=true on the newly created layout and pass to _makeLayoutActive', function() {
      spyOn(childScope, '_makeLayoutActive');

      var result = childScope.createHomeLayout();
      expect(result.active).toEqual(true);

      expect(childScope._makeLayoutActive).toHaveBeenCalledWith(result);
    });
  });

  describe('the removeHomeLayout method', function(){
    it('should call the removeHomeLayout and save methods of GroupedStorage', function(){
      spyOn(GroupedStorage.prototype, 'removeHomeLayout');
      spyOn(GroupedStorage.prototype, 'save');

      childScope.removeHomeLayout();
      expect(GroupedStorage.prototype.removeHomeLayout).toHaveBeenCalled();
      expect(GroupedStorage.prototype.save).toHaveBeenCalled();
    });

    it('should no longer contain homeLayout after removal', function(){
      spyOn(childScope, 'bindHomeLayout').and.callThrough();

      childScope.removeHomeLayout();
      expect(childScope.bindHomeLayout).toHaveBeenCalled();

      expect(childScope.homeLayout).toBeUndefined();
    });
  });

  describe('the getAllLayouts method', function(){

    it('should include all layouts from homeLayout, groups and layout groups', function(){
      var homeLayout = {id: 1, title: 'start'};
      var firstGroupLayout1 = {id: 2, title: 'first 1'};
      var firstGroupLayout2 = {id: 3, title: 'first 2'};
      var secondGroupLayout1 = {id: 4, title: 'second 1'}

      childScope.groups = [{id: 1, layoutGroups: [{id: 1, layouts: [firstGroupLayout1, firstGroupLayout2]}, {id: 2, layouts: [secondGroupLayout1]}]}];
      childScope.homeLayout = homeLayout;

      var result = childScope.getAllLayouts();

      expect(result.length).toBe(4);
      expect(result.indexOf(homeLayout) >= 0).toBe(true);
      expect(result.indexOf(firstGroupLayout1) >= 0).toBe(true);
      expect(result.indexOf(firstGroupLayout2) >= 0).toBe(true);
      expect(result.indexOf(secondGroupLayout1) >= 0).toBe(true);
    });

    it('should ignore homeLayout if not set', function(){
      var firstGroupLayout1 = {id: 2, title: 'first 1'};
      var firstGroupLayout2 = {id: 3, title: 'first 2'};
      var secondGroupLayout1 = {id: 4, title: 'second 1'}

      childScope.groups = [{id: 1, layoutGroups: [{id: 1, layouts: [firstGroupLayout1, firstGroupLayout2]}, {id: 2, layouts: [secondGroupLayout1]}]}];
      childScope.homeLayout = undefined;

      var result = childScope.getAllLayouts();

      expect(result.length).toBe(3);
      expect(result.indexOf(firstGroupLayout1) >= 0).toBe(true);
      expect(result.indexOf(firstGroupLayout2) >= 0).toBe(true);
      expect(result.indexOf(secondGroupLayout1) >= 0).toBe(true);
    });

    it('should be empty array if no layouts exists', function(){
      childScope.groups = [];
      childScope.homeLayout = undefined;

      var result = childScope.getAllLayouts();

      expect(angular.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should change if groups changes', function(){
      childScope.groups = [];
      childScope.homeLayout = undefined;

      var initial = childScope.getAllLayouts();

      expect(angular.isArray(initial)).toBe(true);
      expect(initial.length).toBe(0);

      var firstGroupLayout1 = {id: 2, title: 'first 1'};
      var firstGroupLayout2 = {id: 3, title: 'first 2'};
      var secondGroupLayout1 = {id: 4, title: 'second 1'}

      childScope.groups = [{id: 1, layoutGroups: [{id: 1, layouts: [firstGroupLayout1, firstGroupLayout2]}, {id: 2, layouts: [secondGroupLayout1]}]}];

      var result = childScope.getAllLayouts();

      expect(result.length).toBe(3);
      expect(result.indexOf(firstGroupLayout1) >= 0).toBe(true);
      expect(result.indexOf(firstGroupLayout2) >= 0).toBe(true);
      expect(result.indexOf(secondGroupLayout1) >= 0).toBe(true);
    });

    it('should change if homeLayout are added', function(){
      childScope.groups = [];
      childScope.homeLayout = undefined;

      var initial = childScope.getAllLayouts();

      expect(angular.isArray(initial)).toBe(true);
      expect(initial.length).toBe(0);

      var homeLayout = {id: 1, title: 'start'};
      childScope.homeLayout = homeLayout;

      var result = childScope.getAllLayouts();

      expect(result.length).toBe(1);
      expect(result.indexOf(homeLayout) >= 0).toBe(true);
    });
  });

  describe('the makeLayoutActive method', function(){

    it('should call _makeLayoutActive if there is not a currently active dashboard with unsaved changes', function() {
      spyOn(childScope, '_makeLayoutActive');
      var layout = childScope.groups[0].layoutGroups[0].layouts[1];
      childScope.makeLayoutActive(layout);
      expect(childScope._makeLayoutActive).toHaveBeenCalledWith(layout);
    });

    it('should call _makeLayoutActive with homeLayout when activating home layout', function(){
      spyOn(childScope, '_makeLayoutActive');
      var layout = childScope.homeLayout;
      childScope.makeLayoutActive(layout);
      expect(childScope._makeLayoutActive).toHaveBeenCalledWith(layout);
    });

    describe('when there are unsaved changes on the current dashboard', function() {

      var current, options, successCb, errorCb, layout;

      beforeEach(function() {
        current = childScope.groups[0].layoutGroups[0].layouts[0];
        current.dashboard.unsavedChangeCount = 1;

        spyOn($mockModal, 'open').and.callFake(function(arg) {
          options = arg;
          return {
            result: {
              then: function(success, error) {
                successCb = success;
                errorCb = error;
              }
            }
          }
        });

        layout = childScope.groups[0].layoutGroups[0].layouts[1];
        childScope.makeLayoutActive(layout);
      });

      it('should create a modal', function() {
        expect($mockModal.open).toHaveBeenCalled();
      });

      it('should resolve layout to the layout to be made active', function() {
        expect(options.resolve.layout()).toEqual(layout);
      });

      it('should provide a success callback that saves the current dashboard and then calls _makeLayoutActive', function() {
        spyOn(current.dashboard, 'saveDashboard');

        spyOn(childScope, '_makeLayoutActive');
        successCb();

        expect(current.dashboard.saveDashboard).toHaveBeenCalled();
        expect(childScope._makeLayoutActive).toHaveBeenCalled();
        expect(childScope._makeLayoutActive.calls.argsFor(0)[0]).toEqual(layout);
      });

      it('should provide an error callback that only calls _makeLayoutActive', function() {
        spyOn(current.dashboard, 'saveDashboard');
        spyOn(childScope, '_makeLayoutActive');

        errorCb();

        expect(current.dashboard.saveDashboard).not.toHaveBeenCalled();
        expect(childScope._makeLayoutActive).toHaveBeenCalled();
        expect(childScope._makeLayoutActive.calls.argsFor(0)[0]).toEqual(layout);
      });
    });

    describe('when _makeLayoutActive is invoked', function(){
      beforeEach(inject(function($compile){
        var groups = [
          {
            layoutGroups: [
              {
                active: false,
                layouts: [
                  {active: false, id: 1},
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
                  {active: false, id: 6}
                ]
              },
              {
                active: true,
                layouts: [
                  {active: false},
                  {active: true, id: 8}
                ]
              }
            ]
          }
        ];
        options.defaultGroupLayouts.groups = groups;
        options.defaultGroupLayouts.homeLayout = {active: false, id: 9};

        element = $compile('<div grouped-layouts="dashboardOptions"></div>')($rootScope);
        $rootScope.$digest();
        childScope = element.scope();
      }));

      it('should call _ensureActiveLayout and save on groupedStorage', function(){
        spyOn(GroupedStorage.prototype, '_ensureActiveLayout').and.callThrough();
        spyOn(GroupedStorage.prototype, 'save').and.callThrough();

        childScope._makeLayoutActive(childScope.groups[0].layoutGroups[0].layouts[1]);

        expect(GroupedStorage.prototype._ensureActiveLayout).toHaveBeenCalled();
        expect(GroupedStorage.prototype.save).toHaveBeenCalled();
      });

      it('should call _ensureActiveLayout and save on groupedStorage also for homeLayout', function(){
        spyOn(GroupedStorage.prototype, '_ensureActiveLayout').and.callThrough();
        spyOn(GroupedStorage.prototype, 'save').and.callThrough();

        childScope._makeLayoutActive(childScope.homeLayout);

        expect(GroupedStorage.prototype._ensureActiveLayout).toHaveBeenCalled();
        expect(GroupedStorage.prototype.save).toHaveBeenCalled();
      });

      it('should set layout as only active when invoking _makeLayoutActive', function(){

        var layout = childScope.groups[1].layoutGroups[0].layouts[1];

        childScope._makeLayoutActive(layout);

        expect(childScope.homeLayout.active).toBe(false);

        expect(childScope.groups[0].layoutGroups[0].active).toBe(false);
        expect(childScope.groups[0].layoutGroups[0].layouts[0].active).toBe(false);
        expect(childScope.groups[0].layoutGroups[0].layouts[1].active).toBe(false);

        expect(childScope.groups[0].layoutGroups[1].active).toBe(false);
        expect(childScope.groups[0].layoutGroups[1].layouts[0].active).toBe(false);
        expect(childScope.groups[0].layoutGroups[1].layouts[1].active).toBe(false);

        expect(childScope.groups[1].layoutGroups[0].active).toBe(true);
        expect(childScope.groups[1].layoutGroups[0].layouts[0].active).toBe(false);
        expect(childScope.groups[1].layoutGroups[0].layouts[1].active).toBe(true);

        expect(childScope.groups[1].layoutGroups[1].active).toBe(false);
        expect(childScope.groups[1].layoutGroups[1].layouts[0].active).toBe(false);
        expect(childScope.groups[1].layoutGroups[1].layouts[1].active).toBe(false);

        expect(childScope.getAllLayouts().map(function(l){return l.active})).toEqual([false, false, false, false, false, false, true, false, false]);
      });

      it('should set homeLayout as only active when invoking _makeLayoutActive with homeLayout', function(){

        var layout = childScope.homeLayout;

        expect(childScope.homeLayout.active).toBe(false);

        childScope._makeLayoutActive(layout);

        expect(childScope.homeLayout.active).toBe(true);

        expect(childScope.groups[0].layoutGroups[0].active).toBe(false);
        expect(childScope.groups[0].layoutGroups[0].layouts[0].active).toBe(false);
        expect(childScope.groups[0].layoutGroups[0].layouts[1].active).toBe(false);

        expect(childScope.groups[0].layoutGroups[1].active).toBe(false);
        expect(childScope.groups[0].layoutGroups[1].layouts[0].active).toBe(false);
        expect(childScope.groups[0].layoutGroups[1].layouts[1].active).toBe(false);

        expect(childScope.groups[1].layoutGroups[0].active).toBe(false);
        expect(childScope.groups[1].layoutGroups[0].layouts[0].active).toBe(false);
        expect(childScope.groups[1].layoutGroups[0].layouts[1].active).toBe(false);

        expect(childScope.groups[1].layoutGroups[1].active).toBe(false);
        expect(childScope.groups[1].layoutGroups[1].layouts[0].active).toBe(false);
        expect(childScope.groups[1].layoutGroups[1].layouts[1].active).toBe(false);

        expect(childScope.getAllLayouts().map(function(l){return l.active})).toEqual([true, false, false, false, false, false, false, false, false]);
      });
    });
  });

  describe('the proxy methods to active layout', function() {

    var mockDash, galSpy;

    beforeEach(function() {
      mockDash = {
        active: true,
        dashboard: {
          addWidget: function() {},
          loadWidgets: function() {},
          saveDashboard: function() {}
        }
      };
      spyOn(mockDash.dashboard, 'addWidget');
      spyOn(mockDash.dashboard, 'loadWidgets');
      spyOn(mockDash.dashboard, 'saveDashboard');
      galSpy = spyOn(GroupedStorage.prototype, 'getActiveLayout').and;
      galSpy.returnValue(mockDash);
    });

    describe('the addWidget method', function() {

      it('should call dashboard.addWidget method of the active layout', function() {
        options.addWidget(1,2,3);
        expect(mockDash.dashboard.addWidget).toHaveBeenCalled();
        expect(mockDash.dashboard.addWidget.calls.first()).toEqual({object: mockDash.dashboard, args: [1,2,3]});
      });

      it('should do nothing if there is no active layout', function() {
        galSpy.returnValue(null);
        expect(function() {
          options.addWidget();
        }).not.toThrow();
      });

    });

    describe('the loadWidgets method', function() {

      it('should call dashboard.loadWidgets of the current layout', function() {
        options.loadWidgets(1,2,3);
        expect(mockDash.dashboard.loadWidgets).toHaveBeenCalled();
        expect(mockDash.dashboard.loadWidgets.calls.first()).toEqual({object: mockDash.dashboard, args: [1,2,3]});
      });

      it('should do nothing if there is no active layout', function() {
        galSpy.returnValue(null);
        expect(function() {
          options.loadWidgets();
        }).not.toThrow();
      });

    });

    describe('the saveDashboard method', function() {

      it('should call dashboard.saveDashboard of the current layout', function() {
        options.saveDashboard(1,2,3);
        expect(mockDash.dashboard.saveDashboard).toHaveBeenCalled();
        expect(mockDash.dashboard.saveDashboard.calls.first()).toEqual({object: mockDash.dashboard, args: [1,2,3]});
      });

      it('should do nothing if there is no active layout', function() {
        galSpy.returnValue(null);
        expect(function() {
          options.saveDashboard();
        }).not.toThrow();
      });

    });

  });

  describe('the saveToStorage method', function(){
    it('should call groupedStorage.saveToStorage', function() {
      var group = { id: '1' };
      spyOn(GroupedStorage.prototype, 'saveToStorage').and.callThrough();
      childScope.saveToStorage();
      expect(GroupedStorage.prototype.saveToStorage).toHaveBeenCalled();
    });
  });
});