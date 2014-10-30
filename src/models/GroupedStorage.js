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
        this.settingsModalOptions = options.settingsModalOptions; // not red?
        this.onSettingsClose = options.onSettingsClose; // not red?
        this.onSettingsDismiss = options.onSettingsDismiss; // not red?
        this.options = options;
        this.options.unsavedChangeCount = 0;

        this.groups = [];
        this.states = {};

        this.load();
      }

      GroupedStorage.prototype = {
        load: function(){
          this._addDefaultGroups();
        },

        add: function(group){
          if (group) {
            var self = this;

            var defaults = {
              groupTitle: 'Custom Group',
              layoutGroups: []
            };

            angular.extend(defaults, group);
            angular.extend(group, defaults);

            group.id = self._getGroupId(group);

            self.groups.push(group);
          }
        },

        remove: function(group) {
          var index = this.groups.indexOf(group);

          if (index >= 0 && (angular.isUndefined(group.layoutGroups) || group.layoutGroups.length === 0)) {
            this.groups.splice(index, 1);
          }
        },

        addLayoutGroup: function(group, layoutGroup){
          if (group && layoutGroup) {
            var self = this;

            if (self.groups.indexOf(group) === -1) {
              return;
            }

            var defaults = {
              layoutGroupTitle: 'Custom Layout Group',
              layouts: []
            };

            angular.extend(defaults, layoutGroup);
            angular.extend(layoutGroup, defaults);

            layoutGroup.id = self._getLayoutGroupId(layoutGroup);

            group.layoutGroups.push(layoutGroup);
          }
        },

        removeLayoutGroup: function(layoutGroup){
          angular.forEach(this.groups, function (group) {
            var index = group.layoutGroups.indexOf(layoutGroup);

            if (index >= 0 && (angular.isUndefined(layoutGroup.layouts) || layoutGroup.layouts.length === 0)) {
              group.layoutGroups.splice(index, 1);
              return;
            }
          });
        },

        addLayout: function(layoutGroup, layouts){
          if (!angular.isArray(layouts)) {
            layouts = [layouts];
          }

          var self = this;

          angular.forEach(layouts, function(layout){
            layout.dashboard = layout.dashboard || {};
            layout.dashboard.storage = self;
            layout.dashboard.storageId = layout.id = self._getLayoutId(layout);
            layout.dashboard.widgetDefinitions = self.widgetDefinitions;
            layout.dashboard.stringifyStorage = false;
            layout.dashboard.defaultWidgets = layout.defaultWidgets || self.defaultWidgets;
            layout.dashboard.widgetButtons = self.widgetButtons;
            layout.dashboard.explicitSave = self.explicitSave;
            layoutGroup.layouts.push(layout);
          });
        },

        save: function(){
          var state = {
            layouts: this._serializeGroups(),
            states: this.states,
            storageHash: this.storageHash
          };

          if(this.stringifyStorage){
            state = JSON.stringify(state);
          }

          this.storage.setItem(this.id, state);
        },

        setItem: function(id, value) {
          this.states[id] = value;
          this.save();
        },

        getItem: function(id) {
          return this.states[id];
        },

        removeItem: function(id) {
          delete this.states[id];
          this.save();
        },

        _addDefaultGroups: function(){
          var self = this;

          angular.forEach(this.defaultGroupLayouts.groups, function(group){
            self.add(group);
          });
        },

        _serializeGroups: function(){
          var result = [];

          angular.forEach(this.groups, function(g){
            var group = {
              layoutGroups: []
            };

            angular.forEach(g.layoutGroups, function(lg){
              var layoutGroup = {
                layouts: []
              };

              angular.forEach(lg.layouts, function(l){
                var layout = {

                };
                layoutGroup.layouts.push(layout);
              });

              group.layoutGroups.push(layoutGroup);
            });

            result.push(group);
          });

          return result;
        },

        _getGroupId: function (group) {
          if (group.id) {
            return group.id;
          }

          var max = 0;
          angular.forEach(this.groups, function(g){
            max = Math.max(max, g.id * 1);
          });

          return max + 1;
        },

        _getLayoutGroupId: function(layoutGroup){
          if (layoutGroup.id) {
            return layoutGroup.id;
          }

          var max = 0;
          angular.forEach(this.groups, function(g){
            angular.forEach(g.layoutGroups, function(lg){
              max = Math.max(max, lg.id * 1);
            });
          });

          return max + 1;
        },

        _getLayoutId: function(layout){
          if (layout.id){
            return layout.id;
          }

          var max = 0;
          angular.forEach(this.groups, function(g){
            angular.forEach(g.layoutGroups, function(lg){
              angular.forEach(lg.layouts, function(l){
                max = Math.max(max, l.id * 1);
              })
            });
          });

          return max + 1;
        }
      };

      return GroupedStorage;
    }
  ]);