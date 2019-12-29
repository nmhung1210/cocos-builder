class RTWebSocket extends window.WebSocket {
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
                qg.getFileSystemManager().accessSync(url);
            } catch (error) {
                console.warn("use default certificate .certificatePath is not exist in: ", url);
                certificatePath = undefined;
                break;
            }
            certificatePath = url;

        } while (0);
        super(wss, protocols, certificatePath);
    }
}

delete window.WebSocket;
window.WebSocket = RTWebSocket;
delete window.RTWebSocket;
