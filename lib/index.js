'use strict';

const Fs = require('fs');

const Fischbacher = require('fischbacher');
const Hoek = require('hoek');
const Subtext = require('subtext');

const internals = {
    defaults: {
        pattern: ['bytes', 'path']
    }
};

internals.onPostAuth = function (options) {

    const keys = internals.defaults.pattern;

    return function (request, reply) {

        if (!request.payload || !Hoek.contain(request.payload, keys)) {
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

    const plugin = {
        register: Fischbacher,
        options: options
    };

    server.register(plugin, (err) => {

        server.ext('onPostAuth', internals.onPostAuth(options));
        next(err);
    });
};

exports.register.attributes = {
    pkg: require('../package.json')
};
