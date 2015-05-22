'use strict';

angular.module('emve', ['ionic', 'ngCordova', 'emve.controllers', 'emve.services', 'flash', 'uiGmapgoogle-maps', 'leaflet-directive'])
    .run(function ($ionicPlatform, $rootScope, $state, $window, $stateParams, $ionicLoading, WebsocketService, $ionicPopup, $cordovaNetwork) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }

            $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                $ionicLoading.show({
                    template: '<ion-spinner icon="ripple"></ion-spinner><br>Searching for internet connection...'
                });
            });

            $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                $ionicLoading.hide();
            });

            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            // Loading
            $rootScope.$on('loading:show', function () {
                $ionicLoading.show({template: '<ion-spinner icon="ripple"></ion-spinner><br>Loading...'});
            });

            $rootScope.$on('loading:hide', function () {
                $ionicLoading.hide();
            });

            $rootScope.enableBackButton = false;

            $rootScope.$on('websocket:start', function () {
                // Start websocket communication
                WebsocketService.start();
            });

            $rootScope.$on('websocket:close', function () {
                // Close websocket communication
                WebsocketService.close();
            });

            $rootScope.$emit('websocket:start');
        });
    })
    .config(function ($ionicConfigProvider, $stateProvider, $urlRouterProvider, $httpProvider) {
        $ionicConfigProvider.templates.maxPrefetch(0);
        $ionicConfigProvider.views.maxCache(0);
        $ionicConfigProvider.views.transition('none');
        $ionicConfigProvider.tabs.position('bottom');
        $httpProvider.interceptors.push('authInterceptor');
        $urlRouterProvider.otherwise('/');
    })
    .constant('API_URL', 'http://emve.dev:5000/api')
    .constant('WEBSOCKET_URL', 'ws://emve.dev:5000/websocket')

    //.constant('API_URL', 'http://emvela.com/api')
    //.constant('WEBSOCKET_URL', 'ws://emvela.com/websocket')
;
