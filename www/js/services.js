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
            },
            removeItem: function (key) {
                return $window.localStorage.removeItem(key);
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

                if (response.status === 400) {
                    $rootScope.$broadcast('http_error:400', response);
                }

                if (response.status === 422) {
                    $rootScope.$broadcast('http_error:422', response);
                }

                return $q.reject(response);
            }
        };
    })
    .factory('CurrentUser', function ($rootScope, $state, $localstorage, UserAPI) {
        var currentUserKey = 'curentUser';

        return {
            get: function () {
                return $localstorage.getObject(currentUserKey);
            },
            doLogin: function (token) {
                // Set JWT token
                $localstorage.set('token', token);

                var deffered = UserAPI.get({}, function (user) {
                    $localstorage.setObject(currentUserKey, user);

                    $rootScope.$emit('websocket:start');
                });

                return deffered.$promise;
            },
            doLogout: function () {
                $rootScope.$emit('websocket:close');

                $localstorage.removeItem('token');
                $localstorage.removeItem(currentUserKey);

                $state.go('splash');
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
                if (socket || token === "null" || token === "undefined" || token === void 0) {
                    return;
                }

                var wsUri = WEBSOCKET_URL + '?token=' + token;
                socket = new ReconnectingWebSocket(wsUri);
                console.log(wsUri);

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
    .factory('PaymentAPI', function ($resource, API_URL) {
        return $resource(API_URL + '/payment', {}, {
            post: {
                method: 'POST'
            }
        });
    })
    .factory('SignupAPI', function ($resource, API_URL) {
        return $resource(API_URL + '/signup', {}, {
            signup: {
                method: 'POST',
                params: {act: 'signup'}
            },
            activate: {
                method: 'POST',
                params: {act: 'activate'}
            }
        });
    })
    .factory('SignupHelper', function ($localstorage) {
        /**
         * tempUserId is user id stored in redis and used to activate account
         * signupAsMavenFlag flag helps to redirect user to "signup as maven" after account activation
         */
        var tempUserIdKey = 'tempUserId', signupAsMavenFlagKey = 'signupAsMavenFlag';

        return {
            getTempUserId: function () {
                return $localstorage.get(tempUserIdKey);
            },
            setTempUserId: function (tempUserId) {
                if (!tempUserId) {
                    return $localstorage.removeItem(tempUserIdKey);
                }
                return $localstorage.set(tempUserIdKey, tempUserId);
            },
            getSignupAsMavenFlag: function () {
                return $localstorage.get(signupAsMavenFlagKey);
            },
            setSignupAsMavenFlag: function (signupAsMavenFlag) {
                if (!signupAsMavenFlag) {
                    return $localstorage.removeItem(signupAsMavenFlagKey);
                }
                return $localstorage.set(signupAsMavenFlagKey, signupAsMavenFlag);
            }
        }
    })
    .factory('MavenSignupAPI', function ($resource, API_URL) {
        return $resource(API_URL + '/maven/signup/:id', {id: '@id'}, {
            step1: {
                method: 'POST',
                params: {act: 'step1'}
            },
            step2: {
                method: 'POST',
                params: {act: 'step2'}
            },
            confirm: {
                method: 'POST',
                params: {act: 'confirm'}
            }
        })
    })
    .factory('MavenSignupHelper', function ($localstorage) {
        var tempMavenSignupIdKey = 'tempMavenSignupId';

        return {
            getTempMavenSignupId: function () {
                return $localstorage.get(tempMavenSignupIdKey);
            },
            setTempMavenSignupId: function (tempMavenSignupId) {
                if (!tempMavenSignupId) {
                    return $localstorage.removeItem(tempMavenSignupIdKey);
                }
                return $localstorage.set(tempMavenSignupIdKey, tempMavenSignupId);
            }
        }
    })

;
