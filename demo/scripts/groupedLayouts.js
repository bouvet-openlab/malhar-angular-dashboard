/**
 * Created by eibel on 24.10.2014.
 */

'use strict';

angular.module('app').controller('GroupedLayoutsDemoCtrl',
    function ($scope, $interval, $window, widgetDefinitions, defaultWidgets) {
        //console.log($scope)

        $scope.groupOptions = {
            storageId: 'demo-grouped-layouts',
            storage: localStorage,
            storageHash: 'fs4df4d51',
            widgetDefinitions: widgetDefinitions,
            defaultWidgets: defaultWidgets,
            lockDefaultLayouts: true,
            defaultLayoutGroups: {
                groups: [
                    {
                        groupTitle: 'Group 1',
                        layoutGroups: [
//                            { title: 'Layout collection 1',
//                                groupCollections: [
//                                    { title: 'Collection 1',
//                                        layouts: [
//                                            { title: 'Layout 1', active: true, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 2', active: false, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 3', active: false, defaultWidgets: defaultWidgets, locked: false }
//                                        ]},
//                                    { title: 'Collection 2',
//                                        layouts: [
//                                            { title: 'Layout 4', active: true, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 5', active: false, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 6', active: false, defaultWidgets: defaultWidgets, locked: false }
//                                        ]}
//                                ]},
//                            { title: 'Layout collection 2',
//                                groupCollections: [
//                                    { title: 'Collection 3',
//                                        layouts: [
//                                            { title: 'Layout 7', active: true, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 8', active: false, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 9', active: false, defaultWidgets: defaultWidgets, locked: false }
//                                        ]},
//                                    { title: 'Collection 4',
//                                        layouts: [
//                                            { title: 'Layout 10', active: true, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 11', active: false, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 12', active: false, defaultWidgets: defaultWidgets, locked: false }
//                                        ]}
//                                ]}
                        ]
                    },
                    {
                        groupTitle: 'Group 2',
                        layoutGroups: [
//                            { title: 'Layout collection 3',
//                                groupCollections: [
//                                    { title: 'Collection 5',
//                                        layouts: [
//                                            { title: 'Layout 13', active: true, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 14', active: false, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 15', active: false, defaultWidgets: defaultWidgets, locked: false }
//                                        ]},
//                                    { title: 'Collection 6',
//                                        layouts: [
//                                            { title: 'Layout 16', active: true, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 17', active: false, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 18', active: false, defaultWidgets: defaultWidgets, locked: false }
//                                        ]}
//                                ]},
//                            { title: 'Layout collection 4',
//                                groupCollections: [
//                                    { title: 'Collection 7',
//                                        layouts: [
//                                            { title: 'Layout 19', active: true, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 20', active: false, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 21', active: false, defaultWidgets: defaultWidgets, locked: false }
//                                        ]},
//                                    { title: 'Collection 8',
//                                        layouts: [
//                                            { title: 'Layout 22', active: true, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 23', active: false, defaultWidgets: defaultWidgets },
//                                            { title: 'Layout 24', active: false, defaultWidgets: defaultWidgets, locked: false }
//                                        ]}
//                                ]}
                        ]
                    }
                ]
            }};

        $scope.randomValue = Math.random();
        $interval(function () {
            $scope.randomValue = Math.random();
        }, 500);
    }
)
;