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
                widgetDefinitions: {},
                dashboardTitle: 'Dashboard title'
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

        it('should NOT use result from getItem for layouts if the storageHash doesnt match', function() {
            spyOn(options.storage, 'getItem').and.returnValue(JSON.stringify({
                storageHash: 'alskdjf02iej',
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
            expect(storage.groups.map(function(l) {return l.groupTitle})).toEqual(['Group 1', 'Group 2']);
        });

        it('should be able to handle async loading via promise', inject(function($rootScope,$q) {
            var deferred = $q.defer();
            spyOn(options.storage, 'getItem').and.returnValue(deferred.promise);
            storage = new DashboardStorage(options);
            expect(storage.groups).toEqual([]);
            deferred.resolve(JSON.stringify({
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
            $rootScope.$apply();
            expect(storage.groups.map(function(l) {return l.groupTitle})).toEqual(['Custom Group 1', 'Custom Group 2', 'Custom Group 3']);
        }));

        it('should load defaults if the deferred is rejected', inject(function($rootScope,$q) {
            var deferred = $q.defer();
            spyOn(options.storage, 'getItem').and.returnValue(deferred.promise);
            storage = new DashboardStorage(options);
            deferred.reject();
            $rootScope.$apply();
            expect(storage.groups.map(function(l) {return l.groupTitle})).toEqual(['Group 1', 'Group 2']); // Fix structure
        }));

        it('should load defaults if the json is malformed', inject(function($rootScope,$q) {
            var deferred = $q.defer();
            spyOn(options.storage, 'getItem').and.returnValue(deferred.promise);
            storage = new DashboardStorage(options);
            expect(storage.groups).toEqual([]);
            deferred.resolve(JSON.stringify({
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
            }).replace('{','{{')); // Fix structure
            $rootScope.$apply();
            expect(storage.groups.map(function(l) {return l.groupTitle})).toEqual(['Group 1', 'Group 2']);
        }));

        it('should not try to JSON.parse the result if stringifyStorage is false.', function() {
            options.stringifyStorage = false;
            spyOn(options.storage, 'getItem').and.returnValue({
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
            });
            storage = new DashboardStorage(options);
            expect(storage.groups.map(function(l) {return l.groupTitle})).toEqual(['Custom Group 1', 'Custom Group 2', 'Custom Group 3']);
        });

    });

    describe('the add method', function() {

        var storage, options;

        beforeEach(function() {
            options = {
                storageId: 'testingStorage',
                storage: {
                    setItem: function(key, value) {

                    },
                    getItem: function(key) {

                    },
                    removeItem: function(key) {

                    }
                },
                storageHash: 'ds5f9d1f',
                stringifyStorage: true,
                widgetDefinitions: [

                ],
                defaultGroupLayouts: [],
                widgetButtons: false,
                explicitSave: false
            }

            spyOn(DashboardStorage.prototype, 'load' );

            storage = new DashboardStorage(options);

        });

        it('should add to storage.groups', function() {
            var newGroup = { title: 'another group' };
            storage.add(newGroup);
            expect(storage.groups[0]).toEqual(newGroup);
        });

        it('should be able to take an array of new groups', function() {
            var newGroups = [ { title: 'some group' }, { title: 'another group' } ];
            storage.add(newGroups);
            expect(storage.groups.length).toEqual(2);
            expect(storage.groups.indexOf(newGroups[0])).not.toEqual(-1);
            expect(storage.groups.indexOf(newGroups[1])).not.toEqual(-1);
        });
    });

    describe('the remove method', function() {

        var storage, options;

        beforeEach(function() {
            options = {
                storageId: 'testingStorage',
                storageHash: 'ds5f9d1f',
                stringifyStorage: true,
                defaultGroupLayouts: defaultGroupLayouts,
                explicitSave: false
            }

            storage = new DashboardStorage(options);
        });

        it('should remove the supplied layout', function() {
            var group = storage.groups[1];
            storage.remove(group);
            expect(storage.groups.indexOf(group)).toEqual(-1);
        });

        it('should do nothing if group is not in groups', function() {
            var group = {};
            var before = storage.groups.length;
            storage.remove(group);
            var after = storage.groups.length;
            expect(before).toEqual(after);
        });

        it('should not allow removing of a group if it contains any layoutGroup', function(){
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

            storage = new DashboardStorage(options);
            var group = storage.groups[1];
            storage.remove(group);
            expect(storage.groups.indexOf(group)).toEqual(1);
        });
    });

    describe('the save method', function() {

        var options, storage;

        beforeEach(function() {
            options = {
                storageId: 'testingStorage',
                storage: {
                    setItem: function(key, value) {

                    },
                    getItem: function(key) {

                    },
                    removeItem: function(key) {

                    }
                },
                storageHash: 'ds5f9d1f',
                stringifyStorage: true,
                widgetDefinitions: [

                ],
                defaultGroupLayouts: defaultGroupLayouts,
                widgetButtons: false,
                explicitSave: false
            }
            storage = new DashboardStorage(options);
        });

        it('should call options.storage.setItem with a stringified object', function() {
            spyOn(options.storage, 'setItem' );
            storage.save();
            expect(options.storage.setItem).toHaveBeenCalled();
            expect(options.storage.setItem.calls.argsFor(0)[0]).toEqual(storage.id);
            expect(typeof options.storage.setItem.calls.argsFor(0)[1]).toEqual('string');
            expect(function(){
                JSON.parse(options.storage.setItem.calls.argsFor(0)[1]);
            }).not.toThrow();
        });

        it('should save an object that has groups and storageHash', function() {
            spyOn(options.storage, 'setItem' );
            storage.save();
            var obj = JSON.parse(options.storage.setItem.calls.argsFor(0)[1]);
            expect(obj.hasOwnProperty('dashboard')).toEqual(true, 'Should have dashboard property');
            expect(typeof obj.dashboard).toEqual('object');
            expect(obj.dashboard.hasOwnProperty('groups')).toEqual(true, 'Should have dashboard.groups property');
            expect(obj.dashboard.groups instanceof Array).toEqual(true, 'Groups should be array');
            expect(obj.hasOwnProperty('storageHash')).toEqual(true);
            expect(typeof obj.storageHash).toEqual('string');
        });

        it('should call options.storage.setItem with an object when stringifyStorage is false', function() {
            options.stringifyStorage = false;
            storage = new DashboardStorage(options);
            spyOn(options.storage, 'setItem' );
            storage.save();
            expect(options.storage.setItem).toHaveBeenCalled();
            expect(options.storage.setItem.calls.argsFor(0)[0]).toEqual(storage.id);
            expect(typeof options.storage.setItem.calls.argsFor(0)[1]).toEqual('object');
        });
    });
})
;