/**
 * Created by eibel on 27.10.2014.
 */

'use strict';

angular.module('ui.dashboard')
    .directive('dashboardGroupedLayouts', [
        'DashboardStorage', '$timeout', function (DashboardStorage, $timeout) {
            return {
                scope: true,
                templateUrl: function (element, attr) {
                    return attr.templateUrl ? attr.templateUrl : 'template/dashboard-grouped-layouts.html';
                },
                link: function (scope, element, attrs) {
                    scope.options = scope.$eval(attrs.dashboardLayouts);

                    var dashboardStorage = new DashboardStorage(scope.groupOptions);

                    scope.groups = dashboardStorage.groups;

                    scope.editTitle = function (group) {
                        if (group.locked) {
                            return;
                        }

                        var input = element.find('input[data-layout="' + group.id + '"]');
                        group.editingTitle = true;

                        $timeout(function () {
//                            input.focus()[0].setSelectionRange(0, 9999);
                        });
                    };

                    scope.saveTitleEdit = function (group) {
                        group.editingTitle = false;

                        dashboardStorage.save();
                    };

                    scope.createNewGroup = function(){
                        var group = {groupTitle: 'Custom Group', layoutGroups: []};
                        dashboardStorage.add(group);
                        dashboardStorage.save();

                        return group;
                    };

                    scope.removeGroup = function(group){
                        dashboardStorage.remove(group);
                        dashboardStorage.save();
                    };

                    scope.createNewLayoutGroup = function (group) {
                        var layoutGroup = {layoutGroupTitle: 'Custom Layout Group', layoutCollections: []};
                        dashboardStorage.addLayoutGroup(group, layoutGroup);
                        dashboardStorage.save();

                        return layoutGroup;
                    }

                    scope.removeLayoutGroup = function(layoutGroup){
                        dashboardStorage.removeLayoutGroup(layoutGroup);
                        dashboardStorage.save();
                    }
                }
            };
        }
    ]
);