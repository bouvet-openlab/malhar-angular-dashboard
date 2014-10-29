///**
// * Created by eibel on 27.10.2014.
// */
//
//'use strict';
//
//describe('Directive: dashboard-grouped-layouts', function () {
//    var $mockModal;
//    var $mockTimeout;
//    var toFn;
//    var DashboardStorage;
//    var element;
//    var childScope;
//    var $rootScope;
//    var options;
//
//    // mock UI Sortable
//    beforeEach(function () {
//        angular.module('ui.sortable', []);
//    });
//
//    // load the directive's module
//    beforeEach(module('ui.dashboard', function ($provide) {
//        $mockModal = {
//            open: function () {
//            }
//        };
//        $mockTimeout = function (fn, delay) {
//            toFn = fn;
//        };
//        $provide.value('$modal', $mockModal);
//        $provide.value('$timeout', $mockTimeout);
//    }));
//
//    beforeEach(inject(function ($compile, _$rootScope_, _DashboardStorage_) {
//        // services
//        $rootScope = _$rootScope_;
//        DashboardStorage = _DashboardStorage_;
//
//        // options
//        var widgetDefinitions = [
//            {
//                name: 'wt-one',
//                template: '<div class="wt-one-value">{{2 + 2}}</div>'
//            },
//            {
//                name: 'wt-two',
//                template: '<span class="wt-two-value">{{value}}</span>'
//            }
//        ];
//        var defaultWidgets = _.clone(widgetDefinitions);
//        $rootScope.groupOptions = options = {
//            widgetButtons: true,
//            widgetDefinitions: widgetDefinitions,
//            defaultGroupLayouts: {
//                groups: [
//                    {
//                        id: 1,
//                        groupTitle: 'Group 1',
//                        layoutGroups: [
//                            {
//                                id: 1,
//                                layoutGroupTitle: 'Layout group 1',
//                                layouts: 'collection1id'
//                            },
//                            {
//                                id: 2,
//                                layoutGroupTitle: 'Layout group 2',
//                                layouts: 'collection3id'
//                            }
//                        ]
//                    },
//                    {
//                        id: 2,
//                        groupTitle: 'Group 2',
//                        layoutGroups: [
//                            {
//                                id: 3,
//                                layoutGroupTitle: 'Layout group 3',
//                                layouts: 'collection5id'
//                            }
//                        ]
//                    },
//                    {
//                        id: 3,
//                        groupTitle: 'Group 3',
//                        layoutGroups: []
//                    }
//                ]
//            },
//            defaultWidgets: defaultWidgets,
//            storage: {
//                setItem: function (key, val) {
//
//                },
//                getItem: function (key) {
//
//                },
//                removeItem: function (key) {
//
//                }
//            }
//        };
//        $rootScope.value = 10;
//
//        // element setup
//        element = $compile('<div dashboard-grouped-layouts="dashboardOptions"></div>')($rootScope);
//        $rootScope.$digest();
//        childScope = element.scope();
//    }));
//
//    it('should not require storage', inject(function ($compile) {
//        delete $rootScope.groupOptions.storage;
//        expect(function () {
//            var noStorageEl = $compile('<div dashboard-grouped-layouts="dashboardOptions"></div>')($rootScope);
//            $rootScope.$digest();
//        }).not.toThrow();
//
//    }));
//
//    it('should be able to use a different dashboard-grouped-layouts template', inject(function ($compile, $templateCache) {
//        $templateCache.put(
//            'myCustomGroupTemplate.html',
//                '<ul ng-model="groups" class="my-custom-tabs nav nav-tabs group-tabs">' +
//                '<li ng-repeat="group in groups">' +
//                '<ul>' +
//                '<span ng-dblclick="editTitle(group)" ng-show="!group.editingTitle">{{group.groupTitle}}</span>' +
//                '<form action="" class="group-title" ng-show="group.editingTitle" ng-submit="saveTitleEdit(group)">' +
//                '<input type="text" ng-model="group.title" class="form-control" data-layout="{{group.id}}">' +
//                '</form>' +
//                '<li ng-repeat="layoutGroup in group.layoutGroups">layoutGroup.layoutGroupTitle</li>' +
//                '<li><a>Add Layout Group</a></li>' +
//                '</ul>' +
//                '</li>' +
//                '</ul>'
//        );
//        var customElement = $compile('<div dashboard-grouped-layouts="groupOptions" template-url="myCustomGroupTemplate.html"></div>')($rootScope);
//        $rootScope.$digest();
//        expect(customElement.find('ul.my-custom-tabs').length).toEqual(1);
//
//    }));
//
////    it('should set the first dashboard to active if there is not one already active', inject(function($compile) {
////        options.defaultLayouts[0].active = options.defaultLayouts[1].active = false;
////        element = $compile('<div dashboard-layouts="dashboardOptions"></div>')($rootScope);
////        $rootScope.$digest();
////        childScope = element.scope();
////
////        var layouts = childScope.layouts;
////        var active;
////        for (var i = 0; i < layouts.length; i++) {
////            if (layouts[i].active) {
////                active = layouts[i];
////                break;
////            }
////        };
////        expect(active).not.toBeUndefined();
////    }));
//
//    describe('the createNewGroup method', function() {
//
//        it('should call the add and save methods of DashboardStorage', function() {
//            //spyOn(DashboardStorage.prototype, 'add');
//            spyOn(DashboardStorage.prototype, 'save');
//
//            var length = childScope.groups.length;
//
//            childScope.createNewGroup();
//            //expect(DashboardStorage.prototype.add).toHaveBeenCalled();
//            expect(DashboardStorage.prototype.save).toHaveBeenCalled();
//
//            expect(childScope.groups[length].groupTitle).toBe('Custom Group');
//        });
//
//        it('should return the newly created layout object', function() {
//            var result = childScope.createNewGroup();
//            expect(typeof result).toEqual('object');
//
//            expect(childScope.groups.indexOf(result) >= 0).toBe(true);
//            expect(result.id > 0).toBe(true);
//        });
//    });
//
//    describe('the removeGroup method', function() {
//
//        it('should call the remove and save methods of DashboardStorage', function() {
//            spyOn(DashboardStorage.prototype, 'remove');
//            spyOn(DashboardStorage.prototype, 'save');
//
//            childScope.removeGroup(childScope.groups[2]);
//            expect(DashboardStorage.prototype.remove).toHaveBeenCalled();
//            expect(DashboardStorage.prototype.save).toHaveBeenCalled();
//        });
//
//        it('should call remove with the group it was passed', function() {
//            spyOn(DashboardStorage.prototype, 'remove');
//            var group = childScope.groups[0];
//            childScope.removeGroup(group);
//            expect(DashboardStorage.prototype.remove.calls.argsFor(0)[0]).toEqual(group);
//        });
//
//    });
//
//    describe('the createNewLayoutGroup method', function() {
//
//        it('should call the add and save methods of DashboardStorage', function() {
//            //spyOn(DashboardStorage.prototype, 'addLayoutGroup');
//            spyOn(DashboardStorage.prototype, 'save');
//
//            var group = childScope.groups[0];
//            var length = group.layoutGroups.length;
//
//            childScope.createNewLayoutGroup(group);
//            //expect(DashboardStorage.prototype.addLayoutGroup).toHaveBeenCalled();
//            expect(DashboardStorage.prototype.save).toHaveBeenCalled();
//
//            expect(group.layoutGroups[length].layoutGroupTitle).toBe('Custom Layout Group');
//        });
//
//        it('should return the newly created layout object', function() {
//            var result = childScope.createNewLayoutGroup();
//            expect(typeof result).toEqual('object');
//        });
//    });
//
//    describe('the removeLayoutGroup method', function() {
//
//        it('should call the removeLayoutGroup and save methods of DashboardStorage', function() {
//            spyOn(DashboardStorage.prototype, 'removeLayoutGroup');
//            spyOn(DashboardStorage.prototype, 'save');
//
//            childScope.removeLayoutGroup(childScope.groups[1].layoutGroups[0]);
//            expect(DashboardStorage.prototype.removeLayoutGroup).toHaveBeenCalled();
//            expect(DashboardStorage.prototype.save).toHaveBeenCalled();
//        });
//
//        it('should call remove with the group it was passed', function() {
//            spyOn(DashboardStorage.prototype, 'removeLayoutGroup');
//            var layoutGroup = childScope.groups[1].layoutGroups[0];
//            childScope.removeLayoutGroup(layoutGroup);
//            expect(DashboardStorage.prototype.removeLayoutGroup.calls.argsFor(0)[0]).toEqual(layoutGroup);
//        });
//
//    });
//
//    describe('the editTitle method', function() {
//
//        it('should set the editingTitle attribute to true on the group it is passed', function() {
//            var group = { };
//            childScope.editTitle(group);
//            $rootScope.$digest();
//            expect(group.editingTitle).toEqual(true);
//            toFn();
//        });
//
//    });
//
//    describe('the saveTitleEdit method', function() {
//
//        it('should set editingTitle to false', function() {
//            var group = { id: '1' };
//            childScope.saveTitleEdit(group);
//            expect(group.editingTitle).toEqual(false);
//        });
//
//        it('should call layoutStorage.save', function() {
//            var group = { id: '1' };
//            spyOn(DashboardStorage.prototype, 'save').and.callThrough();
//            childScope.saveTitleEdit(group);
//            expect(DashboardStorage.prototype.save).toHaveBeenCalled();
//        });
//
//    });
//});