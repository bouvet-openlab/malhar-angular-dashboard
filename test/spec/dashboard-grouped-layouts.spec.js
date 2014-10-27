/**
 * Created by eibel on 27.10.2014.
 */

'use strict';

describe('Directive: dashboard-grouped-layouts', function () {
    var $mockModal;
    var $mockTimeout;
    var toFn;
    var DashboardState;
    var LayoutStorage;
    var element;
    var childScope;
    var $rootScope;
    var options;

    // mock UI Sortable
    beforeEach(function () {
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

    beforeEach(inject(function ($compile, _$rootScope_, _DashboardState_, _LayoutStorage_) {
        // services
        $rootScope = _$rootScope_;
        DashboardState = _DashboardState_;
        LayoutStorage = _LayoutStorage_;

        // options
        var widgetDefinitions = [
            {
                name: 'wt-one',
                template: '<div class="wt-one-value">{{2 + 2}}</div>'
            },
            {
                name: 'wt-two',
                template: '<span class="wt-two-value">{{value}}</span>'
            }
        ];
        var defaultWidgets = _.clone(widgetDefinitions);
        $rootScope.dashboardOptions = options = {
            widgetButtons: true,
            widgetDefinitions: widgetDefinitions,
            defaultLayoutGroups: {
                groups: [
                    {
                        title: 'Group 1',
                        layoutGroups: [
                            { title: 'Layout collection 1',
                                groupCollections: [
                                    { title: 'Collection 1',
                                        layouts: [
                                            { title: 'Layout 1', active: true, defaultWidgets: defaultWidgets },
                                            { title: 'Layout 2', active: false, defaultWidgets: defaultWidgets },
                                            { title: 'Layout 3', active: false, defaultWidgets: defaultWidgets, locked: false }
                                        ]},
                                    { title: 'Collection 2',
                                        layouts: [
                                            { title: 'Layout 4', active: true, defaultWidgets: defaultWidgets }
                                        ]}
                                ]},
                            { title: 'Layout collection 2',
                                groupCollections: [
                                    { title: 'Collection 3',
                                        layouts: [
                                            { title: 'Layout 7', active: true, defaultWidgets: defaultWidgets }
                                        ]}
                                ]}
                        ]
                    },
                    {
                        title: 'Group 2',
                        layoutGroups: [
                            { title: 'Layout collection 3',
                                groupCollections: [
                                    { title: 'Collection 5',
                                        layouts: [
                                            { title: 'Layout 13', active: true, defaultWidgets: defaultWidgets }
                                        ]}
                                ]}
                        ]
                    }
                ]
            },
            defaultWidgets: defaultWidgets,
            storage: {
                setItem: function(key, val) {

                },
                getItem: function(key) {

                },
                removeItem: function(key) {

                }
            }
        };
        $rootScope.value = 10;

        // element setup
        element = $compile('<div dashboard-grouped-layouts="dashboardOptions"></div>')($rootScope);
        $rootScope.$digest();
        childScope = element.scope();
    }));

//    it('should not require storage', inject(function($compile) {
//        delete $rootScope.dashboardOptions.storage;
//        expect(function() {
//            var noStorageEl = $compile('<div dashboard-grouped-layouts="dashboardOptions"></div>')($rootScope);
//            $rootScope.$digest();
//        }).not.toThrow();
//
//    }));
//
//    it('should be able to use a different dashboard-grouped-layouts template', inject(function($compile, $templateCache) {
//        $templateCache.put(
//            'myCustomTemplate.html',
//                '<ul class="my-custom-tabs layout-tabs">' +
//                '<li ng-repeat="group in groups" ng-class="{ active: group.active }">' +
//                '<a ng-click="makeGroupActive(group)">' +
//                '<span ng-dblclick="editTitle(group)" ng-show="!group.editingTitle">{{group.title}}</span>' +
//                '<form action="" class="group-title" ng-show="group.editingTitle" ng-submit="saveTitleEdit(group)">' +
//                '<input type="text" ng-model="group.title" class="form-control" data-layout="{{group.id}}">' +
//                '</form>' +
//                '<span ng-click="removeGroup(group)" class="glyphicon glyphicon-remove"></span>' +
//                '<!-- <span class="glyphicon glyphicon-pencil"></span> -->' +
//                '<!-- <span class="glyphicon glyphicon-remove"></span> -->' +
//                '</a>' +
//                '</li>' +
//                '<li>' +
//                '<a ng-click="createNewGroup()">' +
//                '<span class="glyphicon glyphicon-plus"></span>' +
//                '</a>' +
//                '</li>' +
//                '</ul>' +
//                '<div ng-repeat="group in groups | filter:isActive" dashboard="layout.dashboard" templateUrl="template/dashboard.html"></div>'
//        );
//        var customElement = $compile('<div dashboard-grouped-layouts="dashboardOptions" template-url="myCustomTemplate.html"></div>')($rootScope);
//        $rootScope.$digest();
//        expect(customElement.find('ul.my-custom-tabs').length).toEqual(1);
//
//    }));
});