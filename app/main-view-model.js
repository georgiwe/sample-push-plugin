var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var observable = require("data/observable");
var Everlive = require('everlive-sdk');

var MainViewModel = (function (_super) {
    __extends(MainViewModel, _super);
    function MainViewModel() {
        var self = this;

		self.everlive = new Everlive({
			appId: '<ENTER_YOUR_API_KEY_HERE>',
			scheme: 'https'
		});

        _super.call(self);

        //Set default values for buttons and messages.
        self.set("headerText", "Welcome to Telerik Backend Services push notifications Native Script sample app.");
        self.set("registrationMessage", "Tap the button to enable push notifications on this device.");
        self.set("buttonText", "Enable Notifications");

        //On token refresh call register again to obtain the new token.
        //pushPlugin.onTokenRefresh(function () {
        //    pushPlugin.register(context, '11111111', function (data){
        //        self.set("registrationMessage", "Device Registration Refreshed!");
        //    });
        //});

        //Callback for device registration success
        self._deviceRegistrationSuccess = function () {
            self.set("isLoading",false);
            self.disableButton = false;

            self.isDeviceRegistered = true;
            self.set("buttonText", "Disable Notifications");
            self.set("headerText", "Successful registration for push notifications!");
            self.set("registrationMessage", "This device has been initialized for push notifications and is now registered in Telerik Backend Services.");

        };
        //Callback for device registration error
        self._deviceRegistrationError = function (error) {
            self.set("isLoading",false);
            self.disableButton = false;

            self.set("headerText", "Registration not successful!");
            self.set("registrationMessage", "Error while registering: " + JSON.stringify(error));
            self.set("buttonText", "Enable Notifications");

            console.log(error);
        };

        //Callback for device unregister success.
        self._unregisterDeviceSuccess = function() {
            self.isDeviceRegistered = false;
            self.disableButton = false;
            self.set("isLoading", false);

            self.set("buttonText", "Enable Notifications");
            self.set("headerText", "Device unregistered successfully!");
            self.set("registrationMessage", "Push token was invalidated and the device was unregistered from Telerik Backend Services. No push notifications will be received.");
        };

        //Callback for device unregister error.
        self._unregisterDeviceError = function(error) {
            self.isDeviceRegistered = false;
            self.disableButton = false;
            self.set("isLoading",false);

            self.set("buttonText", "Disable Notifications");
            self.set("headerText", "Could not unregister device!");
            self.set("registrationMessage", "Error while unregestering device: " + JSON.stringify(error));
        };

        // Configure the Push Notifications settings - for iOS and for Android
        self.pushSettings = {
            //iOS - specific settings
            iOS: {
                badge: true,
                sound: true,
                alert: true
            },
            notificationCallbackIOS: function(userInfo) {
                self.showReceivedPushMessage(JSON.stringify(userInfo.alert));
            },
            //Android - specific settings
            android: {
                projectNumber: '<ENTER_YOUR_PROJECT_NUMBER>'
            },
            notificationCallbackAndroid: function callback(data) {
                //Remove undeeded quotes
                var message = JSON.stringify(data);
                if (message.charAt(0) === '"' && message.charAt(message.length - 1) === '"') {
                    message = message.substr(1, message.length - 2);
                }
                
                self.showReceivedPushMessage(message);
            }
        };
    }

    MainViewModel.prototype.registerDevice = function () {
        this.set("buttonText", "Loading...");
        this.set("registrationMessage", "Registering device...");
        this.set("isLoading", true);
        this.disableButton = true;

        //Call the everlive register for push method
        this.everlive.push.register(this.pushSettings, this._deviceRegistrationSuccess, this._deviceRegistrationError);
    };

    MainViewModel.prototype.unregisterDevice = function () {
        this.set("buttonText", "Loading...");
        this.set("registrationMessage", "Unregistering device...");

        this.set("isLoading",true);
        this.disableButton = true;

        this.everlive.push.unregister(this._unregisterDeviceSuccess, this._unregisterDeviceError);
    };

    MainViewModel.prototype.registrationTapAction = function () {
        this.set('notificationMsg', false);
        if (!this.isLoading) {
            var updateDeviceRegistration = this.isDeviceRegistered ? this.unregisterDevice : this.registerDevice;
            updateDeviceRegistration.call(this);
        }
    };

    MainViewModel.prototype.showReceivedPushMessage = function (message) {
        if (message.length > 150) {
            message = message.substring(0, 150) + '...';
        }
        
        this.set('notificationMsg', message);
        this.set('notificationMsgTimestamp', new Date().toLocaleString());
    };

    return MainViewModel;
})(observable.Observable);

exports.mainViewModel = new MainViewModel();
