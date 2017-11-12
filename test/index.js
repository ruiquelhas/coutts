'use strict';

const Fs = require('fs');
const Os = require('os');
const Path = require('path');

const Code = require('code');
const Content = require('content');
const Form = require('multi-part');
const Hapi = require('hapi');
const Lab = require('lab');

const Coutts = require('../');

const lab = exports.lab = Lab.script();

lab.experiment('coutts', () => {

    let png;
    let server;

    lab.before(async () => {

        server = new Hapi.Server();

        const main = {
            options: {
                handler: (request) => request.payload,
                payload: {
                    output: 'file',
                    parse: false
                }
            },
            method: '*',
            path: '/main'
        };

        const ignore = {
            options: {
                handler: () => null,
                payload: {
                    output: 'data',
                    parse: true
                }
            },
            method: '*',
            path: '/ignore'
        };

        server.route([main, ignore]);

        await server.register( {
            plugin: Coutts,
            options: {
                whitelist: ['image/png']
            }
        });
    });

    lab.beforeEach(() => {
        // Create fake png file
        png = Path.join(Os.tmpdir(), 'foo.png');

        return new Promise((resolve, reject) => {

            Fs.createWriteStream(png)
                .on('error', reject)
                .end(Buffer.from('89504e470d0a1a0a', 'hex'), resolve);
        });
    });

    lab.test('should return control to the server if the route parses or does not handle stream request payloads', async () => {

        const { headers, statusCode } = await server.inject({
            method: 'POST',
            payload: {},
            url: '/ignore'
        });

        Code.expect(statusCode).to.equal(200);
        Code.expect(headers['content-validation']).to.equal('success');
        Code.expect(headers['content-type']).to.not.exist();
    });

    lab.test('should return control to the server if the payload does not contain any file', async () => {

        const form = new Form();
        form.append('foo', 'bar');

        const { headers, result, statusCode } = await server.inject({
            headers: form.getHeaders(),
            method: 'POST',
            payload: form.stream(),
            url: '/main'
        });

        Code.expect(statusCode).to.equal(200);
        Code.expect(headers['content-validation']).to.equal('success');
        Code.expect(Content.type(headers['content-type']).mime).to.equal('application/json');
        Code.expect(result).to.include(['path', 'bytes']);
    });

    lab.test('should return error if the payload cannot be parsed', async () => {

        const form = new Form();
        form.append('file', Fs.createReadStream(png));

        const { headers, result, statusCode } = await server.inject({
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            payload: form.stream(),
            url: '/main'
        });

        Code.expect(statusCode).to.equal(415);
        Code.expect(headers['content-validation']).to.not.exist();
        Code.expect(Content.type(headers['content-type']).mime).to.equal('application/json');
        Code.expect(result).to.not.include(['path', 'bytes']);
    });

    lab.test('should return control to the server if all files in the payload are allowed', async () => {

        const form = new Form();
        form.append('file1', Fs.createReadStream(png));
        form.append('file2', Fs.createReadStream(png));
        form.append('foo', 'bar');

        const { headers, result, statusCode } = await server.inject({
            headers: form.getHeaders(),
            method: 'POST',
            payload: form.stream(),
            url: '/main'
        });

        Code.expect(statusCode).to.equal(200);
        Code.expect(headers['content-validation']).to.equal('success');
        Code.expect(Content.type(headers['content-type']).mime).to.equal('application/json');
        Code.expect(result).to.include(['path', 'bytes']);
    });
});
