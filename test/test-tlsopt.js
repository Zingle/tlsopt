const expect = require("expect.js");
const mockfs = require("mock-fs");
const tlsopt = require("..");
const keys = Object.keys;

describe("readSync()", () => {
    describe("(no env vars; no CLI args)", () => {
        it("should return empty object", () => {
            expect(tlsopt.readSync()).to.be.an("object");
            expect(keys(tlsopt.readSync()).length).to.be(0);
        });
    });

    describe("(with env vars; no CLI args)", () => {
        var env;

        beforeEach(() => {
            mockfs({
                "dir/cert.file": "cert",
                "dir/ca.file": "ca",
                "dir/key.file": "key"
            });

            env = process.env;

            process.env = {
                TLS_CERT: "dir/cert.file",
                TLS_CA: "dir/ca.file",
                TLS_KEY: "dir/key.file"
            }
        });

        afterEach(() => {
            mockfs.restore();
            process.env = env;
        });

        it("should load certs from filesystem based on env vars", () => {
            const result = tlsopt.readSync();

            expect(result).to.be.an("object");
            expect(result.cert).to.be.a(Buffer);
            expect(result.ca).to.be.a(Buffer);
            expect(result.key).to.be.a(Buffer);
            expect(result.cert.toString()).to.be("cert");
            expect(result.ca.toString()).to.be("ca");
            expect(result.key.toString()).to.be("key");
        });
    });

    describe("(no env vars; with CLI args)", () => {
        var argv;

        beforeEach(() => {
            mockfs({
                "dir/cert.file": "cert",
                "dir/ca.file": "ca",
                "dir/key.file": "key"
            });

            argv = process.argv;

            process.argv = [
                "node", "script",
                "--tls-cert", "dir/cert.file",  // argument separated by space
                "--tls-ca", "dir/ca.file",      // argument separated by space
                "--tls-key=dir/key.file"        // argument assign with equals
            ];
        });

        afterEach(() => {
            mockfs.restore();
            process.argv = argv;
        });

        it("should load certs from filesystem based on CLI opts", () => {
            const result = tlsopt.readSync();

            expect(result).to.be.an("object");
            expect(result.cert).to.be.a(Buffer);
            expect(result.ca).to.be.a(Buffer);
            expect(result.key).to.be.a(Buffer);
            expect(result.cert.toString()).to.be("cert");
            expect(result.ca.toString()).to.be("ca");
            expect(result.key.toString()).to.be("key");
        });
    });

    describe("(with env vars; with CLI args)", () => {
        var argv, env;

        beforeEach(() => {
            mockfs({
                "dir/cert.file": "cert",
                "dir/ca.file": "ca",
                "dir/key.file": "key"
            });

            argv = process.argv;
            env = process.env;

            process.argv = [
                "node", "script",
                "--tls-cert", "dir/cert.file",  // argument separated by space
                "--tls-ca", "dir/ca.file",      // argument separated by space
                "--tls-key=dir/key.file"        // argument assign with equals
            ];

            process.env = {
                TLS_CERT: "dir/other.file",
                TLS_CA: "dir/other.file",
                TLS_KEY: "dir/other.file"
            }
        });

        afterEach(() => {
            mockfs.restore();
            process.argv = argv;
            process.env = env;
        });

        it("should load certs from filesystem based on CLI opts", () => {
            const result = tlsopt.readSync();

            expect(result).to.be.an("object");
            expect(result.cert).to.be.a(Buffer);
            expect(result.ca).to.be.a(Buffer);
            expect(result.key).to.be.a(Buffer);
            expect(result.cert.toString()).to.be("cert");
            expect(result.ca.toString()).to.be("ca");
            expect(result.key.toString()).to.be("key");
        });
    });
});

describe("read()", () => {
    var env, promise;

    beforeEach(() => {
        mockfs({
            "dir/cert.file": "cert",
            "dir/ca.file": "ca",
            "dir/key.file": "key"
        });

        env = process.env;

        process.env = {
            TLS_CERT: "dir/cert.file",
            TLS_CA: "dir/ca.file",
            TLS_KEY: "dir/key.file"
        }

        promise = tlsopt.read();
    });

    describe("<return value>", () => {
        it("should be a Promise", () => {
            expect(promise).to.be.a(Promise);
        });

        it("should resolve to TLS options object", () => {
            return promise.then(result => {
                expect(result).to.be.an("object");
                expect(result.cert).to.be.a(Buffer);
                expect(result.ca).to.be.a(Buffer);
                expect(result.key).to.be.a(Buffer);
                expect(result.cert.toString()).to.be("cert");
                expect(result.ca.toString()).to.be("ca");
                expect(result.key.toString()).to.be("key");
            });
        });
    });
});
