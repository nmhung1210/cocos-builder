var os = require('os');
var getHostIp = function () {
    const ifaces = os.networkInterfaces();
    let result;

    for (const prop in ifaces) {
        if (Object.prototype.hasOwnProperty.call(ifaces, prop)) {
            const iface = ifaces[prop];

            iface.every((eachAlias, j, all) => {
                if (eachAlias.family === 'IPv4' && !eachAlias.internal && eachAlias.address !== '127.0.0.1') {
                    result = eachAlias;
                    return false;
                }
                return true;
            })

            if (result !== undefined) {
                break;
            }
        }
    }

    if (typeof result === 'undefined') {
        return undefined;
    }
    return result.address;

}

let network = {
    getHostIp
}
module.exports = network;