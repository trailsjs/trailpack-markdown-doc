# trailpack-markdown-doc

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

Trailpack for viewing markdown documents.
Set your doc directory folder and the trailpack automatically creates routes for the directory
and renders the parsed markdown into your layout file. Perfect for a documentation webiste.

## Install

With yeoman: 
```sh
$ yo trails:trailpack trailpack-markdown-doc
```

With NPM:
```sh
$ npm install --save trailpack-markdown-doc
```

## Configure

```js
// config/main.js
module.exports = {
  packs: [
    // ... other trailpacks
    require('trailpack-markdown-doc')
  ]
}
```

```js
// config/markdowndoc.js
'use strict'

module.exports = {
  // Directory containing docs
  path: '/docs',
  // Prefix to be used for routes
  prefix: 'docs',
  // The layout page to embed the doc
  layout: 'index.ejs'
}
```

```
// views/index.ejs (or your view engine)
<!doctype html>
<html lang="en">
<head>
  <base href="/">
  <title>trailpack-markdown-doc</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <%- content %>
</body>
</html>
```

[npm-image]: https://img.shields.io/npm/v/trailpack-markdown-doc.svg?style=flat-square
[npm-url]: https://npmjs.org/package/trailpack-markdown-doc
[ci-image]: https://img.shields.io/travis/scott-wyatt/trailpack-markdown-doc/master.svg?style=flat-square
[ci-url]: https://travis-ci.org/scott-wyatt/trailpack-markdown-doc
[daviddm-image]: http://img.shields.io/david/scott-wyatt/trailpack-markdown-doc.svg?style=flat-square
[daviddm-url]: https://david-dm.org/scott-wyatt/trailpack-markdown-doc
[codeclimate-image]: https://img.shields.io/codeclimate/github/scott-wyatt/trailpack-markdown-doc.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/scott-wyatt/trailpack-markdown-doc

