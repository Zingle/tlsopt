tlsopt
======
Load TLS certificates from file system automatically based on CLI options or
environment variables.

Environment Variables
---------------------

### TLS_CERT
The `TLS_CERT` environment variable specifies the path to the primary
certificate file.  If `TLS_KEY` is not also specified, the resulting options
object will have its `pfx` property set.  If `TLS_KEY` is also specified, the
resulting options object will have its `cert` property set.  If the `--tls-cert`
CLI option was passed, this environment variable is ignored.

### TLS_KEY
The `TLS_KEY` environment variable specifies the path to the private key for
the `TLS_CERT` public certificate.  If `TLS_CERT` is not being used, this
environment variable is ignored.

### TLS_CA
The `TLS_CA` environment variable specifies the path to an intermediate
certificate authority file for the `TLS_CERT` and `TLS_KEY`.  If `TLS_CERT` or
`TLS_KEY` is not being used, this environment variable is ignored.

CLI Options
-----------

### --tls-cert
The `--tls-cert` CLI option specifies the path to the primary certificate file.
If `--tls-key` is not also specified, the resulting options object will have its
`pfx` property set.  If `--tls-key` is also specified, the resulting options
object will have its `cert` property set.  This overrides the `TLS_CERT`
environment variable.

### --tls-key
The `--tls-key` CLI option specifies the path to the private key for the
`--tls-cert` public certificate.  If `--tls_cert` is not being used, this CLI
option is ignored.

### --tls-ca
The `--tls-ca` CLI option specifies the path to an intermediate certificate
authority file for the `--tls-cert` and `--tls-key`.  If `--tls_cert` or
`--tls-key` is not being used, this CLI option is ignored.

Usage
-----

**Synchronous Example**

```js
const tlsopt = require("tlsopt");
const https = require("https");
const server = https.createServer(tlsopt.readSync());
```

**Asynchronous Example**

```js
const tlsopt = require("tlsopt");
const https = require("https");

tlsopt.read().then(opts => {
    const server = https.createServer(opts);
});
```

**Create Server Example**

```js
const tlsopt = require("tlsopt");
const server = tlsopt.createServerSync();
const port = server.tls ? 443 : 80;

server.listen(port);
```
