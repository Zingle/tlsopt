const fs = require("fs");
const keys = Object.keys;
const { constants } = require('crypto');

/**
 * Read TLS options from filesystem synchronously.  Paths are read from CLI
 * options or environment variables.
 * @returns {object}
 */
function readSync() {
    const TLS_CERT = process.env.TLS_CERT;
    const TLS_KEY = process.env.TLS_KEY;
    const TLS_CA = process.env.TLS_CA;
    const tls_cert = readOpt("--tls-cert");
    const tls_key = readOpt("--tls-key");
    const tls_ca = readOpt("--tls-ca");
    const result = {
        secureOptions: constants.SSL_OP_NO_TLSv1
    };    

    if (tls_cert) {
        if (tls_key) {
            result.cert = fs.readFileSync(tls_cert);
            result.key = fs.readFileSync(tls_key);

            if (tls_ca) {
                result.ca = fs.readFileSync(tls_ca);
            }
        } else {
            result.pfx = fs.readFileSync(tls_cert);
        }
    } else if (TLS_CERT) {
        if (TLS_KEY) {
            result.cert = fs.readFileSync(TLS_CERT);
            result.key = fs.readFileSync(TLS_KEY);

            if (TLS_CA) {
                result.ca = fs.readFileSync(TLS_CA);
            }
        } else {
            result.pfx = fs.readFileSync(TLS_CERT);
        }
    }

    return result;
}

/**
 * Read TLS options from filesystem asynchronously.  Paths are read from CLI
 * options or environment variables.
 * @returns {Promise}
 */
function read() {
    const TLS_CERT = process.env.TLS_CERT;
    const TLS_KEY = process.env.TLS_KEY;
    const TLS_CA = process.env.TLS_CA;
    const tls_cert = readOpt("--tls-cert");
    const tls_key = readOpt("--tls-key");
    const tls_ca = readOpt("--tls-ca");
    const result = {};

    if (tls_cert) {
        if (tls_key) {
            result.cert = readFile(tls_cert);
            result.key = readFile(tls_key);

            if (tls_ca) {
                result.ca = readFile(tls_ca);
            }
        } else {
            result.pfx = readFile(tls_cert);
        }
    } else if (TLS_CERT) {
        if (TLS_KEY) {
            result.cert = readFile(TLS_CERT);
            result.key = readFile(TLS_KEY);

            if (TLS_CA) {
                result.ca = readFile(TLS_CA);
            }
        } else {
            result.pfx = readFile(TLS_CERT);
        }
    }

    return Promise.all(keys(result).map(key => result[key].then(data => {
        return result[key] = data;
    }))).then(() => result);
}

module.exports = {read, readSync};

/**
 * Read long-option value from CLI arguments.
 * @param {string} option
 * @returns {string}
 */
function readOpt(option) {
    const prefix = `${option}=`;

    for (let i = 0, len = process.argv.length, arg; i < len; i++) {
        arg = process.argv[i];

        if (arg === option) {
            return process.argv[i+1];
        } else if (arg.indexOf(prefix) === 0) {
            return arg.substr(prefix.length);
        }
    }
}

/**
 * Read file asynchronously.
 * @param {string} path
 * @returns {Promise}
 */
function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}
