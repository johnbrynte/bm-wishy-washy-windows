/**
 *  CocoonJSAPI.js
 */
(function() {

    const sentTooManyUnansweredRequestsLimit = 20;

    var CocoonJSAPI = function() {
        this.callbacks = {};
        this.mid = 1;
        this.sendTooManyEventListeners = [];
    };

    CocoonJSAPI.prototype.onSentTooManyUnansweredRequests = function(
        eventListener) {
        this.sendTooManyEventListeners.push(eventListener);
    };

    /* Sets the session ID in WebView. */
    CocoonJSAPI.prototype.setSessionID = function(sessionID) {
        CocoonJS.App.forward('window.webViewAPI.setSessionID(\'' +
            sessionID +
            '\');');
    };

    /*!
     * Almost analogous with WebViewAPI.
     *
     * @param commandObj [Object] Should look like this with
     *                         these exact keys:
     *                         var commandObj = {
     *                              command: "gethighscores",
     *                              arg: "",
     *                              arg2: ""
     *                         };
     */
    CocoonJSAPI.prototype.sendAPIRequest = function(commandObj, callback) {
        var sendCommandString = 'window.webViewAPI.sendAPIRequest(',
            sendCommandStringEnd = ');',
            i = 0,
            sendString = '';

        this.callbacks[this.mid] = callback;

        commandObj.mid = this.mid;

        sendString = sendCommandString +
            JSON.stringify(commandObj) +
            sendCommandStringEnd;

        // Forward to WebViewAPI
        //console.log('(CocoonJSAPI.js)', 'Forwarded string:', sendString);
        CocoonJS.App.forward(sendString);

        this.mid = this.mid + 1; // increment mid

        // Fire Event if necessary
        if (this.callbacks.keys && this.callbacks.keys.length >
            sentTooManyUnansweredRequestsLimit) {
            for (; i < this.sendTooManyEventListeners.length; i++) {
                this.sendTooManyEventListeners[i]();
            }
        }
    };

    /*
        Called from the WebView.
     */
    CocoonJSAPI.prototype.recieveAPIResponse = function(data) {

        // TODO handle messages without mid ? like WELCOME
        //console.log("recieveAPIResponse... mid = "+data.mid);
        //console.dir(data.message);
        if (!data.message) {
            console.debug("Got wierd ws message: ");
            console.debug(data);
            return;
        }
        if (!data.message.mid) {
            console.debug("Got wierd ws message: ");
            console.debug(data);
            return;
        }
        if (this.callbacks[data.message.mid]) {
            this.callbacks[data.message.mid](data.message);
        }

        delete this.callbacks[data.message.mid]; // Done with callback, delete it

    };
    window.cocoonJSAPI = new CocoonJSAPI();
})();