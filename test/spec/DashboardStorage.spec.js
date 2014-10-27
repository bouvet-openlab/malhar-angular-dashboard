/**
 * Created by eibel on 27.10.2014.
 */
'use strict';

describe('DashboardStorage service', function () {

    // mock UI Sortable
    beforeEach(function () {
        angular.module('ui.sortable', []);
    });

    // load the service's module
    beforeEach(module('ui.dashboard'));

    // instantiate service
    var DashboardStorage;
    beforeEach(inject(function (_DashboardStorage_) {
        DashboardStorage = _DashboardStorage_;
    }));

    var defaultGroupLayouts = {
        groups: [
            {
                groupTitle: 'Group 1',
                layoutGroups: [
                    {
                        layoutGroupTitle: 'Layout collection 1',
                        layoutCollections: [
                            {
                                layoutCollectionTitle: 'Collection 1',
                                storageId: 'someStorageId1'},
                            {
                                layoutCollectionTitle: 'Collection 2',
                                storageId: 'someStorageId2'}
                        ]},
                    {
                        layoutGroupTitle: 'Layout collection 2',
                        layoutCollections: [
                            {
                                layoutCollectionTitle: 'Collection 3',
                                storageId: 'someStorageId3'}
                        ]}
                ]
            },
            {
                groupTitle: 'Group 2',
                layoutGroups: [
                    {
                        layoutGroupTitle: 'Layout collection 3',
                        layoutCollections: [
                            {
                                layoutCollectionTitle: 'Collection 5',
                                storageId: 'someStorageId4'}
                        ]}
                ]
            }
        ]
    };
    var defaultGroupLayouts = {
        groups: [
            {
                groupTitle: 'Group 1'
            },
            {
                groupTitle: 'Group 2'
            }
        ]
    };
//    var defaultGroupLayouts = {
//        groups: [
//            {
//                groupTitle: 'Group 1',
//                layoutGroups: [
//                    {
//                        layoutGroupTitle: 'Layout collection 1',
//                        layoutCollections: [
//                            {
//                                layoutCollectionTitle: 'Collection 1',
//                                storageId: 'someStorageId1'},
//                            {
//                                layoutCollectionTitle: 'Collection 2',
//                                storageId: 'someStorageId2'}
//                        ]},
//                    {
//                        layoutGroupTitle: 'Layout collection 2',
//                        layoutCollections: [
//                            {
//                                layoutCollectionTitle: 'Collection 3',
//                                storageId: 'someStorageId3'}
//                        ]}
//                ]
//            },
//            {
//                groupTitle: 'Group 2',
//                layoutGroups: [
//                    {
//                        layoutGroupTitle: 'Layout collection 3',
//                        layoutCollections: [
//                            {
//                                layoutCollectionTitle: 'Collection 5',
//                                storageId: 'someStorageId4'}
//                        ]}
//                ]
//            }
//        ]
//    };

    describe('the constructor', function () {

        var storage, options;

        beforeEach(function () {
            options = {
                storageId: 'testingStorage',
                storage: {
                    setItem: function (key, value) {

                    },
                    getItem: function (key) {

                    },
                    removeItem: function (key) {

                    }
                },
                storageHash: 'ds5f9d1f',
                stringifyStorage: true,
                defaultGroupLayouts: defaultGroupLayouts,
                explicitSave: false,
                settingsModalOptions: {
                },
                lockDefaultGroupLayouts: true,
                widgetDefinitions: {}
            };
            storage = new DashboardStorage(options);
        });

        it('should provide an empty implementation of storage if it is not provided', function () {
            delete options.storage;
            var stateless = new DashboardStorage(options);
            var noop = stateless.storage;
            angular.forEach(['setItem', 'getItem', 'removeItem'], function (method) {
                expect(typeof noop[method]).toEqual('function');
                expect(noop[method]).not.toThrow();
                noop[method]();
            });
        });

        it('should set a subset of the options directly on the DashboardStorage instance itself', function () {
            var properties = {
                id: 'storageId',
                storage: 'storage',
                storageHash: 'storageHash',
                stringifyStorage: 'stringifyStorage',
                defaultLayoutGroups: 'defaultLayoutGroups',
                lockDefaultGroupLayouts: 'lockDefaultGroupLayouts',
                widgetDefinitions: 'widgetDefinitions'
            };

            angular.forEach(properties, function (val, key) {
                expect(storage[key]).toEqual(options[val], 'option: ' + val);
            });

        });

        it('should set stringify as true by default', function () {
            delete options.stringifyStorage;
            storage = new DashboardStorage(options);
            expect(storage.stringifyStorage).toEqual(true);
        });

        it('should allow stringify to be overridden by option', function () {
            options.stringifyStorage = false;
            storage = new DashboardStorage(options);
            expect(storage.stringifyStorage).toEqual(false);
        });

        it('should create a groups array and states object', function () {
            expect(storage.groups instanceof Array).toEqual(true);
            expect(typeof storage.states).toEqual('object');
        });

        it('should call load', function () {
            spyOn(DashboardStorage.prototype, 'load');
            storage = new DashboardStorage(options);
            expect(DashboardStorage.prototype.load).toHaveBeenCalled();
        });
    });

    describe('the load method', function () {

        var options, storage;

        beforeEach(function () {
            options = {
                storageId: 'testingStorage',
                storage: {
                    setItem: function (key, value) {

                    },
                    getItem: function (key) {

                    },
                    removeItem: function (key) {

                    }
                },
                storageHash: 'ds5f9d1f',
                stringifyStorage: true,
                defaultGroupLayouts: defaultGroupLayouts,
                explicitSave: false
            }
            storage = new DashboardStorage(options);
        });

        it('should use the default group layouts if no stored info was found', function () {
            expect(storage.groups.length).toEqual(options.defaultGroupLayouts.groups.length, 'Should use default');
        });

        it('should clone default group layouts rather than use them directly', function () {
            expect(storage.groups.indexOf(options.defaultGroupLayouts.groups[0])).toEqual(-1);
        });

        it('should use the result from getItem for groups.', function() {
            spyOn(options.storage, 'getItem').and.returnValue(JSON.stringify({
                storageHash: 'ds5f9d1f',
                groups: [
                    {
                        groupTitle: 'Custom Group 1'
                    },
                    {
                        groupTitle: 'Custom Group 2'
                    },
                    {
                        groupTitle: 'Custom Group 3'
                    }
                ],
                states: {
                }
            })); // Fix structure
            storage = new DashboardStorage(options);
            expect(storage.groups.map(function(l) {return l.groupTitle})).toEqual(['Custom Group 1', 'Custom Group 2', 'Custom Group 3']);
        });

//        it('should NOT use result from getItem for layouts if the storageHash doesnt match', function() {
//            spyOn(options.storage, 'getItem').and.returnValue(JSON.stringify({
//                storageHash: 'alskdjf02iej',
//                layouts: [
//                    { id: 0, title: 'title', defaultWidgets: [], active: true },
//                    { id: 1, title: 'title2', defaultWidgets: [], active: false },
//                    { id: 2, title: 'title3', defaultWidgets: [], active: false },
//                    { id: 3, title: 'custom', defaultWidgets: [], active: false }
//                ],
//                states: {
//                    0: {},
//                    1: {},
//                    2: {}
//                }
//            })); // Fix structure
//            storage.load();
//            expect(storage.layouts.map(function(l) {return l.title})).toEqual(['something', 'something', 'something']);
//        });
//
//        it('should be able to handle async loading via promise', inject(function($rootScope,$q) {
//            var deferred = $q.defer();
//            spyOn(options.storage, 'getItem').and.returnValue(deferred.promise);
//            storage.load();
//            expect(storage.layouts).toEqual([]);
//            deferred.resolve(JSON.stringify({
//                storageHash: 'ds5f9d1f',
//                layouts: [
//                    { id: 0, title: 'title', defaultWidgets: [], active: true },
//                    { id: 1, title: 'title2', defaultWidgets: [], active: false },
//                    { id: 2, title: 'title3', defaultWidgets: [], active: false },
//                    { id: 3, title: 'custom', defaultWidgets: [], active: false }
//                ],
//                states: {
//                    0: {},
//                    1: {},
//                    2: {}
//                }
//            })); // Fix structure
//            $rootScope.$apply();
//            expect(storage.layouts.map(function(l) {return l.title})).toEqual(['title', 'title2', 'title3', 'custom']);
//        }));

//        it('should load defaults if the deferred is rejected', inject(function($rootScope,$q) {
//            var deferred = $q.defer();
//            spyOn(options.storage, 'getItem').and.returnValue(deferred.promise);
//            storage.load();
//            deferred.reject();
//            $rootScope.$apply();
//            expect(storage.layouts.map(function(l) {return l.title})).toEqual(['something', 'something', 'something']); // Fix structure
//        }));
//
//        it('should load defaults if the json is malformed', inject(function($rootScope,$q) {
//            var deferred = $q.defer();
//            spyOn(options.storage, 'getItem').and.returnValue(deferred.promise);
//            storage.load();
//            expect(storage.layouts).toEqual([]);
//            deferred.resolve(JSON.stringify({
//                storageHash: 'ds5f9d1f',
//                layouts: [
//                    { id: 0, title: 'title', defaultWidgets: [], active: true },
//                    { id: 1, title: 'title2', defaultWidgets: [], active: false },
//                    { id: 2, title: 'title3', defaultWidgets: [], active: false },
//                    { id: 3, title: 'custom', defaultWidgets: [], active: false }
//                ],
//                states: {
//                    0: {},
//                    1: {},
//                    2: {}
//                }
//            }).replace('{','{{')); // Fix structure
//            $rootScope.$apply();
//            expect(storage.layouts.map(function(l) {return l.title})).toEqual(['something', 'something', 'something']);
//        }));

//        it('should not try to JSON.parse the result if stringifyStorage is false.', function() {
//            options.stringifyStorage = false;
//            storage = new LayoutStorage(options);
//            spyOn(options.storage, 'getItem').and.returnValue({
//                storageHash: 'ds5f9d1f',
//                layouts: [
//                    { id: 0, title: 'title', defaultWidgets: [], active: true },
//                    { id: 1, title: 'title2', defaultWidgets: [], active: false },
//                    { id: 2, title: 'title3', defaultWidgets: [], active: false },
//                    { id: 3, title: 'custom', defaultWidgets: [], active: false }
//                ],
//                states: {
//                    0: {},
//                    1: {},
//                    2: {}
//                }
//            });
//            storage.load();
//            expect(storage.layouts.map(function(l) {return l.title})).toEqual(['title', 'title2', 'title3', 'custom']);
//        });

    });
})
;