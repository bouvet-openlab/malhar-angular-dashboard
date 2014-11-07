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
          var defaultTemplate = attr.isReadonly === 'true' ? 'template/grouped-layouts-readonly.html' : 'template/grouped-layouts.html';

          return attr.templateUrl ? attr.templateUrl : defaultTemplate;
        },
        link: function (scope, element, attrs) {
          scope.options = scope.$eval(attrs.groupedLayouts);

          scope.options.isReadonly = attrs.isReadonly === 'true';

          scope.groupedStorage = new GroupedStorage(scope.options);

          scope.groups = scope.groupedStorage.groups;
          scope.explicitSave = scope.groupedStorage.explicitSave;

          scope.bindHomeLayout = function () {
            scope.homeLayout = scope.groupedStorage.homeLayout;
          };

          scope.bindHomeLayout();

          scope.$watch('groupedStorage.homeLayout', function() {
            scope.bindHomeLayout();
          });

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

            scope.groupedStorage.save();
          };

          scope.createGroup = function () {
            var group = {groupTitle: 'Custom group'};

            scope.groupedStorage.add(group);
            scope.groupedStorage.save();

            return group;
          };

          scope.removeGroup = function (group) {
            scope.groupedStorage.remove(group);
            scope.groupedStorage.save();
          };

          scope.createLayoutGroup = function (group) {
            var layoutGroup = {layoutGroupTitle: 'Custom layout group'};

            scope.groupedStorage.addLayoutGroup(group, layoutGroup);
            scope.groupedStorage.save();

            return layoutGroup;
          };

          scope.removeLayoutGroup = function (layoutGroup) {
            scope.groupedStorage.removeLayoutGroup(layoutGroup);
            scope.groupedStorage.save();
          };

          scope.createLayout = function (layoutGroup) {
            var layout = {title: 'Custom', active: true}; // TODO Add layout or make active should handle

            scope.groupedStorage.addLayout(layoutGroup, layout);
            scope.groupedStorage.save();

            scope._makeLayoutActive(layout);

            return layout;
          };

          scope.removeLayout = function (layout) {
            scope.groupedStorage.removeLayout(layout);
            scope.groupedStorage.save();
          };

          scope.createHomeLayout = function () {
            var layout = {title: 'Home', active: true};

            scope.groupedStorage.addHomeLayout(layout);
            scope.groupedStorage.save();

            scope.bindHomeLayout();

            scope._makeLayoutActive(layout);

            return layout;
          };

          scope.removeHomeLayout = function () {
            scope.groupedStorage.removeHomeLayout();
            scope.groupedStorage.save();

            scope.bindHomeLayout();
          };

          scope.saveToStorage = function () {
            scope.groupedStorage.saveToStorage();
          };

          scope.makeLayoutActive = function (layout) {
            var current = scope.groupedStorage.getActiveLayout();

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
            scope.groupedStorage._ensureActiveLayout();
            scope.groupedStorage.save();
          };

          scope.options.addWidget = function () {
            var layout = scope.groupedStorage.getActiveLayout();
            if (layout) {
              layout.dashboard.addWidget.apply(layout.dashboard, arguments);
            }
          };

          scope.options.loadWidgets = function () {
            var layout = scope.groupedStorage.getActiveLayout();
            if (layout) {
              layout.dashboard.loadWidgets.apply(layout.dashboard, arguments);
            }
          };

          scope.options.saveDashboard = function () {
            var layout = scope.groupedStorage.getActiveLayout();
            if (layout) {
              layout.dashboard.saveDashboard.apply(layout.dashboard, arguments);
            }
          };
        }
      };
    }
  ]);