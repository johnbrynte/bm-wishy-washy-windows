/**
 * WebView part of the API-calling system
 * @return {[type]} [description]
 */
(function() {
    var WebViewAPI = function() {

        this.setUp();
    };

    WebViewAPI.prototype.setUp = function() 
    {
        console.log("WebView setting up ");
        this.ws = io.connect('wss://genericwitticism.com:8000');
        console.log("attempting connect");
        //this.ws.connect();

        //this.ws = new WebSocket('wss://127.0.0.1:8000');
        console.log("attmepting ws.on error");
        this.ws.on('error', function(evt) {
            console.error(evt);
            console.log("WS ERROR");
            console.dir(evt);
            //debugger;
        });

        console.log("attmepting ws.on message");
        this.ws.on('message', function(evt) 
        {
            //console.log("WebViewAPI got socket message..");
            //console.dir(evt);
            var cocoonJSAPIString = 'window.cocoonJSAPI.recieveAPIResponse(', cocoonJSAPIEndString = ');';
            var data = JSON.parse(evt);
            // Assume this is how PING/PONG works :S
            if (data.type === 'PING') 
            {
                console.debug('PING/PONG!');
                this.ws.emit('message', JSON.stringify(
                {
                    'type': 'PONG',
                    'message': 'pong'
                }));
                return;
            }

            // No need to respond to welcome message from server.
            if (data.type === 'WELCOME') 
            {
                return;
            }

            // Forward to CocoonJSAPI
            var sendString = cocoonJSAPIString +
                JSON.stringify(data) +
                cocoonJSAPIEndString;

            CocoonJS.App.forward(sendString);

        }.bind(this));
        
        
        console.log("attmepting ws.on connect");
        this.ws.on('open', function() 
        {
            console.debug("Socket opened!");
        });
              

        this.ws.on('close', function() {
            console.debug('Socket closed!');
        });


        return this;
    };

    WebViewAPI.prototype.setSessionID = function(sessionID) {
        this.sessionID = sessionID;
    };

    /*!
     * Called from CocoonJSAPI
     * @param commandObj [Object] Should look like this with
     *                         these exact keys:
     *                         var commandObj = {
     *                              command: "gethighscores",
     *                              arg: "",
     *                              arg2: "",
     *                              mid: 1337
     *                         };
     */
    WebViewAPI.prototype.sendAPIRequest = function(commandObj) {
        //console.log('(WebViewAPI.js) ' + 'sendAPIRequest: ' + commandObj.command);
        var msg = {
            'type': 'API3',
            'timestamp': '', // TODO
            'destination': 'server',
            'session': this.sessionID || '4711',
            'message': commandObj
        };

        this.ws.emit('message', JSON.stringify(msg));
    };


    CocoonJS.App.proxifyConsole();
    window.webViewAPI = new WebViewAPI();
    //window.webViewAPI.setup();
})();