/**
 * Created by eibel on 24.10.2014.
 */

'use strict';

angular.module('app').controller('GroupedLayoutsDemoCtrl',
  function ($scope, $interval, $window, widgetDefinitions, defaultWidgets) {

    $scope.groupOptions = {
      widgetButtons: true,
      storageId: 'demo-grouped-layouts',
      storage: $window.localStorage,
      storageHash: 'fs4df4d51',
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      lockDefaultLayouts: true,
      explicitSave: false,
      defaultGroupLayouts: {
        groups: [
          {
            id: 1,
            groupTitle: 'Group 1',
            layoutGroups: [
            ]
          },
          {
            id: 2,
            groupTitle: 'Group 2',
            layoutGroups: [
            ]
          }
        ]
      }};

    $scope.randomValue = Math.random();
    $interval(function () {
      $scope.randomValue = Math.random();
    }, 500);

    console.log($window.localStorage.getItem('demo-grouped-layouts'));
  }
);