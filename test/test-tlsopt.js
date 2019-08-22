const expect = require("expect.js");
const mockfs = require("mock-fs");
const http = require("http");
const https = require("https");
const {constants: {SSL_OP_NO_TLSv1}} = require("crypto");
const tlsopt = require("..");
const keys = Object.keys;

describe("read([boolean])", () => {
    let argv, env;

    beforeEach(() => {
        mockfs({
            "dir/cert.file": "cert",
            "dir/key.file": "key",
            "dir/ca.file": "ca"
        });

        argv = process.argv;
        env = process.env;

        process.argv = ["node", "script"];
        process.env = {};
    });

    afterEach(() => {
        mockfs.restore();
        process.argv = argv;
        process.env = env;
    });

    it("should return null if TLS options aren't found", async () => {
        expect(await tlsopt.read()).to.be(null);
    });

    it("should read TLS options from CLI args", async () => {
        process.argv.push("--tls-cert", "dir/cert.file");   // space-delimited
        process.argv.push("--tls-key=dir/key.file");        // equals-delimited
        process.argv.push("--tls-ca", "dir/ca.file");       // space-delimited

        const result = await tlsopt.read();

        expect(result).to.be.an("object");
        expect(result.cert).to.be.a(Buffer);
        expect(result.ca).to.be.a(Buffer);
        expect(result.key).to.be.a(Buffer);
        expect(result.cert.toString()).to.be("cert");
        expect(result.ca.toString()).to.be("ca");
        expect(result.key.toString()).to.be("key");
    });

    it("should read TLS options from environment", async () => {
        process.env.TLS_CERT = "dir/cert.file";
        process.env.TLS_KEY = "dir/key.file";
        process.env.TLS_CA = "dir/ca.file";

        const result = await tlsopt.read();

        expect(result).to.be.an("object");
        expect(result.cert).to.be.a(Buffer);
        expect(result.ca).to.be.a(Buffer);
        expect(result.key).to.be.a(Buffer);
        expect(result.cert.toString()).to.be("cert");
        expect(result.ca.toString()).to.be("ca");
        expect(result.key.toString()).to.be("key");
    });

    it("should assume PFX if no key is provided", async () => {
        process.env.TLS_CERT = "dir/cert.file";

        const result = await tlsopt.read();

        expect(result).to.be.an("object");
        expect(result.pfx).to.be.a(Buffer);
        expect(result.pfx.toString()).to.be("cert");
    });

    it("should disable TLSv1", async () => {
        process.env.TLS_CERT = "dir/cert.file";

        const result = await tlsopt.read();

        expect(result.secureOptions).to.be(SSL_OP_NO_TLSv1);
    });

    it("should strip processed CLI arguments", async () => {
        expect(process.argv.length).to.be(2);

        process.argv.push("--tls-cert=dir/cert.file");
        process.argv.push("--tls-key=dir/key.file");
        process.argv.push("foo");
        process.argv.push("--tls-ca=dir/ca.file");

        const result = await tlsopt.read();

        expect(process.argv.length).to.be(3);
        expect(process.argv.includes("--tls-cert=dir/cert.file")).to.be(false);
        expect(process.argv.includes("--tls-key=dir/key.file")).to.be(false);
        expect(process.argv.includes("--tls-ca=dir/ca.file")).to.be(false);
        expect(process.argv.includes("foo")).to.be(true);
    });

    it("should preserve CLI arguments if true is passed", async () => {
        expect(process.argv.length).to.be(2);

        process.argv.push("--tls-cert=dir/cert.file");
        process.argv.push("foo");

        const result = await tlsopt.read(true);

        expect(process.argv.length).to.be(4);
        expect(process.argv.includes("--tls-cert=dir/cert.file")).to.be(true);
        expect(process.argv.includes("foo")).to.be(true);
    });

    it("should prefer CLI arg to environment variables", async () => {
        process.argv.push("--tls-cert=dir/cert.file");
        process.env.TLS_CERT = "dir/missing.file";

        const result = await tlsopt.read();

        expect(result).to.be.an("object");
        expect(result.pfx).to.be.a(Buffer);
        expect(result.pfx.toString()).to.be("cert");
    });
});

describe("readSync([boolean])", () => {
    let env;

    beforeEach(() => {
        mockfs({
            "dir/cert.file": "cert",
            "dir/key.file": "key",
            "dir/ca.file": "ca"
        });

        env = process.env;
        process.env = {};
    });

    afterEach(() => {
        mockfs.restore();
        process.env = env;
    });

    it("should be synchronous version of read", async () => {
        process.env.TLS_CERT = "dir/cert.file";
        process.env.TLS_KEY = "dir/key.file";
        process.env.TLS_CA = "dir/ca.file";

        const syncOpts = tlsopt.readSync(true);
        const asyncOpts = await tlsopt.read(true);

        expect(syncOpts.cert.toString()).to.be(asyncOpts.cert.toString());
        expect(syncOpts.key.toString()).to.be(asyncOpts.key.toString());
        expect(syncOpts.ca.toString()).to.be(asyncOpts.ca.toString());
        expect(syncOpts.secureOptions).to.be(asyncOpts.secureOptions);
    });
});
