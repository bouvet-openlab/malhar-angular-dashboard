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
                this.explicitSave = options.explicitSave;
                this.options = options;
                this.options.unsavedChangeCount = 0;

                this.groups = [];
                this.layoutStates = {};

                this.internalLayoutStorage = {
                    setItem: function (id, value) {
                        console.log('set id', id, 'to value', value);
                        this.layoutStates[id] = value;
                    },
                    getItem: function (id) {
                        console.log('layoutStates', this.layoutStates);
                        console.log('get by id', id);
                        return this.layoutStates[id];
                    },
                    removeItem: function (id) {
                        console.log('remove by id', id);
                        this.layoutStates[id] = undefined;
                    }
                };

                this.load();
            };
            DashboardStorage.prototype = {
                getInternalLayoutStorage: function(){
                    return this.internalLayoutStorage;
                },

                add: function (groups) {
                    if (!angular.isArray(groups)) {
                        groups = [groups];
                    }
                    var self = this;

                    angular.forEach(groups, function (group) {
                        group.id = self._getGroupId(group);
                        group.layoutGroups = group.layoutGroups || [];

                        self.groups.push(group);
                    })
                },

                addLayoutGroup: function (group, layoutGroups) {

                    if (group && layoutGroups) {
                        if (!angular.isArray(layoutGroups)) {
                            layoutGroups = [layoutGroups];
                        }

                        var self = this;
                        if (this.groups.indexOf(group) >= 0) {
                            angular.forEach(layoutGroups, function (layoutGroup) {
                                layoutGroup.id = self._getLayoutGroupId(layoutGroup);
                                layoutGroup.layoutOptions = layoutGroup.layoutOptions || {
                                    storageId: self.id + '-' + group.id + '-' + layoutGroup.id + '-layouts',
                                    storage: self.internalLayoutStorage,
                                    storageHash: self.storageHash,
                                    widgetDefinitions: self.widgetDefinitions,
                                    defaultWidgets: [],
                                    explicitSave: self.explicitSave,
                                    defaultLayouts: []
                                };

                                group.layoutGroups.push(layoutGroup);
                            });
                        }
                    }
                },

                remove: function (group) {
                    var index = this.groups.indexOf(group);
                    if (index >= 0 && (angular.isUndefined(group.layoutGroups) || group.layoutGroups.length === 0)) {
                        this.groups.splice(index, 1);

                        // check for active
                        if (group.active && this.groups.length) {
                            var nextActive = index > 0 ? index - 1 : 0;
                            this.groups[nextActive].active = true;
                        }
                    }
                },

                removeLayoutGroup: function (layoutGroup) {
                    angular.forEach(this.groups, function (group) {
                        var index = group.layoutGroups.indexOf(layoutGroup);
                        if (index >= 0) {
                            group.layoutGroups.splice(index, 1);

                            // check for active
                            if (layoutGroup.active && group.layoutGroups.length) {
                                var nextActive = index > 0 ? index - 1 : 0;
                                group.layoutGroups[nextActive].active = true;
                            }
                        }
                    })
                },

                save: function () {

                    var state = this._serializeGroups();

                    state.storageHash = this.storageHash;

                    if (this.stringifyStorage) {
                        state = JSON.stringify(state);
                    }

                    this.storage.setItem(this.id, state);
                    this.options.unsavedChangeCount = 0;
                },

                load: function () {

                    var serialized = this.storage.getItem(this.id);

                    if (serialized) {
                        if (angular.isObject(serialized) && angular.isFunction(serialized.then)) {
                            this._handleAsyncLoad(serialized);
                        } else {
                            this._handleSyncLoad(serialized);
                        }
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

                    angular.forEach(this.defaultGroupLayouts.groups, function (group) {
                        self.add(angular.extend(_.clone(defaults), group));
                    });

                    self.layoutStates = angular.extend(self.layoutStates, self.defaultGroupLayouts.layoutStates);
                },

                _serializeGroups: function () {
                    var result = {
                        groups: []
                    };
                    angular.forEach(this.groups, function (l) {
                        var group = {
                            groupTitle: l.groupTitle,
                            id: l.id,
                            locked: l.locked,
                            layoutGroups: []
                        };
                        angular.forEach(l.layoutGroups, function (layoutGroup) {
                            var layoutGroup = {
                                layoutGroupTitle: layoutGroup.layoutGroupTitle,
                                active: layoutGroup.active
                            };

                            group.layoutGroups.push(layoutGroup);
                        });

                        result.groups.push(group);
                    });
                    return result;
                },

                _handleSyncLoad: function (serialized) {

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
                    this.layoutStates = deserialized.layoutStates;
                    this.add(deserialized.groups);
                },

                _handleAsyncLoad: function (promise) {
                    var self = this;
                    promise.then(
                        angular.bind(self, this._handleSyncLoad),
                        angular.bind(self, this._addDefaultGroupLayouts)
                    );
                },

                _getGroupId: function (group) {
                    if (group.id) {
                        return group.id;
                    }
                    var max = 0;
                    for (var i = 0; i < this.groups.length; i++) {
                        var id = this.groups[i].id;
                        max = Math.max(max, id * 1);
                    }
                    return max + 1;
                },

                _getLayoutGroupId: function (layoutGroup) {
                    if (layoutGroup.id) {
                        return layoutGroup.id;
                    }
                    var max = 0;
                    for (var i = 0; i < this.groups.length; i++) {
                        var group = this.groups[i];
                        for (var j = 0; j < group.layoutGroups.length; j++) {
                            var id = group.layoutGroups[j].id;
                            max = Math.max(max, id * 1);
                        }
                    }
                    return max + 1;
                }
            };

            return DashboardStorage;
        }
    ]);