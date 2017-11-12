'use strict';

const Fs = require('fs');

const Fischbacher = require('fischbacher');
const Hoek = require('hoek');
const Recourier = require('recourier');
const Subtext = require('subtext');

const internals = {};

internals.onPostAuth = function (options) {

    return async function (request, h) {

        if (!Hoek.contain(request.payload, ['bytes', 'path'])) {
            return h.continue;
        }

        const stream = Fs.createReadStream(request.payload.path);
        stream.headers = request.headers;

        const { payload } = await Subtext.parse(stream, null, {
            allow: 'multipart/form-data',
            output: 'file',
            parse: true
        });

        request.payload = payload;

        return h.continue;
    };
};

internals.register = async function (server, options) {

    const plugins = [{
        plugin: Fischbacher,
        options
    }, {
        plugin: Recourier,
        options: {
            namespace: 'coutts',
            properties: ['payload']
        }
    }];

    await server.register(plugins);

    return server.ext('onPostAuth', internals.onPostAuth(options));
};

module.exports = {
    pkg: require('../package.json'),
    register: internals.register
};
