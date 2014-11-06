/**
 * Created by EIBEL on 06.11.2014.
 */
'use strict';

angular.module('app').controller('GroupedLayoutsHomeReadonlyDemoCtrl',
  function ($scope, $interval, $window, widgetDefinitions, defaultWidgets) {

    $scope.groupOptions = {
      widgetButtons: true,
      storageId: 'demo-grouped-layouts-home-readonly',
      storage: $window.localStorage,
      storageHash: 'fs4df4d51',
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      lockDefaultLayouts: true,
      explicitSave: true,
      defaultGroupLayouts: {
        home: {title: 'Start', id: 1},
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

    $scope.readonly = true;

    $scope.toggle = function(val){
      $scope.readonly = val;
    };
  }
);