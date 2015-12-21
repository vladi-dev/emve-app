'use strict';

angular.module('emve', ['ionic','ngCordova',  'emve.controllers', 'emve.services', 'flash', 'leaflet-directive', 'angular-stripe'])
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

            $rootScope.$on('http_error:400', function (event, response) {
                $ionicPopup.alert({
                    title: "Error occured",
                    template: response.data.error,
                    buttons: [{
                        text: 'OK',
                        type: 'button-clear'
                    }]
                });
            });

            $rootScope.$on('http_error:422', function (event, response) {
                var template = '<ul>';
                angular.forEach(response.data.errors, function (value, key) {
                    template += '<li>* ' + value + '</li>';
                });
                template += '</ul>';

                $ionicPopup.alert({
                    title: 'Error',
                    template: template,
                    buttons: [{
                        text: 'OK',
                        type: 'button-clear'
                    }]
                });
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

            // Listen to GCM notifications
            $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
                console.log('Notification Received', 'test')
                console.log(event);
                console.log(notification);
                switch(notification.event) {
                    case 'registered':
                        if (notification.regid.length > 0 ) {
                            // Send regid to backend
                            console.log('registration ID = ' + notification.regid);
                            console.log(notification.regid)
                        }
                        break;

                    case 'message':
                        // this is the actual push notification. its format depends on the data model from the push server
                        console.log('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
                        break;

                    case 'error':
                        console.log('GCM error = ' + notification.msg);
                        break;

                    default:
                        console.log('An unknown GCM event has occurred');
                        break;
                }
            });
        });
    })
    .config(function ($ionicConfigProvider, $stateProvider, $urlRouterProvider, $httpProvider, stripeProvider) {
        $ionicConfigProvider.templates.maxPrefetch(0);
        $ionicConfigProvider.views.maxCache(0);
        $ionicConfigProvider.views.transition('none');
        $ionicConfigProvider.tabs.position('bottom');
        $httpProvider.interceptors.push('authInterceptor');
        $urlRouterProvider.otherwise('/');

        stripeProvider.setPublishableKey("pk_test_VBIBc0OTGN2VCOkUJG2O9pmT");
    })
    .constant('API_URL', 'http://emve.dev:5000/api')
    .constant('WEBSOCKET_URL', 'ws://emve.dev:5000/websocket')

//    .constant('API_URL', 'http://emvela.com/api')
//    .constant('WEBSOCKET_URL', 'ws://emvela.com/websocket')
    .constant('GCM_SENDER_ID', "460063649586")
;
