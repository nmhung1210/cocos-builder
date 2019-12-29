let originWebSocket = window.WebSocket;
class RTWebSocket {

    constructor(wss, protocols, certificatePath) {

        do {
            if (typeof certificatePath !== 'string') {
                break;
            }

            //md5
            var md5Pipe = cc.loader.md5Pipe;
            if (md5Pipe) {
                certificatePath = md5Pipe.transformURL(certificatePath);
            }

            // tiny package
            if (typeof window.rtAdapter === "undefined" || typeof window.rtAdapter.REMOTE_SERVER_ROOT === "undefined") {
                break;
            }

            let cachedPath = rtAdapter.getCacheName(certificatePath);
            let url = rtAdapter.cacheDir + '/' + cachedPath;
            try {
                rt.getFileSystemManager().accessSync(url);
            } catch (error) {
                console.warn("use default certificate .certificatePath is not exist in: ", url);
                certificatePath = undefined;
                break;
            }
            certificatePath = url;

        } while (0);

        this._rtWebSocket = new originWebSocket(wss, protocols, certificatePath);
    }

    send(...args) {
        this._rtWebSocket.send(...args);
    }

    close(...args) {
        this._rtWebSocket.close(...args);
    }

    get readyState() {
        return this._rtWebSocket.readyState;
    }


    get bufferedAmount() {
        return this._rtWebSocket.bufferedAmount;
    }

    get extensions() {
        return this._rtWebSocket.extensions;
    }

    get onmessage() {
        return this._rtWebSocket.onmessage;
    }

    get onopen() {
        return this._rtWebSocket.onopen;
    }
    get protocol() {
        return this._rtWebSocket.protocol;
    }

    set onmessage(value) {
        this._rtWebSocket.onmessage = value;
    }

    set onopen(value) {
        this._rtWebSocket.onopen = value;
    }
    set protocol(value) {
        this._rtWebSocket.protocol = value;
    }
    set extensions(value) {
        this._rtWebSocket.extensions = value;
    }

    get binaryType() {
        return this._rtWebSocket.binaryType;
    }

    set binaryType(value) {
        this._rtWebSocket.binaryType = value;
    }

    set onerror(value) {
        this._rtWebSocket.onerror = value;
    }

    get onerror() {
        return this._rtWebSocket.onerror;
    }

    set onclose(value) {
        this._rtWebSocket.onclose = value;
    }

    get onclose() {
        return this._rtWebSocket.onclose;
    }

}

Object.defineProperties(RTWebSocket, {
    'CONNECTING': {
        value: originWebSocket.CONNECTING
    },
    'OPEN': {
        value: originWebSocket.OPEN
    },
    'CLOSING': {
        value: originWebSocket.CLOSING
    },
    'CLOSED': {
        value: originWebSocket.CLOSED
    }
});


delete window.WebSocket;
window.WebSocket = RTWebSocket;
