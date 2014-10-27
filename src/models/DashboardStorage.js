/**
 * Created by eibel on 27.10.2014.
 */
'use strict';


angular.module('ui.dashboard')
    .factory('DashboardStorage', [
        'LayoutStorage', function (LayoutStorage) {
            var noopStorage = {
                setItem: function () {

                },
                getItem: function () {

                },
                removeItem: function () {

                }
            };
            var layoutstore = {
                setItem: function () {

                },
                getItem: function () {

                },
                removeItem: function () {

                }
            };

            function DashboardStorage(options) {

                var defaults = {
                    storage: noopStorage,
                    stringifyStorage: true
                };

                angular.extend(defaults, options);
                angular.extend(options, defaults);

                this.id = options.storageId;
                this.storage = options.storage;
                this.storageHash = options.storageHash;
                this.stringifyStorage = options.stringifyStorage;
                this.defaultGroupLayouts = options.defaultGroupLayouts;
                this.lockDefaultGroupLayouts = options.lockDefaultGroupLayouts;
                this.widgetDefinitions = options.widgetDefinitions;

                this.groups = [];
                this.states = {};

                this.load();
            };
            DashboardStorage.prototype = {

                add: function(groups){
                    if (!angular.isArray(groups)) {
                        groups = [groups];
                    }
                    var self = this;

                    angular.forEach(groups, function(group){
                        group.layoutGroups = group.layoutGroups ? group.layoutGroups : [];
                        self.groups.push(group);
                    })
                },

                addLayoutGroups: function(groups) {
                    if (!angular.isArray(groups)) {
                        groups = [groups];
                    }
                    var self = this;
                    angular.forEach(groups, function(group) {
// groupTitle
                        group.layouts = [];

                        angular.forEach(group.layoutGroups, function(layoutGroup){
                            //layoutGroupTitle

                            angular.forEach(layoutGroup.layoutCollections, function(layoutCollection){
                                // layoutCollectionTitle

                                var layoutOptions = {
                                    storage: layoutstore,
                                    storageId: layoutCollection.storageId,
                                    widgetDefinitions: self.widgetDefinitions,
                                    stringifyStorage: false,
                                    explicitSave: true,
                                    defaultWidgets: [],
                                    widgetButtons: true
                                };

                                var layout = new LayoutStorage(layoutOptions);

                                group.layouts.push(layout);
                            })
                        });
                    });
                },
                load: function () {

                    var serialized = this.storage.getItem(this.id);

                    if (serialized) {
                        this._handleSyncLoad(serialized);
                    }
                    else {
                        this._addDefaultGroupLayouts();
                    }
//
//                    this.clear();
//
//                    if (serialized) {
//                        // check for promise
//                        if (angular.isObject(serialized) && angular.isFunction(serialized.then)) {
//                            this._handleAsyncLoad(serialized);
//                        } else {
//                            this._handleSyncLoad(serialized);
//                        }
//                    } else {
//                        this._addDefaultLayouts();
//                    }
                },

                clear: function () {
                    this.layouts = [];
                    this.states = {};
                },

                setItem: function (id, value) {
                    this.states[id] = value;
                    this.save();
                },

                getItem: function (id) {
                    return this.states[id];
                },

                removeItem: function (id) {
                    delete this.states[id];
                    this.save();
                },
                _addDefaultGroupLayouts: function () {
                    var self = this;
                    var defaults = this.lockDefaultLayouts ? {locked: true} : {};

                    angular.forEach(this.defaultGroupLayouts.groups, function(group){
                        self.add(angular.extend(_.clone(defaults), group));
                    })
                },

                _handleSyncLoad: function(serialized) {

                    var deserialized;

                    if (this.stringifyStorage) {
                        try {

                            deserialized = JSON.parse(serialized);

                        } catch (e) {
                            this._addDefaultGroupLayouts();
                            return;
                        }
                    } else {

                        deserialized = serialized;

                    }

                    if (this.storageHash !== deserialized.storageHash) {
                        this._addDefaultGroupLayouts();
                        return;
                    }
                    this.states = deserialized.states;
                    this.add(deserialized.groups);
                }
            };

            return DashboardStorage;
        }
    ]);