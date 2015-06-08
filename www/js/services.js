'use strict';

angular.module('emve.services', ['ngResource'])
    .factory('$localstorage', ['$window', function($window) {
        return {
            set: function(key, value) {
                $window.localStorage[key] = value;
            },
            get: function(key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function(key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        }
    }])
    .factory('authInterceptor', function ($rootScope, $q, $window, $localstorage) {
        return {
            request: function (config) {
                $rootScope.$broadcast('loading:show');

                config.headers = config.headers || {};
                var token = $localstorage.get('token');
                if (token) {
                    config.headers.Authorization = 'JWT ' + token;
                }
                return config;
            },
            response: function (response) {
                $rootScope.$broadcast('loading:hide');
                return response || $q.when(response);
            },
            responseError: function (response) {
                $rootScope.$broadcast('loading:hide');

                if (response.status === 401) {
                    // handle the case where the user is not authenticated
                    $rootScope.$state.go('login');
                }

                return $q.reject(response);
            }
        };
    })
    .factory('CurrentUser', function ($localstorage) {
        return {
            get: function () {
                return $localstorage.getObject('current_user');
            },
            set: function (currentUser) {
                return $localstorage.setObject('current_user', currentUser);
            }
        }
    })
    .factory('UserAPI', function ($resource, API_URL) {
        return $resource(API_URL + '/users', {}, {
            patch: {
                method: 'PATCH'
            }
        });
    })
    .factory('UsersAddresses', function ($resource, API_URL) {
        return $resource(API_URL + '/users/addresses/:userAddressId', {}, {
            put: {
                method: 'PUT'
            }
        });
    })
    .factory('ClientOrders', function ($resource, API_URL) {
        return $resource(API_URL + '/client/orders/:orderId', {}, {
            put: {
                method: 'PUT'
            }
        });
    })
    .factory('MavenOrders', function ($resource, API_URL) {
        return $resource(API_URL + '/maven/orders/:orderId', {orderId: '@orderId'}, {
            put: {
                method: 'PUT'
            },
            'accept': {
                method: 'POST',
                params: {act: 'accept'}
            },
            'complete': {
                method: 'POST',
                params: {act: 'complete'}
            }
        });
    })
    .factory('NewAddress', function () {
        var _newAddress = {};

        return {
            get: function () {
                return _newAddress;
            },
            set: function (newAddress) {
                _newAddress = newAddress;
            }
        }
    })
    .factory('WebsocketService', function ($localstorage, $ionicPopup, $rootScope, $state, WEBSOCKET_URL) {
        var socket = null;

        return {
            start: function () {
                var token = $localstorage.get('token');
                if (socket || token == void 0) {
                    return;
                }

                var wsUri = WEBSOCKET_URL + '?token=' + token;
                socket = new ReconnectingWebSocket(wsUri);

                socket.onopen = function () {
                    console.log('connected');
                }

                socket.onclose = function () {
                    console.log('closed');
                }

                socket.onmessage = function (evt) {
                    var data = JSON.parse(evt.data);
                    console.log('On message:');
                    console.log(data);

                    $rootScope.$emit(data.event, data);

                    switch (data.event) {
                        case 'client:order_accepted':
                            $ionicPopup.alert({
                                title: 'Order accepted',
                                template: 'Your order was accepted',
                                okText: 'View Order'
                            }).then(function (res) {
                                $state.go('client.curr-order-accepted.track', {orderId: data.order.id});
                            });
                            break;

                        case 'client:order_completed':
                            $ionicPopup.alert({
                                title: 'Order completed',
                                template: 'Your order was completed',
                                okText: 'View Order'
                            }).then(function (res) {
                                $state.go('client.order-history-details', {orderId: data.order.id});
                            });
                            break;
                    }
                };
            },
            close: function () {
                if (socket) {
                    socket.close();
                    socket = null;
                }
            },
            getSocket: function () {
                return socket;
            }
        }
    })
    .factory('RecentPosition', function () {
        var _pos = null;

        return {
            set: function (pos) {
                _pos = pos;
            },
            get: function () {
                return _pos;
            }
        }
    })
;
