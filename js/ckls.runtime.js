var cklsRuntime = function () {
    // PRIVATE
    var self = this;
    var sessionId = null;
    var url = null;
    
    // PUBLIC
    self.serverUri = null;
    
    // PRIVATE METHODS
    function sendRequest(args) {
        //$.ajax(args);

        // TMP WITH HUB AS A PROXY
        var parameters = args.data;
        args.data = {
            parameters: parameters,
            url: args.url,
            method: args.type,
            EasyquizzServerSID: sessionId
        };

        args.type = "POST";
        args.url = self.serverUri.toUriString() + "/hub/Modules/CKLSAPI/Proxy";
        args.data = JSON.stringify(args.data);

        $.ajax(args);
    }

    // PUBLIC METHODS    
    self.init = function(rawUrl) {
        var uri = self.utils.convertUrlToUri(rawUrl);
        self.serverUri = uri
    }
    
    self.connect = function (instanceUrl, login, password) {
        var dfd = jQuery.Deferred();

        sendRequest({
            type: "POST",
            url: instanceUrl + "/API/v1/REST/Learner/login.json",
            dataType: "json",
            data: {
                login: login,
                password: password
            },
            success: function (data) {
                sessionId = data.value.session_id;
                url = instanceUrl;
                dfd.resolve(data);
            },
            error: function (data) {
                dfd.reject(data);
            }
        });

        return dfd.promise();
    }

    self.mobileLogin = function () {

    }

    self.ssoConnect = function (instanceUrl, instanceName, apiKey, learnerLogin) {
        var dfd = jQuery.Deferred();

        $.ajax({
            type: "POST",
            url: self.serverUri.toUriString() + "/hub/Modules/CKLSAPI/Login",
            dataType: "json",
            data: JSON.stringify({
                instanceName: instanceName,
                apiKey: apiKey,
                learnerLogin: learnerLogin
            }),
            success: function (data) {
                sessionId = data.sessionId;
                url = instanceUrl;
                dfd.resolve(data);
            },
            error: function (data) {
                dfd.reject(data);
            }
        });

        return dfd.promise();
    }

    self.mobileRegister = function (token) {
        var dfd = jQuery.Deferred();

        $.ajax({
            type: "POST",
            url: self.serverUri.toUriString() + "/hub/Modules/CKLSAPI/MobileLogin",
            dataType: "json",
            data: JSON.stringify({
                token: token
            }),
            success: function (data) {
                if (data.message == "Success") {
                    dfd.resolve({
                        instanceUrl: data.value.instanceUrl,
                        login: data.value.learnerLogin,
                        password: data.value.password
                    });
                }
                else {
                    dfd.reject(data);
                }
            },
            error: function (data) {
                dfd.reject(data);
            }
        });

        return dfd.promise();
    }

    self.mobileConnect = function (instanceUrl, login, password, deviceid) {
        var dfd = jQuery.Deferred();

        sendRequest({
            url: instanceUrl + "API/v1/REST/Learner/mobileLogin.json",
            data: {
                login: login,
                password: password,
                deviceid: deviceid
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                sessionId = data.sessionId;
                url = instanceUrl;
                dfd.resolve(data);
            },
            error: function (data) {
                dfd.reject(data);
            }
        });

        return dfd.promise();
    }

    self.ensureLogin = function () {
        return sessionId != null;
    }

    self.getLearnerInfo = function (learnerLogin) {
        var dfd = jQuery.Deferred();

        if (self.ensureLogin()) {
            sendRequest({
                url: url + "API/v1/REST/Learner/profile.json",
                data: {
                    learnerLogin: learnerLogin
                },
                dataType: 'json',
                type: 'GET',
                success: function (data) {
                    dfd.resolve(data);
                },
                error: function (data) {
                    dfd.reject(data);
                }
            });
        }
        else {
            dfd.reject({ message: "You are not logged." });
        }

        return dfd.promise();
    }

    self.getLearningObjects = function (args) {
        var dfd = jQuery.Deferred();

        sendRequest({
            url: url + "API/v1/REST/LearningObjects/list.json",
            data: args,
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                dfd.resolve(data);
            },
            error: function (data) {
                dfd.reject(data);
            }
        });

        return dfd.promise();
    }

    self.getLearningObject = function (id, locale) {
        var dfd = jQuery.Deferred();

        sendRequest({
            url: url + "API/v1/REST/LearningObjects/" + id + ".json",
            data: {
                locale: locale
            },
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                dfd.resolve(data);
            },
            error: function (data) {
                dfd.reject(data);
            }
        });

        return dfd.promise();
    }

    self.rateLearningObject = function (id, rate) {
        var dfd = jQuery.Deferred();

        sendRequest({
            url: url + "API/v1/REST/LearningObjects/" + id + ".json",
            data: {
                vote: rate
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                dfd.resolve(data);
            },
            error: function (data) {
                dfd.reject(data);
            }
        });

        return dfd.promise();
    }

    self.setLearningObjectProgression = function (id, registrationGuid, progression, totalTimeSpent) {
        var dfd = jQuery.Deferred();

        sendRequest({
            url: url + "API/v1/REST/Trackings/item.json",
            data: {
                itemId: id,
                registrationGuid: registrationGuid,
                progression: progression,
                totalTimeSpent: totalTimeSpent,
                firstLaunchTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                dfd.resolve(data);
            },
            error: function (data) {
                dfd.reject(data);
            }
        });

        return dfd.promise();
    }

    self.getTrainings = function (args) {
        var dfd = jQuery.Deferred();

        sendRequest({
            url: url + "API/v1/REST/Trainings/list.json",
            data: args,
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                dfd.resolve(data);
            },
            error: function (data) {
                dfd.reject(data);
            }
        });

        return dfd.promise();
    }

    self.getTrainingSessions = function (args) {
        var dfd = jQuery.Deferred();

        sendRequest({
            url: url + "API/v1/REST/TrainingSessions/list.json",
            data: args,
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                dfd.resolve(data);
            },
            error: function (data) {
                dfd.reject(data);
            }
        });

        return dfd.promise();
    }

    // PUBLIC UTILS
    self.utils = {
        convertUrlToUri: function (url) {
            var a = document.createElement('a');
            a.href = url;

            //FIX IE10 => a.pathname truncate the starting '/'
            var pathname = a.pathname;
            if (pathname.substr(0, 1) != "/") { pathname = "/" + pathname }

            return {
                host: a.host,
                hostname: a.hostname,
                pathname: pathname,
                port: a.port,
                protocol: a.protocol,
                search: a.search,
                hash: a.hash,
                toUriString: function () {
                    return this.protocol + "//" + this.host;
                },
                parseParams: function () {
                    var p = [];
                    if (this.search != "") {
                        var s = this.search.substring(1);
                        var a = s.split('&');
                        for (var i = 0; i < a.length; i++) {
                            var b = a[i].split('=');
                            p[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
                        }
                    }
                    return p;
                }
            };
        }
    }

    return self;
}