# coutts
File type validation for [hapi](https://github.com/hapijs/hapi) raw temporary file `multipart/form-data` request payloads.

Like most modern magicians, builds on the work, knowledge and influence of others before it, in this case, [fischbacher](https://github.com/ruiquelhas/fischbacher).

[![NPM Version][fury-img]][fury-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url] [![Dependencies][david-img]][david-url]

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Example](#example)
- [Supported File Types](#supported-file-types)

## Installation
Install via [NPM](https://www.npmjs.org).

```sh
$ npm install coutts
```

## Usage

Register the package as a server plugin to enable validation for each route that does not parse — `parse: false` — into a temporary file, the request payload — `output: 'file'`. For every other route with a different configuration, the validation is skipped.

If the validation fails, a [joi](https://github.com/hapijs/joi)-like `400 Bad Request` error is returned alongside an additional `content-validation: failure` response header. If everything is ok, the response will ultimately contain a `content-validation: success` header.

Also, if the `Content-Type` request header is not `multipart/form-data`, a `415 Unsupported Media Type` error is returned, but in this case, without any additional response header.

### Example

```js
const Hapi = require('hapi');
const Coutts = require('coutts');

const server = new Hapi.Server();
server.connection({
    // go nuts
});

const plugin = {
    register: Coutts,
    options: {
      // Allow png files only
      whitelist: ['png']
    }
};

server.register(plugin, (err) => {

    server.route({
        config: {
            payload: {
                output: 'file',
                parse: false
            }
            // go nuts
        }
    });

    server.start(() => {
        // go nuts
    });
});
```

## Supported File Types

The same as [magik](https://github.com/ruiquelhas/magik#supported-file-types).

[coveralls-img]: https://coveralls.io/repos/ruiquelhas/coutts/badge.svg
[coveralls-url]: https://coveralls.io/github/ruiquelhas/coutts
[david-img]: https://david-dm.org/ruiquelhas/coutts.svg
[david-url]: https://david-dm.org/ruiquelhas/coutts
[fury-img]: https://badge.fury.io/js/coutts.svg
[fury-url]: https://badge.fury.io/js/coutts
[travis-img]: https://travis-ci.org/ruiquelhas/coutts.svg
[travis-url]: https://travis-ci.org/ruiquelhas/coutts
