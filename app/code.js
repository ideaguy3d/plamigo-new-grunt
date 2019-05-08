/**
 * Created by Julius Alvarado on 9/2/2017.
 *
 * The talent management system CORE components:
 * PM  = Performance Management
 * LM  = Learning Management
 * TA  = Talent Acquisition
 * OO  = On boarding/Off boarding
 * SP  = Succession Planning
 * WP  = Workforce Planning
 * POM = Position Oversight Management
 * BIT = Background Investigation Tracking
 *
 */

angular.module('edhubJobsApp', [
    'firebase',
    'angular-md5',
    'ngRoute',
    'ngMaterial',
    'ngMdIcons',
    'smoothScroll',
    'ngAnimate'
])
    .config(['$routeProvider', '$locationProvider',
        function ($routeProvider) {
            $routeProvider
            //-- Google Maps app
                .when('/', {
                    templateUrl: 'states/julius/view.sample.html',
                    controller: 'JuliusCtrl',
                    controllerAs: 'cJulius',
                    resolve: {}
                })
                .when('/events', {
                    templateUrl: 'states/julius/view.julius2.html',
                    controller: 'JuliusCtrl',
                    controllerAs: 'cJulius',
                    resolve: {}
                })

                /*******************************************
                 Other UI States to serve as reference code
                 ******************************************/
                // Y Combinator states
                .when('/ycombinator/positions', {
                    templateUrl: 'states/ycombinator/view.yc-landing.html',
                    controller: 'YCombinatorLandingCtrl',
                    controllerAs: 'landingCtrl'
                })
                .when('/ycombinator/home', {
                    templateUrl: 'states/ycombinator/chat/view.yc-home.html',
                    controller: 'YCombinatorLandingCtrl',
                    controllerAs: 'landingCtrl',
                    resolve: {
                        // the user does not have to be authenticated
                        requireNoAuth: function ($location, ycAuthSer) {
                            ycAuthSer.auth.$requireSignIn()
                                .then(function (authUser) {
                                    // if the user is already logged in send them to the channels state
                                    $location.url('/ycombinator/channels');
                                })
                                .catch(function (error) {
                                    var errorMessage = '__>> ERROR - error while going to UI state home';
                                    console.log(errorMessage, error);
                                    return errorMessage;
                                });
                        }
                    }
                })
                .when('/ycombinator/chat', {
                    templateUrl: 'states/ycombinator/chat/view.yc-chat.html',
                    controller: 'ycAuthCtrl',
                    controllerAs: 'cycAuth',
                    resolve: {
                        // the user does not have to be authenticated
                        requireNoAuth: function ($location, ycAuthSer) {
                            ycAuthSer.auth.$requireSignIn()
                                .then(function (authUser) {
                                    // if the user is already logged in send them to the channels state
                                    $location.url('/ycombinator/channels');
                                })
                                .catch(function (error) {
                                    var errorMessage = '__>> ERROR - error while going to UI state home';
                                    console.log(errorMessage, error);
                                    return errorMessage;
                                });
                        }
                    }
                })
                .when('/ycombinator/chat/register', {
                    templateUrl: 'states/ycombinator/chat/view.yc-register.html',
                    controller: 'ycAuthCtrl',
                    controllerAs: 'cycAuth',
                    resolve: {
                        // no authenticated user should go to login/signup view
                        requireNoAuthRsv: function (ycAuthSer, $location) {
                            return ycAuthSer.auth.$requireSignIn()
                                .then(function (authUser) {
                                    console.log('__>> INFO - user is already logged in, authUser: ', authUser);
                                    $location.url('/ycombinator/channels');
                                })
                                // the user is not authenticated
                                .catch(function (error) {
                                    console.log('__>> ERROR = ', error);
                                    return 'ERROR = ' + error;
                                });
                        }
                    }
                })
                .when('/ycombinator/chat/login', {
                    templateUrl: 'states/ycombinator/chat/view.yc-login.html',
                    controller: 'ycAuthCtrl',
                    controllerAs: 'cycAuth',
                    resolve: {
                        // no authenticated user should go to login/signup view
                        requireNoAuthRslv: function (ycAuthSer, $location) {
                            return ycAuthSer.auth.$requireSignIn()
                                .then(function (res) {
                                    console.log('__>> INFO - user is already logged in, authUser: ', authUser);
                                    $location.url('/ycombinator/channels');
                                })
                                .catch(function (error) {
                                    console.log('__>> ERROR = ', error);
                                    return 'ERROR = ' + error;
                                });
                        }
                    }
                })
                .when('/ycombinator/profile', {
                    templateUrl: 'states/ycombinator/chat/view.profile.html',
                    controller: 'ycProfileCtrl',
                    controllerAs: 'cycProfile',
                    resolve: {
                        authRsv: function ($location, ycUsersSer, ycAuthSer) {
                            // .$requireSignIn() will have an on success cb if there is an authenticated user
                            return ycAuthSer.auth.$requireSignIn().catch(function (error) {
                                console.log('__>> ERROR - tried to go to profile ui state without being authenticated, err = ', error);
                                $location.url('/ycombinator/home');
                            });
                        },
                        profileRsv: function (ycUsersSer, ycAuthSer) {
                            return ycAuthSer.auth.$requireSignIn().then(
                                function (authUserObj) {
                                    // CRITICAL ! CRITICAL !! CRITICAL !!! This is where to put $loaded()
                                    return ycUsersSer.getProfile(authUserObj.uid).$loaded();
                                }
                            );
                        }
                    }
                })
                .when('/ycombinator/channels', {
                    templateUrl: 'states/ycombinator/chat/view.channels.html',
                    controller: 'ycChannelsCtrl',
                    controllerAs: 'cycChannels',
                    resolve: {
                        channelsRsv: function (ycChannelsSer) {
                            return ycChannelsSer.channels.$loaded()
                                .catch(function (error) {
                                    console.log('__>> ERROR - There was an error fetching the channels, error: ' + error);
                                });
                        },
                        profileRsv: function ($location, ycAuthSer, ycUsersSer) {
                            return ycAuthSer.auth.$requireSignIn()
                                .then(function (authUser) {
                                    return ycUsersSer.getProfile(authUser.uid).$loaded()
                                        .then(function (profile) {
                                            if (profile.displayName) {
                                                return profile;
                                            } else {
                                                $location.url('/ycombinator/profile');
                                            }
                                        })
                                        .catch(function (error) {
                                            console.log('__>> ERROR - Unable to get the users profile, error: ', error);
                                        });
                                })
                                .catch(function (error) {
                                    console.log('__>> ERROR - The user is not signed in, error: ', error);
                                    $location.url('/ycombinator/home');
                                });
                        }
                    }
                })
                .when('/ycombinator/rooms/:channelId/messages', {
                    templateUrl: 'states/ycombinator/chat/view.messages.html',
                    controller: 'ycMessagesCtrl',
                    controllerAs: 'cycMessages',
                    resolve: {
                        messagesRsv: function ($route, ycMessagesSer) {
                            return ycMessagesSer.forChannel($route.current.params.channelId).$loaded();
                        },
                        channelNameRsv: function ($route, ycChannelsSer) {
                            // we're not using $loaded() here... Hmmm. I wonder why.
                            return '#' + ycChannelsSer.channels.$loaded().$getRecord($route.current.params.channelId).name;
                        },
                        profileRsv: function ($location, ycAuthSer, ycUsersSer) {
                            return ycAuthSer.auth.$requireSignIn(
                                // on success callback
                                function (authUser) {
                                    return ycUsersSer.getProfile(authUser.uid).$loaded().then(function (profile) {
                                        var displayName = profile.displayName;
                                        if (displayName) {
                                            return displayName;
                                        } else {
                                            $location.url('/ycombinator/profile');
                                        }
                                    }).catch(function (error) {
                                        console.log('__>> ERROR - unable to get the users profile info, error: ', error);
                                    });
                                },
                                // on error callback
                                function (error) {
                                    console.log('__>> The user is not authenticated, error: ', error);
                                    $location.url('/ycombinator/home');
                                }
                            );
                        }
                    }
                })
                // The rest of the Edhub states
                .when('/landing', {
                    templateUrl: 'states/landing/view.landing.html',
                    controller: 'LandingCtrl',
                    controllerAs: 'landingCtrl'
                })
                .when('/signup', {
                    templateUrl: 'states/auth/view.tab.join.html',
                    controller: 'AuthCtrl',
                    controllerAs: 'signup',
                    resolve: {
                        unauthApplyRslv: function ($route) {
                            // sta = Signup To Apply
                            return $route.current.params.status === "sta"
                                ? "Hi ^_^/ Please signup/login before applying"
                                : null;
                        }
                    }
                })
                .when('/signup2', {
                    templateUrl: 'states/auth/view.signup.html',
                    controller: 'AuthCtrl',
                    controllerAs: 'signup',
                    resolve: {
                        unauthApplyRslv: function ($route) {
                            // sta = Signup To Apply
                            return $route.current.params.status === "sta"
                                ? "Hi ^_^/ Please signup/login before applying"
                                : null;
                        }
                    }
                })
                .when('/signup/:status', {
                    templateUrl: 'states/auth/view.signup.html',
                    controller: 'AuthCtrl',
                    controllerAs: 'signup',
                    resolve: {
                        unauthApplyRslv: function ($route) {
                            // sta = Signup To Apply
                            return $route.current.params.status === "sta"
                                ? "Hi ^_^/ Please signup/login before applying"
                                : null;
                        }
                    }
                })
                .when('/login', {
                    templateUrl: 'states/auth/view.login.html',
                    controller: 'AuthCtrl',
                    controllerAs: 'login',
                    resolve: {
                        unauthApplyRslv: function ($route) {
                            // sta = Signup To Apply
                            return $route.current.params.status === "sta"
                                ? "Hi ^_^/ Please signup/login before applying"
                                : null;
                        }
                    }
                })
                .when('/user-auth-logout/logout-page', {
                    templateUrl: 'states/auth/view.logout.html'
                })
                .when('/profile/:user', {
                    templateUrl: 'states/auth/view.profile.html'
                })
                .when('/post', {
                    templateUrl: 'states/post/view.post.html',
                    controller: 'PostCtrl',
                    controllerAs: 'postJobCtrl'
                })
                .when('/apply', {
                    templateUrl: 'states/apply/view.apply.html',
                    controller: 'ApplyToJobCtrl',
                    controllerAs: 'applyToJobCtrl'
                })
                .when('/apply/:orgId/:orgName', {
                    templateUrl: 'states/apply/view.apply.org.html',
                    controller: 'ApplyToOrgCtrl',
                    controllerAs: 'applyToOrgCtrl',
                    resolve: {
                        orgJobAppsRslv: function ($route, edhubJobPostService) {
                            return edhubJobPostService.forOrg($route.current.params.orgId).$loaded();
                        }
                    }
                })
                .when('/apply-thanks', {
                    templateUrl: 'states/apply/view.thanks.html'
                })
                .when('/apply-job/:orgName/:jobId', {
                    templateUrl: 'states/apply/view.apply.job-org.html',
                    controller: 'ApplyToJobCtrl',
                    controllerAs: 'applyToJobCtrl'
                })
                .when('/applications', {
                    templateUrl: 'states/org-apps/view.org-apps.html',
                    controller: 'OrgApplicantsCtrl',
                    controllerAs: 'orgApps' // cOrgApplicants
                })
                .when('/lab916', {
                    templateUrl: '/states/lab916/view.landing.html'
                })
                .when('/uit1', {
                    templateUrl: 'ui-prac/uit1.html',
                    controller: 'uiPracCtrl',
                    controllerAs: 'ui'
                })
                .when('/view-job/:orgId/:orgName', {
                    templateUrl: 'states/apply/view.view-job.html',
                    controller: 'ApplyToOrgCtrl',
                    controllerAs: 'cApplyToOrg',
                    resolve: {
                        orgJobAppsRslv: function ($route, edhubJobPostService) {
                            console.log('__>> JA - Will return .getOrganization()');
                            return edhubJobPostService.getOrganization($route.current.params.orgId).$loaded();
                        }
                    }
                })

                // Talent Acquisition states
                .when('/talent-acquisition', {
                    templateUrl: 'states/talent-acquisition/view.talent-acquisition.html',
                    controller: 'TalentAcquisitionCtrl',
                    controllerAs: 'cTalentAcquisition'
                })
                // Performance Management states
                .when('/performance-management', {
                    templateUrl: 'states/performance-management/view.performance-management.html',
                    // PerformanceManagementCtrl
                    controller: 'PerformanceManagementCtrl',
                    controllerAs: 'cPM',
                    resolve: {}
                })
                // Learning Management states
                .when('/learning-management', {
                    templateUrl: 'states/learning-management/view.learning-management.html',
                    controller: 'LearningManagementCtrl',
                    controllerAs: 'cLM',
                    resolve: {}
                })
                // go to base url
                .otherwise('/');

            // Initialize Firebase
            const config = {
                apiKey: "AIzaSyCmP0EGaJXE92fU4AwLSSeP4Y8TOc2u_xU",
                authDomain: "maps1-408.firebaseapp.com",
                databaseURL: "https://maps1-408.firebaseio.com",
                projectId: "maps1-408",
                storageBucket: "maps1-408.appspot.com",
                messagingSenderId: "1070748410942"
            };
            firebase.initializeApp(config);
        }
    ]);;/**
 * Created by Julius Alvarado on 9/10/2017.
 */

(function () {
    "use strict";

    angular.module('edhubJobsApp').controller('CoreCtrl', ['$rootScope', '$scope', '$mdSidenav',
        '$mdDialog', '$timeout', 'edhubAuthService', '$location',
        CoreClass
    ]);

    function CoreClass($rootScope, $scope, $mdSidenav, $mdDialog, $timeout, edhubAuthService, $location) {
        $scope.ccCurrentUser = "";
        $scope.coreEdhubHorizontalState = true;
        $scope.ccAuthBoxHidden = false;
        $scope.ccAuthBoxIsOpen = false;
        $scope.ccAuthBoxHover = true;
        $scope.coreEdhubToggleSideNav = coreEdhubToggleSideNav('core-sidenav');
        const enumAuthBox = {
            loginSignup: "Login/Signup",
            logout: "Logout",
            settings: "Settings",
            editProfile: "Edit Profile",
            applications: "Applications"
        };

        $scope.ccSetCurrentUser = function (userEmail) {
            $scope.ccCurrentUser = userEmail;
        };

        function coreEdhubToggleSideNav(componentId) {
            console.log("edhub - coreEdhubToggleSideNav() invoked");
            return function () {
                $mdSidenav(componentId).toggle();
            }
        }

        // On opening, add a delayed property which shows tooltips
        // after the speed dial has opened
        // so that they have the proper position; if closing,
        // immediately hide the tooltips
        $scope.$watch('ccAuthBoxIsOpen', function (isOpen) {
            if (isOpen) {
                $timeout(function () {
                    $scope.tooltipVisible = $scope.ccAuthBoxIsOpen;
                }, 400);
            } else {
                $scope.tooltipVisible = $scope.ccAuthBoxIsOpen;
            }
        });

        // for ng-md-icon, This is what is being used.
        $scope.ccItems = [
            {name: _determineAuthState(), icon: "login", direction: "left"},
            {name: enumAuthBox.editProfile, icon: "edit", direction: "left"},
            //{name: enumAuthBox.settings, icon: "settings", direction: "bottom"},
            {name: enumAuthBox.applications, icon: "view_list", direction: "left"}
        ];

        // for md-icon, NOT Currently Being Used!!
        $scope.ccCustomIcons = [
            {name: "Login", icon: "img/icons/twitter.svg", direction: "bottom"},
            {name: "Edit Profile", icon: "img/icons/facebook.svg", direction: "top"},
            {name: "Settings", icon: "img/icons/hangout.svg", direction: "bottom"}
        ];

        $scope.ccAuthBoxAction = function ($event, item) {
            switch (item.name) {
                case enumAuthBox.loginSignup:
                    _loginSignup();
                    break;
                case enumAuthBox.logout:
                    _logout();
                    break;
                case enumAuthBox.settings:
                    _settings();
                    break;
                case enumAuthBox.editProfile:
                    _editProfile();
                    break;
                case enumAuthBox.applications:
                    _orgApplicants();
                    break;
                default:
                    console.error("Something went wront w/the AuthBox actions");
            }
        };

        // as of 12:08pm-4/26/2018, the modal doesn't center correctly :(
        // TODO: eventually get this modal dialog to work because it's really REALLY cool!
        $scope.ccOpenDialog = function ($event, item) {
            // Show the dialog
            $mdDialog.show({
                clickOutsideToClose: true,
                controller: function ($mdDialog) {
                    // Save the clicked item
                    this.item = item;

                    // Setup some handlers
                    this.close = function () {
                        $mdDialog.cancel();
                    };
                    this.submit = function () {
                        $mdDialog.hide();
                    };
                },
                controllerAs: 'modalAuth',
                templateUrl: 'states/auth/modal.auth.html',
                targetEvent: $event
            });
        };

        $rootScope.$on("edhub-event-auth-user", function(e, args){
            $scope.ccItems[0].name = _determineAuthState();
        });

        function _determineAuthState() {
            var authUser = edhubAuthService.getAuthUser();
            return authUser === ""
                ? enumAuthBox.loginSignup
                : enumAuthBox.logout;
        }

        function _loginSignup() {
            console.log("in _authAction() !! ^_^");
            $location.path("/signup");
        }

        function _logout() {
            edhubAuthService.logout();
            $location.path("/user-auth-logout/logout-page");
        }

        function _settings() {
            console.log("in _settings() [=");
        }

        function _editProfile() {
            console.log("in _editProfile() ! :)");
        }

        function _orgApplicants() {
            $location.path('/applications');
        }
    }
}());;/**
 * Created by Julius Alvarado on 9/5/2017.
 */

(function () {
    "use strict";

    angular.module('edhubJobsApp').factory('edhubAuthService', ['$firebaseAuth', '$rootScope',
        '$firebaseObject', '$location', '$q',
        EdhubAuthClass
    ]);

    function EdhubAuthClass($firebaseAuth, $rootScope, $firebaseObject, $location, $q) {
        $rootScope.rootEdhubAuthUser = "";
        const orgRef = firebase.database().ref('organizations');
        const auth = $firebaseAuth();
        var authApi = {};

        auth.$onAuthStateChanged(function (authUser) {
            if (authUser) {
                var authUserRef = orgRef.child(authUser.uid);
                $rootScope.rootEdhubAuthUser = $firebaseObject(authUserRef);
                console.log("edhub - The Auth User =");
                console.log($rootScope.rootEdhubAuthUser);
                $rootScope.$broadcast("edhub-event-auth-user", {
                    haveAuthUser: true
                });
            } else {
                $rootScope.rootEdhubAuthUser = "";
                $rootScope.$broadcast("edhub-event-auth-user", {
                    haveAuthUser: false
                });
                console.log("There is no longer an Auth User");
                console.log($rootScope.rootEdhubAuthUser);
            }
        });

        authApi = {
            login: function (user, info) {
                auth.$signInWithEmailAndPassword(user.email, user.password)
                    .then(function (authUser) {
                        // console.log("edhub - user successfully signed in");
                        // console.log(authUser);
                        if(!!info.path) {
                            $location.path('/'+info.path);
                        } else {
                            $location.path('/');
                        }
                    })
                    .catch(function (error) {
                        console.error("edhub - There was an error =");
                        console.log(error.message);
                        $rootScope.rootAuthError = error.message;
                    });
            },
            logout: function () {
                return auth.$signOut();
            },
            requireAuth: function () {
                return auth.requireSignIn();
            },
            signup: function (user, info) {
                // give 'info a default value if nothing got passed in
                info = !!info ? info : {};
                console.log("edhub - signup user = ", user);
                auth.$createUserWithEmailAndPassword(user.email, user.password)
                    .then(function (regUser) {
                        orgRef.child(regUser.uid).set({
                            date: firebase.database.ServerValue.TIMESTAMP,
                            regUser: regUser.uid,
                            orgName: !!user.orgName ? user.orgName : 'blank',
                            email: user.email,
                            repName: !!user.name ? user.name : 'blank'
                        });
                        $rootScope.rootMessage = "Thanks for registering " + user.name;
                        if(info.listOrg) {
                            console.log("broadcasting 'edhub-list-unauth-org-signup'");
                            $rootScope.$broadcast("edhub-list-unauth-org-signup", {
                                orgId: regUser.uid
                            });
                        }

                        authApi.login(user, info);
                    })
                    .catch(function (error) {
                        console.error("edhub - There was an error =");
                        console.log(error.message);
                        $rootScope.rootAuthError = error.message;
                        return null;
                    });
            },
            getAuthUser: getAuthUser
        };

        function getAuthUser() {
            return $rootScope.rootEdhubAuthUser;
        }

        // return $firebaseAuth();
        return authApi;
    }
}());;/**
 * Created by Julius Alvarado on 9/17/2017.
 */

(function () {
    "use strict";

    angular.module('edhubJobsApp').factory('edhubJobPostService', ['$firebaseArray',
        'edhubAuthService', EdhubJobPostClass

    ]);

    function EdhubJobPostClass($firebaseArray, edhubAuthService) {

        const refJobPostings = firebase.database().ref('jobPostings');
        const refOrgApplicants = firebase.database().ref('orgApplicants');
        const refApplicantJobApps = firebase.database().ref('applicantJobApps');
        const refOrganizations = firebase.database().ref('organizations');

        function jobPostingsLimitTo(limit) {
            const qJobPostingsLimitToOrderByDate =
                refJobPostings.orderByChild("timeStamp").limitToLast(limit);
            return $firebaseArray(qJobPostingsLimitToOrderByDate);
        }

        function listOrganization(orgData, orgId) {
            /* - old attempt to signup from with in this factory rather than from the controllers
             var signupInfo = {
                email: orgData.email,
                pw: orgData.pw ? orgData.pw : null
            };
            var orgId = edhubAuthService.signup(signupInfo);
            */

            // TODO: seriously figure out / practice correctly returning this
            return $firebaseArray(refJobPostings.child(orgId)).$add(orgData).then(function (ref) {
                return ref;
            });
        }

        /**
         * Get firebase node
         * @param orgId
         * @returns {*}
         */
        function forOrg(orgId) {
            return $firebaseArray(refOrgApplicants.child(orgId));
        }

        // refOrganizations = firebase.database().ref('organizations')
        function getOrganization (orgId) {
            return $firebaseArray(refOrganizations.child(orgId));
        }

        function returnAllOrganizations () {
            return $firebaseArray(refOrganizations);
        }

        function forApplicants(applicantId) {

        }
        
        function applicantJobApplication() {

        }

        return {
            jobPostings: $firebaseArray(refJobPostings),
            jobPostingsLimitTo: jobPostingsLimitTo,
            forOrg: forOrg,
            listOrganization: listOrganization,
            forApplicants: forApplicants,
            applicantJobApplication: applicantJobApplication,
            getOrganization: getOrganization,
            returnAllOrganizations: returnAllOrganizations
        };
    }
}());


;/**
 * Created by Julius Alvarado on 4/29/2018.
 */

(function () {
    'use strict';

    angular.module('edhubJobsApp').factory('OrgListSer', [
        '$rootScope', '$firebaseArray', OrgListSerClass
    ]);

    function OrgListSerClass($rootScope, $firebaseArray) {
        const orgListingsRef = firebase.database().ref('orgListings');
        const orgFeedRef = firebase.database().ref('orgFeed');
        const ycOrgFeedRef = firebase.database().ref('ycOrgFeed');
        const orgApplicantsRef = firebase.database().ref('orgApplicants');

        /**
         *
         * @param orgInfo
         * @param orgId
         * @returns {*}
         */
        function listOrg(orgInfo, orgId) {
            return $firebaseArray(orgListingsRef.child(orgId)).$add(orgInfo)
                .then(function (ref) {
                    return ref;
                });
        }

        function postToOrgFeed(orgInfo, orgId) {
            orgInfo.timestamp = firebase.database.ServerValue.TIMESTAMP;
            orgInfo.orgId = orgId;
            return $firebaseArray(orgFeedRef).$add(orgInfo)
                .then(function (refNode) {
                    return refNode;
                });
        }

        function readFromOrgFeed(limit, orderFeedBy) {
            var qOrderLimit = orgFeedRef.orderByChild(orderFeedBy).limitToLast(limit);
            return $firebaseArray(qOrderLimit);
        }

        function getOrgApplicants(edhubUserId) {
            return $firebaseArray(orgApplicantsRef.child(edhubUserId));
        }

        // C - create
        function ycCreateNewJob(jobInfo) {
            return $firebaseArray(ycOrgFeedRef).$add(jobInfo);
        }

        // R - read
        function ycReadFromOrgFeed(limit, orderFeedBy) {
            var qOrderLimit = ycOrgFeedRef.orderByChild(orderFeedBy).limitToLast(limit);
            return $firebaseArray(qOrderLimit);
        }

        // U - update
        function ycUpdateJobPost(jobInfo) {

        }

        // D - delete
        function ycDeleteJobFromOrganization(jobInfo) {
            /*
            //$id: "-Lbtf1tCijkCvklhoReS"
            //$priority: null
            aboutTheOrganization: "Looking for a PHP coder with strong SQL skills to feed the data presentation layer with some data"
            //curOrganization: "Y Combinator"
            name: ""
            orgId: ""
            orgName: "Full Stack Engineer"
            timestamp: 0
            */
            delete jobInfo.$$hashKey;
            //delete jobInfo.$id;
            delete jobInfo.curOrganization;
            //delete jobInfo.$priority;
            console.log('after deleting jobInfo stuff: ', jobInfo);
            $firebaseArray(ycOrgFeedRef).$remove(jobInfo);
        }

        return {
            listOrg: listOrg,
            postToOrgFeed: postToOrgFeed,
            readFromOrgFeed: readFromOrgFeed,
            getOrgApplicants: getOrgApplicants,
            ycReadFromOrgFeed: ycReadFromOrgFeed,
            ycDeleteJobFromOrganization: ycDeleteJobFromOrganization,
            ycCreateNewJob: ycCreateNewJob,
            ycUpdateJobPost: ycUpdateJobPost
        };

    }
}());
;/**
 * Created by Julius Alvarado on 4/6/2019.
 */


(function(){
    'use strict';

    angular.module('edhubJobsApp').factory('TalentAcquisitionSer', [
        '$firebaseArray', TalentAcquisitionSerClass
    ]);

    function TalentAcquisitionSerClass () {
        var ref
    }
}());;/**
 * Created by Julius Alvarado on 4/22/2018.
 */

(function () {
    "use strict";

    const app = angular.module('edhubJobsApp');

    app.controller('ApplyToJobCtrl', ['$routeParams', ApplyToJobCtrlClass]);

    function ApplyToJobCtrlClass($routeParams) {
        const vm = this;
        vm.rParams = $routeParams;
    }
}());;/**
 * Created by Julius Alvarado on 4/22/2018.
 */

(function () {
    "use strict";

    const app = angular.module('edhubJobsApp');

    app.controller('ApplyToOrgCtrl', [
        'orgJobAppsRslv', '$routeParams', '$location', //'resolvedViewJobOrg',
        ApplyToOrganizationClass
    ]);

    function ApplyToOrganizationClass(orgJobAppsRslv, $routeParams, $location) {
        const vm = this;
        vm.rParams = $routeParams;

        // data model
        vm.applyToOrgDataModel = {
            applicantName: 'Julius Maximus Romulus',
            applicantEmail: 'julius@julius3d.com',
            applicantLinkedin: 'https://linkedin.com/in/juliusalvarado',
            applicantCover: 'Hi ^_^/ \n' +
                ' I\'m Julius Alvarado(:\n' +
                '\n' +
                ' I\'m a Web Developer / Software Engineer / Graphic & UIUX Designer\n' +
                'and an overall Hard Working Focused and Motivated Optimistic Team Player.',
            orgApplyTo: $routeParams.orgName,
            orgId: $routeParams.orgId
        };
        // vm.orgName = orgJobAppsRslv[2].$value;
        orgJobAppsRslv.$loaded().then(function (res) {
            console.log('orgJobAppsRslv firebase res data = ');
            console.log(res);
        }).catch(function(err){
            console.log('There was an error ):');
            console.log(err);
        });

        vm.orgImg = 'images/stanford/stanford.png';

        vm.applyToOrg = function () {
            vm.applyToOrgDataModel.timestamp = firebase.database.ServerValue.TIMESTAMP;
            orgJobAppsRslv.$add(vm.applyToOrgDataModel).then(function (ref) {
                console.log("edhub - The response from firebase: ", ref);
                $location.url('/apply-thanks');
            }).catch(function (err) {
                console.log("There was an error submitting applicant data to organization:");
                console.log(err);
            });
        };
    }
}());;/**
 * Created by Julius Alvarado on 9/11/2017.
 */

(function () {
    "use strict";

    angular.module('edhubJobsApp').controller('AuthCtrl', ['$scope', 'edhubAuthService',
        '$location', 'unauthApplyRslv',
        AuthClass
    ]);

    function AuthClass($scope, edhubAuthService, $location, unauthApplyRslv) {
        const vm = this;
        vm.email = "";
        vm.pw = "";
        vm.error = "";
        vm.name = "";
        vm.orgName = "";
        vm.showProgress = false;
        vm.edhubStatusMessage = unauthApplyRslv;

        vm.authSignup = function () {
            const orgInfo = {
                email: vm.email,
                password: vm.pw,
                orgName: vm.orgName !== "" ? vm.orgName : "no orgName input field yet :/",
                name: vm.name !== "" ? vm.name : "no name given"
            };
            edhubAuthService.signup(orgInfo);
            vm.showProgress = true;
        };

        vm.go2login = function () {
            $location.path("/login");
        };

        vm.go2signup = function () {
            $location.path('/signup');
        };

        vm.userLogin = function () {
            vm.showProgress = true;
            const orgInfo = {
                email: vm.email,
                password: vm.pw,
                orgName: vm.orgName !== "" ? vm.orgName : "profile",
                name: vm.name !== "" ? vm.name : "no name given"
            };
            edhubAuthService.login(orgInfo, {path: 'user/'+orgInfo.orgName});
        };
    }
}());;/**
 * Created by Julius Alvarado on 9/10/2017.
 */


(function(){
    "use strict";

    angular.module('edhubJobsApp').controller('LoginCtrl', ['$scope', 'edhubAuthService',
        function($scope, edhubAuthService){
            const vm = this;
            vm.email = "";
            vm.pw = "";
            vm.error = "";

            vm.userLogin = function () {
                edhubAuthService.userLogin(vm.email, vm.pw)
                    .then(function (auth) {
                        $scope.ccSetCurrentUser(auth.email);
                        $state.go("landing");
                    }, function (err) {
                        vm.error = err.message;
                    });
            };
        }
    ]);
}());;/**
 * Created by Julius Alvarado on 9/5/2017.
 */

(function () {
    "use strict";

    angular.module('edhubJobsApp').controller('SignupCtrl', ['edhubAuthService', '$scope',
        function (edhubAuthService, $scope) {
            const vm = this;
            vm.email = "";
            vm.pw = "";
            vm.error = "";

            vm.userSignup = function () {
                edhubAuthService.userSignup(vm.email, vm.pw)
                    .then(function (auth) {
                        edhubAuthService.userLogin(vm.email, vm.pw).then(function () {
                            console.log("jha - auth = ");
                            console.log(auth);
                            $scope.ccSetCurrentUser(auth.email);
                            $state.go('landing');
                        }, function(err){
                            vm.error = err.message;
                        });
                    }, function (err) {
                        vm.error = err.message;
                    });
            }
        }
    ]);
}());;/**
 * Created by Julius Alvarado on 12/13/2018.
 */

(function (GeoFire) {
    'use strict';

    const app = angular.module('edhubJobsApp');

    app.controller('JuliusCtrl', [
        'edhubJobPostService', '$http', '$location', '$firebaseArray', JuliusCtrlClass
    ]);

    function JuliusCtrlClass(edhubJobPostService, $http, $location, $firebaseArray) {
        const vm = this;
        var latitude;
        var longitude;
        vm.deleteOrg = deleteOrg;

        function deleteOrg() {
            // edhubJobPostService.returnAllOrganizations().$remove(1).then(function (res) {
            //     console.log("The item that got deleted = ");
            //     console.log(res);
            // });

            var organizationsList = edhubJobPostService.returnAllOrganizations();
            edhubJobPostService.returnAllOrganizations().$loaded().then(function (res) {
                var organizationItem = organizationsList[1];
                console.log("organizationItem = ", organizationItem);
                organizationsList.$remove(organizationItem);
            });
        }

        // Generate a random Firebase location
        var geoFirePracRef = firebase.database().ref().child('mapPrac').push();
        var storesPracRef = firebase.database().ref().child('storePrac');

        // Create a new GeoFire instance at the random Firebase location
        var geoFire = new GeoFire(geoFirePracRef);
        var storePrac = new $firebaseArray(storesPracRef);

        // Style credit: https://snazzymaps.com/style/1/pale-dawn
        const mapStyle1 = [
            {
                "featureType": "administrative",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "lightness": 33
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#f2e5d4"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#c5dac6"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "all",
                "stylers": [
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#c5c6c6"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#e4d7c6"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#fbfaf7"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "color": "#acbcc9"
                    }
                ]
            }
        ];

        const mapStyle = [
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "saturation": 36
                    },
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 40
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 17
                    },
                    {
                        "weight": 1.2
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 21
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 17
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 29
                    },
                    {
                        "weight": 0.2
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 18
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 19
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 17
                    }
                ]
            }
        ];

        // Escapes HTML characters in a template literal string, to prevent XSS.
        // See https://www.owasp.org/index.php/XSS_%28Cross_Site_Scripting%29_Prevention_Cheat_Sheet#RULE_.231_-_HTML_Escape_Before_Inserting_Untrusted_Data_into_HTML_Element_Content
        function sanitizeHTML(strings) {
            const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
            let result = strings[0];
            for (let i = 1; i < arguments.length; i++) {
                result += String(arguments[i]).replace(/[&<>'"]/g, (char) => {
                    return entities[char];
                });
                result += strings[i];
            }
            return result;
        }

        /* Callback method from the geolocation API which receives the current user's location */
        var geolocationCallback = function (location) {
            latitude = location.coords.latitude;
            longitude = location.coords.longitude;
            console.log("Retrieved user's location: [" + latitude + ", " + longitude + "]");

            var username = "Julius";
            geoFire.set(username, [latitude, longitude])
                .then(function () {
                    console.log("Current user " + username + "'s location has been added to GeoFire");

                    // When the user disconnects from Firebase (e.g. closes the app, exits the browser),
                    // remove their GeoFire entry
                    geoFirePracRef.child(username).onDisconnect().remove();

                    var currentUrl = $location.url();

                    console.log("Added handler to remove user " + username + " from GeoFire when you leave this page.");
                    console.log("__>> $location.url() = " + currentUrl);

                    //TODO: refactor each view to have its' own controller rather than use this "gmap router"

                    // gmap _ROUTER...
                    // since both views are using the same controller I have to delegate which gmap function to invoke
                    if (currentUrl === '/') {
                        initMap();
                    } else if (currentUrl === '/events') {
                        myMap();
                    } else {
                        // just go to the home view
                        $location.url('/');
                    }

                })
                .catch(function (error) {
                    log("__>> ERROR adding user " + username + "'s location to GeoFire");
                    console.log("__>> ERROR adding user " + username + "'s location to GeoFire, ERROR:", error);
                });
        };

        /* Handles any errors from trying to get the user's current location */
        var errorHandler = function (error) {
            if (error.code === 1) {
                console.log("Error: PERMISSION_DENIED: User denied access to their location");
            } else if (error.code === 2) {
                console.log("Error: POSITION_UNAVAILABLE: Network is down or positioning satellites cannot be reached");
            } else if (error.code === 3) {
                console.log("Error: TIMEOUT: Calculating the user's location too took long");
            } else {
                console.log("Unexpected error code")
            }
        };

        /* Uses the HTML5 geolocation API to get the current user's location */
        var getLocation = function () {
            if (typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined") {
                console.log("Asking user to get their location");
                navigator.geolocation.getCurrentPosition(geolocationCallback, errorHandler);
            } else {
                console.log("Your browser does not support the HTML5 Geolocation API, so this demo will not work.")
            }
        };

        // Get the current user's location
        getLocation();

        /* Logs to the page instead of the console */
        function log(message) {
            var childDiv = document.createElement("div");
            var textNode = document.createTextNode(message);
            childDiv.appendChild(textNode);
            document.getElementById("log").appendChild(childDiv);
        }

        function initMap() {
            var localStoreData;

            $http.get('data/stores.json').then(function (res) {
                localStoreData = res.data;

                //TODO: cache the gmap object
                const map = new google.maps.Map(document.getElementById('prac-one-gmap-container'), {
                    zoom: 7,
                    // use London coordinates
                    center: {lat: 51.507351, lng: -0.127758},
                    styles: mapStyle
                });

                //-- do not add any more data to the firebase node:
                //storePrac.$add(localStoreData);

                map.data.addGeoJson(localStoreData);
                map.data.setStyle(feature => {
                    return {
                        icon: {
                            url: `img/icon_${feature.getProperty('category')}.png`,
                            scaledSize: new google.maps.Size(64, 64)
                        }
                    }
                });

                const apiKey = 'AIzaSyC97txSDaXo4QxSphjx_KqwW748OGwJUz8';
                const infoWindow = new google.maps.InfoWindow();
                infoWindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});

                // addListener('click',
                map.data.addListener('click', event => {
                    // properties from the geojson file
                    const category = event.feature.getProperty('category');
                    const hours = event.feature.getProperty('hours');
                    const description = event.feature.getProperty('description');
                    const name = event.feature.getProperty('name');
                    const phone = event.feature.getProperty('phone');

                    // gmap geometry
                    const position = event.feature.getGeometry().get();

                    // <img style="float:left; width:70px; margin-top:30px" src="img/logo_${category}.png">
                    const content = sanitizeHTML`
                         <div>
                            <h2>${name}</h2><p>${description}</p>
                            <a href="http://hack2016.julius3d.com">View Club Profile</a>
                            <p><b>Open:</b> ${hours}<br/><b>Phone:</b> ${phone}</p>
                         </div>
                     `;

                    infoWindow.setContent(content);
                    infoWindow.setPosition(position);
                    infoWindow.open(map);
                });

            }).catch(function (err) {
                console.log("__>> ERROR: ", err);
            });

        } // END OF: initMap()

        //-- Google Maps code:
        function myMap() {
            var mapProp = {
                center: new google.maps.LatLng(latitude, longitude),
                zoom: 15,
                //controlSize: 0,
                //disableDefaultUI: true
            };

            var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
            var marker = new google.maps.Marker({position: mapProp.center});
            marker.setMap(map);

            console.log('__>> Plamigo map app initialized');
            //console.log(map);
        }
    }

})(window.geofire.GeoFire);;/**
 * Created by Julius Alvarado on 5/4/2019.
 */

// Style credit: https://snazzymaps.com/style/1/pale-dawn
const mapStyle = [
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "lightness": 33
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2e5d4"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#c5dac6"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#c5c6c6"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e4d7c6"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#fbfaf7"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#acbcc9"
            }
        ]
    }
];

// Escapes HTML characters in a template literal string, to prevent XSS.
// See https://www.owasp.org/index.php/XSS_%28Cross_Site_Scripting%29_Prevention_Cheat_Sheet#RULE_.231_-_HTML_Escape_Before_Inserting_Untrusted_Data_into_HTML_Element_Content
function sanitizeHTML(strings) {
    const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
    let result = strings[0];
    for (let i = 1; i < arguments.length; i++) {
        result += String(arguments[i]).replace(/[&<>'"]/g, (char) => {
            return entities[char];
        });
        result += strings[i];
    }
    return result;
}

function initMap() {

    // Create the map.
    const map = new google.maps.Map(document.getElementsByClassName('map')[0], {
        zoom: 7,
        center: {lat: 52.632469, lng: -1.689423},
        styles: mapStyle
    });

    // Load the stores GeoJSON onto the map.
    map.data.loadGeoJson('stores.json');

    // Define the custom marker icons, using the store's "category".
    map.data.setStyle(feature => {
        return {
            icon: {
                url: `img/icon_${feature.getProperty('category')}.png`,
                scaledSize: new google.maps.Size(64, 64)
            }
        };
    });

    const apiKey = 'YOUR_API_KEY';

    const infoWindow = new google.maps.InfoWindow();
    infoWindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});

    // Show the information for a store when its marker is clicked.
    map.data.addListener('click', event => {
        const category = event.feature.getProperty('category');
        const hours = event.feature.getProperty('hours');
        const description = event.feature.getProperty('description');
        const name = event.feature.getProperty('name');
        const phone = event.feature.getProperty('phone');

        const position = event.feature.getGeometry().get();

        const content = sanitizeHTML`
              <img style="float:left; width:200px; margin-top:30px" src="img/logo_${category}.png">
              <div style="margin-left:220px; margin-bottom:20px;">
                <h2>${name}</h2><p>${description}</p>
                <p><b>Open:</b> ${hours}<br/><b>Phone:</b> ${phone}</p>
                <p><img src="https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${position.lat()},${position.lng()}&key=${apiKey}"></p>
              </div>
        `;

        infoWindow.setContent(content);
        infoWindow.setPosition(position);
        infoWindow.open(map);
    });

};/**
 * Created by Julius Alvarado on 1/3/2018.
 */

(function () {
    "use strict";

    angular.module('edhubJobsApp').controller('Lab916Ctrl', [
        function () {
            const vm = this;
            vm.message = "hello from the Lab916 controller ^_^/";
        }
    ]);
}());;/**
 * Created by Julius Alvarado on 9/4/2017.
 */

(function () {
    "use strict";

    angular.module('edhubJobsApp').controller('LandingCtrl', [
        'edhubJobPostService', '$location', 'smoothScroll', 'eOrgListFact',
        '$rootScope', LandingClass
    ]);

    function LandingClass(edhubJobPostService, $location, smoothScroll, eOrgListFact, $rootScope) {
        const vm = this;
        vm.jobPostBg = "images/chalkboard3dArt1.png";
        vm.showVid = true;
        vm.ycombinatorMessage = "Talent Opportunities at Y Combinator";

        vm.apply2job = function (organizationName, postId) {
            $location.url('/apply/' + postId + '/' + organizationName);
        };

        vm.apply2org = function (orgInfo) {
            if ($rootScope.rootEdhubAuthUser) {
                $location.url('/apply/' + orgInfo.orgId + '/' + orgInfo.orgName);
            } else {
                ////-- if user is not authenticated send them to "sign up to apply" view --\\\\

                //-- sta = Signup To Apply view
                // $location.url('/signup/sta');

                //-- 'apply to job' view:
                //$location.url('/apply/' + orgInfo.orgId + '/' + orgInfo.orgName);
                $location.url('/view-job/'+ orgInfo.orgId + '/' + orgInfo.orgName)
            }
        };

        vm.scroll2recentJobs = function () {
            var elem = document.getElementById("edhub-recent-jobs-landing-title");
            smoothScroll(elem);
        };

        activate();

        function activate() {
            eOrgListFact.readFromOrgFeed(5, 'timestamp').$loaded().then(function (data) {
                vm.orgFeed = data;
            }).catch(function (error) {
                console.error('edhub - Error: ', error);
            });

            /*
            edhubJobPostService.jobPostingsLimitTo(7).$loaded().then(function (res) {
                vm.jobPostings = res;
                console.log("edhub - jobPostings res =");
                console.log(res);
            }).catch(function (error) {
                console.error('edhub - Error: ', error);
            });
            */
        }
    }

}());;/**
 * Created by Julius Alvarado on 4/4/2019.
 */

(function(){
    'use strict';

    function LearningManagementClass () {
        var vm = this;
        vm.message = 'Create courses or quick tutorials.'
    }

    angular.module('edhubJobsApp')
        .controller('LearningManagementCtrl', [
            LearningManagementClass
        ]);
}());;/**
 * Created by Julius Alvarado on 4/29/2018.
 */

(function () {
    "use strict";

    const app = angular.module('edhubJobsApp');
    app.controller('OrgApplicantsCtrl', [
        '$rootScope', 'edhubAuthService', 'eOrgListFact',
        OrgApplicantsClass
    ]);

    function OrgApplicantsClass($rootScope, edhubAuthService, eOrgListFact) {
        const vm = this;

        /* a user has logged in or out */
        $rootScope.$on("edhub-event-auth-user", function (e, data) {
            var authUser = edhubAuthService.getAuthUser();
            vm.userEmail = authUser.email;
            console.log("in 'edhub-event-auth-user' event, The authUser = ", authUser);
            if (authUser) {
                eOrgListFact.getOrgApplicants(authUser.$id).$loaded(function (res) {
                    vm.applicants = res;
                    // console.log("edhub - vm.orgApps = ", vm.applicants);
                });
            } else {
                console.log("edhub - There was no authUser :(");
                vm.applicants = null;
            }
        });

        activate();
        function activate() {
            var authUser = edhubAuthService.getAuthUser();
            vm.userEmail = authUser.email;
            console.log("in 'edhub-event-auth-user' event, The authUser = ", authUser);
            if (authUser) {
                eOrgListFact.getOrgApplicants(authUser.$id).$loaded(function (res) {
                    vm.applicants = res;
                    // console.log("edhub - vm.orgApps = ", vm.applicants);
                });
            } else {
                console.log("edhub - There was no authUser :(");
                vm.applicants = null;
            }
        }
    }
}());;/**
 * Created by Julius Alvarado on 4/4/2019.
 */

(function(){
    'use strict';

    function PerformanceManagementClass() {
        var vm = this;
        vm.points = 50;
    }

    angular.module('edhubJobsApp').controller('PerformanceManagementCtrl', [
        PerformanceManagementClass
    ]);
}());;/**
 * Created by Julius Alvarado on 9/12/2017.
 */


(function () {
    "use strict";


    angular.module('edhubJobsApp').controller('PostCtrl', ['$rootScope', 'edhubJobPostService',
        '$location', 'edhubAuthService', 'OrgListSer',
        PostClass
    ]);

    function PostClass($rootScope, edhubJobPostService, $location, edhubAuthService, eOrgListFact) {

        const vm = this;
        vm.progressMessage = "Your Progress";
        vm.formScope = {};
        vm.edhubAuthUser = !!edhubAuthService.getAuthUser();
        vm.edhubAuthUser = edhubAuthService.getAuthUser();

        //-- Data Model:
        vm.organization = {
            orgName: '',
            zipCode: '',
            email: '',
            aboutTheOrganization: '',
            name: '',
            password: ''
        };

        /* A user has either "signup/login" or logged out */
        $rootScope.$on("edhub-event-auth-user", function (e, data) {
            vm.edhubAuthUser = data.haveAuthUser;
            vm.edhubAuthUserData = edhubAuthService.getAuthUser();
        });

        /* A user has listed their organization without "login/signup" */
        $rootScope.$on("edhub-list-unauth-org-signup", function (e, data) {
            var jProVal = "";

            // delete vm.organization.password; // this works but causes a weird bug in my code :\

            // to get "node.key" & "node.parent.key"
            eOrgListFact.listOrg(vm.organization, data.orgId).then(function (res) {
                jProVal = res; // thisNode.key or thisNode.parent.key (to ascend upward if need be)
                //console.log("edhub - jProVal =", jProVal);
            });

            // now post to the organization feed so orgs can be easily looped
            eOrgListFact.postToOrgFeed(vm.organization, data.orgId);
        });

        vm.setFormScope = function (scope) {
            console.log("jha - form scope has been set, scope =");
            console.log(scope);
            vm.formScope = scope;
        };

        vm.listOrg = function () {
            if (vm.edhubAuthUser) {
                listOrgAuth();
            } else {
                listOrgUnauth();
            }
        };

        var postJob = function () {
            vm.organization.timeStamp = firebase.database.ServerValue.TIMESTAMP;
            edhubJobPostService.jobPostings.$add(vm.organization).then(function (res) {
                console.log("jha - successfully posted job to firebase ^_^/ res=");
                console.log(res);
                vm.organization = {};
            });
            $location.url('/');
        };

        function listOrgAuth() {

        }

        function listOrgUnauth() {
            edhubAuthService.signup(vm.organization, {listOrg: true, path: ''});
            vm.edhubAuthUser = edhubAuthService.getAuthUser();
        }
    }

}());
;/**
 * Created by Julius Alvarado on 4/2/2019.
 */

(function () {
    'use strict';

    function TalentAcquisitionClass(OrgListSer) {
        const vm = this;
        vm.message = 'Talent Acquisition';
        vm.curOrganization = 'Y Combinator';
        vm.hideForm = true;
        vm.postedOpportunities = [];
        // data model, it matches the practice ycOrgFeed node schema
        vm.talentInfo = {
            // the 'job description'
            aboutTheOrganization: '',
            name: '',
            orgId: '',
            // the 'job title'
            orgName: '',
            timestamp: 0
        };

        vm.talentSubmit = function () {
            if (vm.hideForm === false) {
                console.log('going to sumbit this talent info:');
                console.log(vm.talentInfo);
                vm.talentInfo.curOrganization = vm.curOrganization;
                OrgListSer.ycCreateNewJob(vm.talentInfo).then(function (res) {
                    console.log('Response for listing organization ' + vm.curOrganization);
                    console.log(res);
                });
                vm.talentInfo = {
                    orgName: '',
                    aboutTheOrganization: ''
                };
            }

            vm.hideForm = !vm.hideForm;
        };

        vm.deleteJob = function (job) {
            // OrgListSer.ycDeleteJobFromOrganization(job);
            vm.postedOpportunities.$remove(job);
        };

        init();
        function init() {
            OrgListSer.ycReadFromOrgFeed(10, 'name').$loaded()
                .then(function (res) {
                    vm.postedOpportunities = res;
                    console.log("The response is");
                    console.log(res);
                });
        }
    }

    angular.module('edhubJobsApp').controller('TalentAcquisitionCtrl', [
        'OrgListSer', TalentAcquisitionClass
    ]);

}());;/**
 * Created by Julius Alvarado on 3/10/2019.
 */
(function () {
    'use strict';
    var yc = '/ycombinator/';

    // SERVICES
    function SerAuthClass($firebaseAuth) {
        var auth = $firebaseAuth();

        return {
            auth: auth
        }
    }

    function SerUsersClass($firebaseArray, $firebaseObject) {
        var usersRef = firebase.database().ref('/users');
        var connectedRef = firebase.database().ref('.info/connected');
        var users = $firebaseArray(usersRef);

        function getProfile(uid) {
            return $firebaseObject(usersRef.child(uid));
        }

        function getDisplayName(uid) {
            return users.$getRecord(uid).displayName;
        }

        function getGravatar(uid) {
            return '//www.gravatar.com/avatar/' + users.$getRecord(uid).emailHash;
        }

        function setOnline(uid) {
            var connected = $firebaseObject(connectedRef);
            var online = $firebaseArray(usersRef.child(uid + '/online'));

            connected.$watch(function () {
                if (connected.$value === true) {
                    online.$add(true).then(function (connectedRef) {
                        connectedRef.onDisconnect().remove();
                    });
                }
            });
        }

        return {
            getProfile: getProfile,
            getDisplayName: getDisplayName,
            getGravatar: getGravatar,
            setOnline: setOnline,
            all: users
        };
    }

    function SerChannelsClass($firebaseArray) {
        var ref = firebase.database().ref('/channels');
        var channels = $firebaseArray(ref);

        return {
            channels: channels
        };
    }

    function SerMessagesClass($firebaseArray) {
        //
        var channelMessagesRef = firebase.database().ref('/channelMessages');
        var userMessagesRef = firebase.database().ref('/userMessages');

        function forChannel(channelId) {
            return $firebaseArray(channelMessagesRef.child(channelId));
        }

        function forUsers(uid1, uid2) {
            // essentially, the user who has the lower id will "hold" the conversation w/anyone who
            //has this is just a way to ensure users are pulling from the right path in firebase
            var path = uid1 < uid2 ? (uid1 + '/' + uid2) : (uid2 + '/' + uid1);

            return $firebaseArray(userMessagesRef.child(path));
        }

        return {
            forChannel: forChannel,
            forUsers: forUsers
        };
    }

    // CONTROLLERS
    function CtrlAuthClass(ycAuthSer, $location) {
        var authCtrl = this;
        authCtrl.error = '';
        authCtrl.authInfo = 'The auth ctrl is wired up to the view';
        authCtrl.user = {
            email: 'chat@app.com',
            password: 'jiha89'
        };

        authCtrl.login = function () {
            ycAuthSer.auth.$signInWithEmailAndPassword(authCtrl.user.email, authCtrl.user.password)
                .then(function (authRes) {
                    $location.url('/ycombinator/channels');
                })
                .catch(function (error) {
                    console.log("__>> ERROR:");
                    console.log(error);
                    authCtrl.error = error;
                });
        };

        authCtrl.register = function () {
            console.log('__>> should invoke YC auth service');
            ycAuthSer.auth
                .$createUserWithEmailAndPassword(authCtrl.user.email, authCtrl.user.password)
                .then(function (userRes) {
                    $location.url('/');
                    console.log('__>> should sign user up with this info');
                    console.log(userRes);
                })
                .catch(function (error) {
                    authCtrl.error = error;
                    console.log('__>> ERROR: ' + error);
                });
        }
    }

    function CtrlProfileClass($location, md5, authRsv, profileRsv, $timeout) {
        var profileCtrl = this;
        profileCtrl.updateProfileFeedback = '';

        // this simply returns the username of the profile
        profileCtrl.profile = profileRsv;

        profileCtrl.updateProfile = function () {
            profileCtrl.profile.emailHash = md5.createHash(authRsv.email);
            profileCtrl.profile.$save();
            profileCtrl.updateProfileFeedback = 'Username saved ^_^';
            $timeout(function () {
                profileCtrl.updateProfileFeedback = '';
                $location.url('/ycombinator/channels');
            }, 1000);
        };
    }

    function CtrlChannelsClass(
        $location, ycAuthSer, ycUsersSer, profileRsv, channelsRsv, ycMessagesSer, ycChannelsSer
    ) {
        const channelsCtrl = this;
        channelsCtrl.messages = null;
        channelsCtrl.channelName = null;
        channelsCtrl.toDisplay = {
            createChannel: 'createChannel',
            messages: 'messages'
        };
        channelsCtrl.window = '';
        channelsCtrl.users = ycUsersSer.all;
        channelsCtrl.profile = profileRsv;
        // add online presence
        ycUsersSer.setOnline(channelsCtrl.profile.$id);
        channelsCtrl.channels = channelsRsv;
        channelsCtrl.newChannel = {name: ''};

        channelsCtrl.getDisplayName = ycUsersSer.getDisplayName;
        channelsCtrl.getGravatar = ycUsersSer.getGravatar;

        channelsCtrl.switchChannel = function (window) {
            channelsCtrl.window = window;
        };

        /**
         *  Will get messages for either the rooms' messages or direct messages with
         *  other users
         *
         * @param entityId string - could be either a channelID or a userID
         * @param messagesFor
         */
        channelsCtrl.getMessagesFor = function (entityId, messagesFor) {
            channelsCtrl.window = channelsCtrl.toDisplay.messages;

            if (messagesFor === 'forChannel') {
                channelsCtrl.channelName = ycChannelsSer.channels.$getRecord(entityId).name;

                ycMessagesSer.forChannel(entityId).$loaded().then(function (messages) {
                    channelsCtrl.messages = messages;
                })
            } else if (messagesFor === 'forUsers') {
                // get the other users display name
                channelsCtrl.channelName = ycUsersSer.getDisplayName(entityId);

                // the parameter order I'm passing in could be wrong ???
                ycMessagesSer.forUsers(entityId, channelsCtrl.profile.$id).$loaded()
                    .then(function (messages) {
                        channelsCtrl.messages = messages;
                    });
            }
        };

        channelsCtrl.sendMessage = function () {
            var message = channelsCtrl.message;
            var messageData = {
                uid: channelsCtrl.profile.$id,
                body: message,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            if (message.length > 0) {
                channelsCtrl.messages.$add(messageData).then(function () {
                    channelsCtrl.message = '';
                });
            }
        };

        channelsCtrl.createChannel = function () {
            channelsCtrl.channels.$add(channelsCtrl.newChannel)
                .then(function (ref) {
                    channelsCtrl.newChannel = {
                        name: ''
                    };
                    channelsCtrl.getMessagesFor(ref.key, 'forChannel');
                })
                .catch(function (error) {
                    console.log('__>> ERROR - unable to add a channel, error: ', error);
                });
        };

        channelsCtrl.logout = function () {
            channelsCtrl.profile.online = null;
            channelsCtrl.profile.$save().then(function () {
                ycAuthSer.auth.$signOut().then(function (res) {
                    console.log('__>> Firebase Response from signing out = ', res);
                    $location.url('/ycombinator/home');
                });
            });
        };
    }

    function CtrlMessagesClass(messagesRsv, channelNameRsv, profileRsv) {
        const messagesCtrl = this;
        const profile = profileRsv;

        messagesCtrl.messages = messagesRsv;
        messagesCtrl.channelName = channelNameRsv;
        messagesCtrl.message = '';

        messagesCtrl.sendMessage = function () {
            const message = messagesCtrl.message;
            const messageData = {
                uid: profile.uid,
                body: message,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            if (message.length > 0) {
                messagesCtrl.messages.$add(messageData).then(function () {
                    messagesCtrl.message = '';
                });
            }
        }
    }

    angular.module('edhubJobsApp')
        .factory('ycAuthSer', [
            '$firebaseAuth', SerAuthClass
        ])
        .factory('ycUsersSer', [
            '$firebaseArray', '$firebaseObject', SerUsersClass
        ])
        .factory('ycChannelsSer', [
            '$firebaseArray', SerChannelsClass
        ])
        .factory('ycMessagesSer', [
            '$firebaseArray', SerMessagesClass
        ])
        // CONTROLLERS
        .controller('ycAuthCtrl', [
            'ycAuthSer', '$location', CtrlAuthClass
        ])
        .controller('ycProfileCtrl', [
            '$location', 'md5', 'authRsv', 'profileRsv', '$timeout',
            CtrlProfileClass
        ])
        .controller('ycChannelsCtrl', [
            '$location', 'ycAuthSer', 'ycUsersSer', 'profileRsv', 'channelsRsv',
            'ycMessagesSer', 'ycChannelsSer', CtrlChannelsClass
        ])
        .controller('ycMessagesCtrl', [
            'messagesRsv', 'channelNameRsv', 'profileRsv', CtrlMessagesClass
        ])
    ;
}());;/**
 * Created by Julius Alvarado on 3/4/2019.
 */


(function () {
    "use strict";

    angular.module('edhubJobsApp').controller('YCombinatorLandingCtrl', [
        'edhubJobPostService', '$location', 'smoothScroll', 'OrgListSer',
        '$rootScope', LandingClass
    ]);

    function LandingClass(edhubJobPostService, $location, smoothScroll, OrgListSer, $rootScope) {
        const vm = this;
        vm.jobPostBg = "images/chalkboard3dArt1.png";
        vm.showVid = true;
        vm.ycombinatorMessage = "Talent Opportunities at Y Combinator";

        vm.apply2job = function (organizationName, postId) {
            $location.url('/apply/' + postId + '/' + organizationName);
        };

        vm.apply2org = function (orgInfo) {
            if ($rootScope.rootEdhubAuthUser) {
                $location.url('/apply/' + orgInfo.orgId + '/' + orgInfo.orgName);
            } else {
                 $location.url('/view-job/'+ orgInfo.orgId + '/' + orgInfo.orgName)
            }
        };

        vm.scroll2recentJobs = function () {
            var elem = document.getElementById("edhub-recent-jobs-landing-title");
            smoothScroll(elem);
        };

        activate();

        function activate() {
            OrgListSer.ycReadFromOrgFeed(5, 'timestamp').$loaded().then(function (data) {
                vm.orgFeed = data;
            }).catch(function (error) {
                console.error('edhub - Error: ', error);
            });
        }
    }

}());;/**
 * Created by Julius Alvarado on 12/23/2017.
 */

(function(){
    "use strict";

    angular.module('edhubJobsApp').controller('uiPracCtrl', [
        function () {
            const vm = this;
            vm.toggle = false;
            vm.togglePracNav = function(){
               vm.toggle = !vm.toggle;
               console.log("jha - sidediv should have toggled...");
            }
        }
    ]);
}());