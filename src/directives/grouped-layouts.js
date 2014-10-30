/**
 * Created by EIBEL on 30.10.2014.
 */

'use strict';

angular.module('ui.dashboard')
  .directive('groupedLayouts', [
    'GroupedStorage', '$timeout', function(GroupedStorage, $timeout){
      return {
        scope: true,
        templateUrl: function (element, attr) {
          return attr.templateUrl ? attr.templateUrl : 'template/grouped-layouts.html';
        },
        link: function (scope, element, attrs) {
          scope.options = scope.$eval(attrs.groupedLayouts);

          var groupedStorage = new GroupedStorage(scope.options);

          scope.groups = groupedStorage.groups;

          scope.editTitle = function(objectToEdit, selector){
            objectToEdit.editingTitle = true;

            var input = element.find('input[name="' + selector + '"]');

            $timeout(function(){
              input.focus()[0].setSelectionRange(0, 9999);
            });
          };

          scope.saveTitleEdit = function(objectEdited){
            objectEdited.editingTitle = false;

            groupedStorage.save();
          };

          scope.createGroup = function(){
            var group = {groupTitle: 'Custom group'};

            groupedStorage.add(group);
            groupedStorage.save();

            return group;
          };

          scope.removeGroup = function(group){
            groupedStorage.remove(group);
            groupedStorage.save();
          };

          scope.createLayoutGroup = function(group){
            var layoutGroup = {layoutGroupTitle: 'Custom layout group'};

            groupedStorage.addLayoutGroup(group, layoutGroup);
            groupedStorage.save();

            return layoutGroup;
          };

          scope.removeLayoutGroup = function(layoutGroup){
            groupedStorage.removeLayoutGroup(layoutGroup);
            groupedStorage.save();
          };

          scope.createLayout = function(layoutGroup){
            var layout = {title: 'Custom'};

            groupedStorage.addLayout(layoutGroup, layout);
            groupedStorage.save();

            return layout;
          };
        }
      };
    }
  ]);