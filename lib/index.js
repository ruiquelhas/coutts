'use strict';

const Fs = require('fs');

const Fischbacher = require('fischbacher');
const Hoek = require('hoek');
const Recourier = require('recourier');
const Subtext = require('subtext');

const internals = {};

internals.onPostAuth = function (options) {

    const keys = ['bytes', 'path'];

    return function (request, reply) {

        if (!Hoek.contain(request.payload, keys)) {
            return reply.continue();
        }

        const stream = Fs.createReadStream(request.payload.path);
        stream.headers = request.headers;

        const config = {
            allow: 'multipart/form-data',
            output: 'file',
            parse: true
        };

        Subtext.parse(stream, null, config, (err, parsed) => {

            if (err) {
                return reply(err);
            }

            request.payload = parsed.payload;

            reply.continue();
        });
    };
};

exports.register = function (server, options, next) {

    const plugins = [{
        register: Fischbacher,
        options: options
    }, {
        register: Recourier,
        options: {
            namespace: 'coutts',
            properties: ['payload']
        }
    }];

    server.register(plugins, (err) => {

        server.ext('onPostAuth', internals.onPostAuth(options));
        next(err);
    });
};

exports.register.attributes = {
    pkg: require('../package.json')
};
