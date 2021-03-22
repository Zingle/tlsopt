const {promisify} = require("util");
const fs = require("fs");
const http = require("http");
const https = require("https");
const {constants: {SSL_OP_NO_TLSv1, SSL_OP_NO_TLSv1_1}} = require("crypto");
const readFile = promisify(fs.readFile);
const secureOptions = SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1

/**
 * Read TLS options from command-line or environment, load certificates from
 * filesystem, and create either an http or https server based on those options.
 * Strips command-line options which are used.
 * @param {object} [options]
 * @param {function} [requestListener]
 * @returns {http.Server|https.Server}
 */
function createServerSync(options, requestListener) {
    if (typeof options === "function" && !requestListener) {
        [requestListener, options] = [options, {}];
    }

    const tlsopts = readSync();
    const web = tlsopts ? https : http;
    const server = web.createServer({...options, ...tlsopts}, requestListener);

    server.tls = Boolean(tlsopts);

    return server;
}

/**
 * Read TLS options from command-line or environment and load certificates from
 * filesystem.  Strip command-line opts unless preserve is truthy.
 * @param {boolean} preserve
 * @returns {object}
 */
async function read(preserve) {
    const tlsopts = readTLSOpts(preserve);

    if (tlsopts) {
        for (const key in tlsopts) {
            tlsopts[key] = await readFile(tlsopts[key]);
        }

        tlsopts.secureOptions = secureOptions;
    }

    return tlsopts;
}

/**
 * Read TLS options from command-line or environment and load certificates from
 * filesystem.  Strip command-line opts unless preserve is truthy.
 * @param {boolean} preserve
 * @returns {object}
 */
function readSync(preserve) {
    const tlsopts = readTLSOpts(preserve);

    if (tlsopts) {
        for (const key in tlsopts) {
            tlsopts[key] = fs.readFileSync(tlsopts[key]);
        }

        tlsopts.secureOptions = secureOptions;
    }

    return tlsopts;
}

module.exports = {createServerSync, read, readSync};

/**
 * Read TLS options from command-line or environment.  Strip command-line opts
 * unless preserve is truthy.
 * @param {boolean} preserve
 * @returns {object}
 */
function readTLSOpts(preserve) {
    const {TLS_CERT, TLS_CA, TLS_KEY} = process.env;
    const opt = opt => readOpt(opt, preserve);
    const [cert, ca, key] = ["--tls-cert", "--tls-ca", "--tls-key"].map(opt);

    if (cert) {
        return normalize(cert, key, ca);
    } else if (TLS_CERT) {
        return normalize(TLS_CERT, TLS_KEY, TLS_CA);
    } else {
        return null;
    }
}

/**
 * Normalize positional TLS opts into an options object.
 * @param {string} cert
 * @param {string} key
 * @param {string} ca
 * @returns {object}
 */
function normalize(cert, key, ca) {
    if (cert && key && ca) {
        return {cert, key, ca};
    } else if (cert && key) {
        return {cert, key};
    } else if (cert) {
        return {pfx: cert};
    } else {
        return null;
    }
}

/**
 * Read long-option value from CLI arguments.  Strip option from arguments
 * unless preserve is truthy.
 * @param {string} option
 * @param {boolean} [preserve]
 * @returns {string}
 */
function readOpt(option, preserve) {
    for (let i = 0, len = process.argv.length; i < len; i++) {
        if (process.argv[i] === option) {
            return preserve ? process.argv[++i] : process.argv.splice(i--, 2)[1];
        } else if (process.argv[i].indexOf(`${option}=`) === 0) {
            const arg = preserve ? process.argv[i] : process.argv.splice(i--, 1)[0];
            return arg.slice(option.length + 1);
        }
    }
}
