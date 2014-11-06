/**
 * Created by EIBEL on 30.10.2014.
 */

'use strict';

angular.module('ui.dashboard')
  .directive('groupedLayouts', [
    'GroupedStorage', '$timeout', '$modal', function (GroupedStorage, $timeout, $modal) {
      return {
        scope: true,
        templateUrl: function (element, attr) {
          return attr.templateUrl ? attr.templateUrl : 'template/grouped-layouts.html';
        },
        link: function (scope, element, attrs) {
          scope.options = scope.$eval(attrs.groupedLayouts);

          var groupedStorage = new GroupedStorage(scope.options);

          scope.groups = groupedStorage.groups;

          scope.bindHomeLayout = function(){
            scope.homeLayout = groupedStorage.homeLayout;
          };

          scope.bindHomeLayout();

          scope.getAllLayouts = function () {
            var layouts = [];

            if (scope.homeLayout) {
              layouts.push(scope.homeLayout);
            }

            angular.forEach(scope.groups, function (group) {
              angular.forEach(group.layoutGroups, function (layoutGroup) {
                angular.forEach(layoutGroup.layouts, function (layout) {
                  layouts.push(layout);
                });
              });
            });

            return layouts;
          };

          scope.editTitle = function (objectToEdit, selector) {
            objectToEdit.editingTitle = true;

            var input = element.find('input[name="' + selector + '"]');

            $timeout(function () {
              input.focus()[0].setSelectionRange(0, 9999);
            });
          };

          scope.saveTitleEdit = function (objectEdited) {
            objectEdited.editingTitle = false;

            groupedStorage.save();
          };

          scope.createGroup = function () {
            var group = {groupTitle: 'Custom group'};

            groupedStorage.add(group);
            groupedStorage.save();

            return group;
          };

          scope.removeGroup = function (group) {
            groupedStorage.remove(group);
            groupedStorage.save();
          };

          scope.createLayoutGroup = function (group) {
            var layoutGroup = {layoutGroupTitle: 'Custom layout group'};

            groupedStorage.addLayoutGroup(group, layoutGroup);
            groupedStorage.save();

            return layoutGroup;
          };

          scope.removeLayoutGroup = function (layoutGroup) {
            groupedStorage.removeLayoutGroup(layoutGroup);
            groupedStorage.save();
          };

          scope.createLayout = function (layoutGroup) {
            var layout = {title: 'Custom', active: true}; // TODO Add layout or make active should handle

            groupedStorage.addLayout(layoutGroup, layout);
            groupedStorage.save();

            scope._makeLayoutActive(layout);

            return layout;
          };

          scope.removeLayout = function (layout) {
            groupedStorage.removeLayout(layout);
            groupedStorage.save();
          };

          scope.createHomeLayout = function(){
            var layout = {title: 'Home', active: true};

            groupedStorage.addHomeLayout(layout);
            groupedStorage.save();

            scope.bindHomeLayout();

            scope._makeLayoutActive(layout);

            return layout;
          };

          scope.removeHomeLayout = function(){
            groupedStorage.removeHomeLayout();
            groupedStorage.save();

            scope.bindHomeLayout();
          };

          scope.makeLayoutActive = function (layout) {
            var current = groupedStorage.getActiveLayout();

            if (current && current.dashboard.unsavedChangeCount) {
              var modalInstance = $modal.open({
                templateUrl: 'template/save-changes-modal.html',
                resolve: {
                  layout: function () {
                    return layout;
                  }
                },
                controller: 'SaveChangesModalCtrl'
              });

              // Set resolve and reject callbacks for the result promise
              modalInstance.result.then(
                function () {
                  current.dashboard.saveDashboard();
                  scope._makeLayoutActive(layout);
                },
                function () {
                  scope._makeLayoutActive(layout);
                }
              );
            } else {
              scope._makeLayoutActive(layout);
            }
          };

          scope._makeLayoutActive = function (layout) {
            angular.forEach(scope.getAllLayouts(), function (l) {
              if (l !== layout) {
                l.active = false;
              } else {
                l.active = true;
              }
            });
            groupedStorage._ensureActiveLayout();
            groupedStorage.save();
          };

          scope.options.addWidget = function () {
            var layout = groupedStorage.getActiveLayout();
            if (layout) {
              layout.dashboard.addWidget.apply(layout.dashboard, arguments);
            }
          };

          scope.options.loadWidgets = function () {
            var layout = groupedStorage.getActiveLayout();
            if (layout) {
              layout.dashboard.loadWidgets.apply(layout.dashboard, arguments);
            }
          };

          scope.options.saveDashboard = function () {
            var layout = groupedStorage.getActiveLayout();
            if (layout) {
              layout.dashboard.saveDashboard.apply(layout.dashboard, arguments);
            }
          };
        }
      };
    }
  ]);