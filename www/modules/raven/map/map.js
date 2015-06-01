'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider.state('raven.map', {
            url: "/map",
            views: {
                'menuContent': {
                    templateUrl: "modules/raven/map/map.html",
                    controller: "RavenMapCtrl"
                }
            }
        });
    })
;

angular.module('emve.controllers')
    .controller('RavenMapCtrl', function ($rootScope, $scope, $ionicPopup, leafletData, RecentPosition) {
        // Make default marker show ravens recent position
        // Need when his position isn't changing
        // thus 'raven_map' event doesn't trigger
        var markers = {}, center = {};
        var position = RecentPosition.get();
        if (position) {
            center = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                zoom: 17
            };
            markers[0] = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                message: 'You'
            };
        }

        // Init map
        angular.extend($scope, {
            center: center,
            defaults: {
                tileLayer: "https://{s}.tiles.mapbox.com/v4/emve-dev.l8pjd86f/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZW12ZS1kZXYiLCJhIjoiNWo4dEVUWSJ9._AFAtSxwrUNknqpVkzdYZw",
                tileLayerOptions: {
                    attribution: 'MapBox'
                }
            },
            markers: markers
        });


        // When map is loaded
        // Listen to 'raven_map' event (raven/app module)
        // to show current ravenorter position
        // and center map once
        var centered = false;
        leafletData.getMap('raven_map').then(function (map) {
            console.log('map get map');
            $scope.offRavenPos = $rootScope.$on('raven_pos', function (event, position) {
                $scope.markers[0] = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    message: 'You'
                };

                if (!centered) {
                    centered = true;
                    $scope.center = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        zoom: 17
                    };
                }
            });
        });

        $scope.$on('$destroy', function () {
            leafletData.unresolveMap('raven_map');

            if (typeof $scope.offRavenPos === 'function') {
                $scope.offRavenPos();
                $scope.offRavenPos = null;
            }

            angular.extend($scope, {
                center: null,
                defaults: null,
                markers: null,
                order: null,
                position: null
            });
        });
    })
;
