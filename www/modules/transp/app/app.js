'use strict';

angular.module('emve')
    .config(function ($stateProvider) {
        $stateProvider
            .state('transp', {
                url: "/transp",
                abstract: true,
                templateUrl: "modules/transp/app/menu.html",
                controller: 'TranspAppCtrl'
            });
    })
;

angular.module('emve.controllers')
    .controller('TranspAppCtrl', function ($rootScope, $scope, $window, CurrentUser, TranspOrders, WebsocketService, RecentPosition) {
        CurrentUser.get({}, function (u) {
            $scope.name = u.first_name + ' ' + u.middle_name + ' ' + u.last_name;
        });

        TranspOrders.get({'view': 'accepted'}, function (data) {
            $scope.curr_order = null;
            if (data['orders'].length > 0) {
                $scope.curr_order = data['orders'][0];
            }
        });

        $rootScope.$on('transp_order_accepted', function (event, data) {
            $scope.curr_order = data.order;
        });

        $rootScope.$on('transp_order_completed', function (event, data) {
            $scope.curr_order = null;
        });

        var socket = WebsocketService.getSocket();

        // Watching transporters position
        // Sending position coords to backend and broadcasting it in all modules
        navigator.geolocation.watchPosition(function (position) {
            // Broadcast to modules with map
            $rootScope.$broadcast('transp_pos', position);

            // Save position as recent for use in modules with map
            RecentPosition.set(position);

            // TODO: maybe change structure of pos, for easy marker creation on map
            var msg = {
                'event': 'track',
                'pos': {'latitude': position.coords.latitude, 'longitude': position.coords.longitude}
            };

            // Sending position coords to backend via WS
            // If socket is OPEN
            if (socket && socket.readyState == 1) {
                console.log('Socket open, sending coords... ' + JSON.stringify(msg));
                socket.send(JSON.stringify(msg));
            }
        }, function (error) {
            console.log(error);
            $ionicPopup.alert({
                title: error.message,
                template: 'ERROR CODE: ' + error.code
            });
        }, {
            enableHighAccuracy: true
        });


        //if (window.plugins.backgroundGeoLocation) {
        //    var bgGeo = window.plugins.backgroundGeoLocation;
        //
        //    /**
        //     * This callback will be executed every time a geolocation is recorded in the background.
        //     */
        //    var callbackFn = function(location) {
        //        console.log('[js] BackgroundGeoLocation callback:  ' + location.latitudue + ',' + location.longitude);
        //        // Do your HTTP request here to POST location to your server.
        //        //
        //        //
        //        var p = {'latitude': 44, 'longitude': -111};
        //        websocket.send(JSON.stringify(p));
        //        bgGeo.finish();
        //    };
        //
        //    var failureFn = function(error) {
        //        console.log('BackgroundGeoLocation error');
        //    }
        //
        //    bgGeo.configure(callbackFn, failureFn, {
        //        url: 'http://emvela.com/android_ajax', // <-- only required for Android; ios allows javascript callbacks for your http
        //        params: {                                               // HTTP POST params sent to your server when persisting locations.
        //        },
        //        desiredAccuracy: 10,
        //        stationaryRadius: 20,
        //        distanceFilter: 30,
        //        notificationTitle: 'Background tracking',   // <-- android only, customize the title of the notification
        //        notificationText: 'ENABLED',                // <-- android only, customize the text of the notification
        //        activityType: "AutomotiveNavigation",       // <-- iOS-only
        //        debug: true     // <-- enable this hear sounds for background-geolocation life-cycle.
        //    });
        //
        //    // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
        //    console.log('bg start');
        //    bgGeo.start();
        //}
    })
;
