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
          storage: noopStorage
        };

        angular.extend(defaults, options);
        angular.extend(options, defaults);

        this.storage = options.storage;
        this.id = options.storageId;
        this.defaultGroupLayouts = options.defaultGroupLayouts;

        this.groups = [];

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

        save: function(){
          var state = JSON.stringify( this.groups);

          this.storage.setItem(this.id, state);
        },

        _addDefaultGroups: function(){
          var self = this;

          angular.forEach(this.defaultGroupLayouts.groups, function(group){
            self.add(group);
          });
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
        }
      };

      return GroupedStorage;
    }
  ]);