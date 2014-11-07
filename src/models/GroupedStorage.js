/**
 * Created by EIBEL on 30.10.2014.
 */
'use strict';


angular.module('ui.dashboard')
  .factory('GroupedStorage', [
    function () {
      var noopStorage = {
        setItem: function () {

        },
        getItem: function () {

        },
        removeItem: function () {

        }
      };

      function GroupedStorage(options) {
        var defaults = {
          storage: noopStorage,
          storageHash: '',
          stringifyStorage: true
        };

        angular.extend(defaults, options);
        angular.extend(options, defaults);

        this.id = options.storageId;
        this.storage = options.storage;
        this.storageHash = options.storageHash;
        this.stringifyStorage = options.stringifyStorage;
        this.widgetDefinitions = options.widgetDefinitions;
        this.defaultLayouts = options.defaultLayouts;
        this.widgetButtons = options.widgetButtons;
        this.explicitSave = options.explicitSave;
        this.defaultGroupLayouts = options.defaultGroupLayouts;
        this.defaultWidgets = options.defaultWidgets;
        this.isReadonly = options.isReadonly;
        this.settingsModalOptions = options.settingsModalOptions; // not red?
        this.onSettingsClose = options.onSettingsClose; // not red?
        this.onSettingsDismiss = options.onSettingsDismiss; // not red?
        this.options = options;
        this.options.unsavedChangeCount = 0;

        this.groups = [];
        this.states = {};

        this.load();
        this._ensureActiveLayout();
      }

      GroupedStorage.prototype = {
        load: function () {
          var serialized = this.storage.getItem(this.id);

          this.clear();

          if (serialized) {
            // check for promise
            if (angular.isObject(serialized) && angular.isFunction(serialized.then)) {
              this._handleAsyncLoad(serialized);
            } else {
              this._handleSyncLoad(serialized);
            }
          }
          else {
            this._addDefaultGroups();
          }
        },

        getActiveLayout: function () {
          if (this.homeLayout && this.homeLayout.active) {
            return this.homeLayout;
          }

          for (var i = 0; i < this.groups.length; i++) {
            var group = this.groups[i];
            for (var j = 0; j < group.layoutGroups.length; j++) {
              var layoutGroup = group.layoutGroups[j];
              for (var k = 0; k < layoutGroup.layouts.length; k++) {
                var layout = layoutGroup.layouts[k];

                if (layout.active) {
                  return layout;
                }
              }
            }
          }

          return false;
        },

        add: function (groups) {
          if (groups) {
            if (!angular.isArray(groups)) {
              groups = [groups];
            }

            var self = this;

            angular.forEach(groups, function (group) {

              var defaults = {
                groupTitle: 'Custom Group',
                layoutGroups: []
              };

              var layoutGroups = group.layoutGroups;

              delete group.layoutGroups;

              angular.extend(defaults, group);
              angular.extend(group, defaults);

              group.id = self._getGroupId(group);

              self.groups.push(group);

              self.addLayoutGroup(group, layoutGroups);
            });
          }
        },

        remove: function (group) {
          var index = this.groups.indexOf(group);

          if (index >= 0 && (angular.isUndefined(group.layoutGroups) || group.layoutGroups.length === 0)) {
            this.groups.splice(index, 1);
          }
        },

        addLayoutGroup: function (group, layoutGroups) {
          if (group && layoutGroups) {
            if (!angular.isArray(layoutGroups)) {
              layoutGroups = [layoutGroups];
            }

            var self = this;

            if (self.groups.indexOf(group) === -1) {
              return;
            }

            angular.forEach(layoutGroups, function (layoutGroup) {
              var defaults = {
                layoutGroupTitle: 'Custom Layout Group',
                layouts: []
              };

              var layouts = layoutGroup.layouts;

              delete layoutGroup.layouts;

              angular.extend(defaults, layoutGroup);
              angular.extend(layoutGroup, defaults);

              layoutGroup.id = self._getLayoutGroupId(layoutGroup);

              group.layoutGroups.push(layoutGroup);
              self.addLayout(layoutGroup, layouts);
            });

          }
        },

        removeLayoutGroup: function (layoutGroup) {
          angular.forEach(this.groups, function (group) {
            var index = group.layoutGroups.indexOf(layoutGroup);

            if (index >= 0 && (angular.isUndefined(layoutGroup.layouts) || layoutGroup.layouts.length === 0)) {
              group.layoutGroups.splice(index, 1);
              return;
            }
          });
        },

        addHomeLayout: function (homeLayout) {
          //console.log(homeLayout);

          if (!this.homeLayout && homeLayout) {
            homeLayout.dashboard = homeLayout.dashboard || {};
            homeLayout.dashboard.storage = this;
            homeLayout.dashboard.storageId = homeLayout.id = this._getLayoutId(homeLayout);
            homeLayout.dashboard.widgetDefinitions = this.widgetDefinitions;
            homeLayout.dashboard.stringifyStorage = false;
            homeLayout.dashboard.defaultWidgets = homeLayout.defaultWidgets || this.defaultWidgets;
            homeLayout.dashboard.widgetButtons = this.widgetButtons;
            homeLayout.dashboard.explicitSave = this.explicitSave;
            this.homeLayout = homeLayout;
          }
        },

        removeHomeLayout: function () {
          if (this.homeLayout) {
            delete this.states[this.homeLayout.id];
            delete this.homeLayout;
          }
        },

        addLayout: function (layoutGroup, layouts) {
          if (layouts) {
            if (!angular.isArray(layouts)) {
              layouts = [layouts];
            }

            var self = this;

            angular.forEach(layouts, function (layout) {
              layout.dashboard = layout.dashboard || {};
              layout.dashboard.storage = self;
              layout.dashboard.storageId = layout.id = self._getLayoutId(layout);
              layout.dashboard.widgetDefinitions = self.widgetDefinitions;
              layout.dashboard.stringifyStorage = false;
              layout.dashboard.defaultWidgets = layout.defaultWidgets || self.defaultWidgets;
              layout.dashboard.widgetButtons = self.widgetButtons;
              layout.dashboard.explicitSave = self.explicitSave;
              layoutGroup.layouts.push(layout);

              //this.states[layout.id] = {};
            });
          }
        },

        removeLayout: function (layout) {
          for (var i = 0; i < this.groups.length; i++) {
            var group = this.groups[i];
            for (var j = 0; j < group.layoutGroups.length; j++) {
              var layoutGroup = group.layoutGroups[j];

              var index = layoutGroup.layouts.indexOf(layout);

              if (index >= 0) {

                layoutGroup.layouts.splice(index, 1);
                delete this.states[layout.id];

                if (layout.active) {
                  if (layoutGroup.layouts.length > 0) {
                    if (index > 0) {
                      layoutGroup.layouts[index - 1].active = true;
                    } else {
                      layoutGroup.layouts[0].active = true;
                    }
                  }
                }

                this._ensureActiveLayout();

                return;
              }
            }
          }
        },

        save: function () {
          if (!this.isReadonly) {
            this.options.unsavedChangeCount++;

            if (!this.explicitSave) {
              this.saveToStorage();
            }
          }
        },

        saveToStorage: function () {
          var state = this._serializeGroups();

          state.states = this.states;
          state.storageHash = this.storageHash;

          if (this.stringifyStorage) {
            state = JSON.stringify(state);
          }

          this.storage.setItem(this.id, state);
          this.options.unsavedChangeCount = 0;
        },

        clear: function () {
          this.groups = [];
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

        _addDefaultGroups: function () {
          var self = this;

          angular.forEach(this.defaultGroupLayouts.groups, function (group) {
            self.add(_.clone(group));
          });

          this.addHomeLayout(this.defaultGroupLayouts.homeLayout);
        },

        _serializeGroups: function () {
          var result = {groups: [], homeLayout: undefined};

          if (this.homeLayout) {
            result.homeLayout = {
              id: this.homeLayout.id,
              title: this.homeLayout.title,
              active: this.homeLayout.active,
              locked: this.homeLayout.locked,
              defaultWidgets: this.homeLayout.dashboard.defaultWidgets
            };
          }

          angular.forEach(this.groups, function (g) {
            var group = {
              id: g.id,
              groupTitle: g.groupTitle,
              layoutGroups: []
            };

            angular.forEach(g.layoutGroups, function (lg) {
              var layoutGroup = {
                id: lg.id,
                layoutGroupTitle: lg.layoutGroupTitle,
                active: lg.active,
                layouts: []
              };

              angular.forEach(lg.layouts, function (l) {
                var layout = {
                  id: l.id,
                  title: l.title,
                  active: l.active,
                  locked: l.locked,
                  defaultWidgets: l.dashboard.defaultWidgets
                };
                layoutGroup.layouts.push(layout);
              });

              group.layoutGroups.push(layoutGroup);
            });

            result.groups.push(group);
          });

          return result;
        },

        _handleSyncLoad: function (serialized) {
          var self = this;

          var deserialized;

          if (this.stringifyStorage) {
            try {

              deserialized = JSON.parse(serialized);

            } catch (e) {
              this._addDefaultGroups();
              return;
            }
          } else {

            deserialized = serialized;

          }

          if (this.storageHash !== deserialized.storageHash) {
            this._addDefaultGroups();
            return;
          }

          if (deserialized.states) {
            this.states = deserialized.states;
          }
          self.add(deserialized.groups);
          self.addHomeLayout(deserialized.homeLayout);
        },

        _handleAsyncLoad: function (promise) {
          var self = this;
          promise.then(
            angular.bind(self, this._handleSyncLoad),
            angular.bind(self, this._addDefaultGroups)
          );
        },

        _ensureActiveLayout: function () {

          var foundLayout = false;
          var foundLayoutGroup = false;

          if (this.homeLayout && this.homeLayout.active) {
            foundLayout = true;
            foundLayoutGroup = true;
          }

          for (var i = 0; i < this.groups.length; i++) {
            var group = this.groups[i];
            for (var j = 0; j < group.layoutGroups.length; j++) {
              var layoutGroup = group.layoutGroups[j];
              for (var k = 0; k < layoutGroup.layouts.length; k++) {
                var layout = layoutGroup.layouts[k];

                if (layout.active) {
                  if (foundLayout) {
                    layout.active = false;
                  }
                  else {
                    layoutGroup.active = true;
                    foundLayout = true;
                  }
                }
              }

              if (layoutGroup.active) {
                if (foundLayoutGroup) {
                  layoutGroup.active = false;
                } else if (!foundLayout) {
                  layoutGroup.active = false;
                }
                else {
                  foundLayoutGroup = true;
                }
              }
            }
          }

          if (foundLayout) {
            return;
          }

          if (this.homeLayout) {
            this.homeLayout.active = true;
          } else if (this.groups[0]) {
            if (this.groups[0].layoutGroups[0]) {
              this.groups[0].layoutGroups[0].active = true;

              if (this.groups[0].layoutGroups[0].layouts[0]) {
                this.groups[0].layoutGroups[0].layouts[0].active = true;
              }
            }
          }
        },

        _getGroupId: function (group) {
          if (group.id) {
            return group.id;
          }

          var max = 0;
          angular.forEach(this.groups, function (g) {
            max = Math.max(max, g.id * 1);
          });

          return max + 1;
        },

        _getLayoutGroupId: function (layoutGroup) {
          if (layoutGroup.id) {
            return layoutGroup.id;
          }

          var max = 0;
          angular.forEach(this.groups, function (g) {
            angular.forEach(g.layoutGroups, function (lg) {
              max = Math.max(max, lg.id * 1);
            });
          });

          return max + 1;
        },

        _getLayoutId: function (layout) {
          if (layout.id) {
            return layout.id;
          }

          var max = 0;

          if (this.homeLayout) {
            max = Math.max(max, this.homeLayout.id * 1);
          }

          angular.forEach(this.groups, function (g) {
            angular.forEach(g.layoutGroups, function (lg) {
              angular.forEach(lg.layouts, function (l) {
                max = Math.max(max, l.id * 1);
              });
            });
          });

          return max + 1;
        }
      };

      return GroupedStorage;
    }
  ]);