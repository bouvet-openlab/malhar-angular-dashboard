/**
 * Created by eibel on 27.10.2014.
 */

'use strict';

angular.module('ui.dashboard')
    .directive('dashboardGroupedLayouts', [
        'DashboardStorage', function (DashboardStorage) {
            return {
                scope: true,
                templateUrl: function (element, attr) {
                    return attr.templateUrl ? attr.templateUrl : 'template/dashboard-grouped-layouts.html';
                },
                link: function (scope, element, attrs) {

                    scope.options = scope.$eval(attrs.dashboardLayouts);

                    var dashboardStorage = new DashboardStorage(scope.options);

                    scope.groups = dashboardStorage.groups;
                }
            };
        }
    ]
);