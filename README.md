# trailpack-markdown-doc

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

Trailpack for viewing markdown documents as html with metadata.
Set your doc directory folder and the trailpack automatically creates routes for the directory
and renders the parsed markdown into your layout file using [meta-remarkable](https://github.com/bmathews/meta-remarkable). Perfect for a documentation website or flat file CMS.

## Cool Features
 - Trailpack-markdown-doc will automatically blend with your existing routes.  For example, if you have a view controller for the route `/docs/hello/world` and you have an markdown file at `/docs/hello/world.md` then trailpack-markdown-doc will add the content and metadata to the route without altering the rest of your configuration.
 - This blending also does a "Fuzzy Lookup", so if you have a route that points to `/docs/hello/:world` and a markdown file at `/docs/hello/Readme.md` then it will apply the content and metadata to all routes that match that pattern.
 - Trailpack-markdown-doc also resolves the children and siblings for each route in your markdown doc file stucture.
 - Trailpack-markdown-doc also creates a js sitemap of all your markdown routes.
 - Trailpack-markdown-doc uses [Fuse.js](https://github.com/krisk/Fuse) for searching content and routes.

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
  path: 'docs',
  // Prefix to be used for routes
  prefix: 'docs',
  // The layout page to embed the doc
  layout: 'index.ejs',
  // The Settings for Remarkable
  remarkable: {},
  // The Settings for Searching the Routes
  search: {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    keys: [
      'title',
      'content'
    ]
  }
}
```

### Markdown
trailpack-markdown-doc supports YAML style Metadata in markdown documents (.md)

```
---
Title:   My awesome markdown file
Author:  Me
Scripts:
    - js/doStuff.js
    - js/doMoreStuff.js
---

## Header
Regular text and stuff goes here.
```

This way, a nice table is also created at the header of the page on sites like Github which makes this flatfile approach even more powerful.

## Examples

```html
// views/index.ejs (or your view engine) using MarkdowndocController
<!doctype html>
<html lang="en">
<head>
  <title><% if ( meta && meta.Title ) { %><%= meta.Title %><% } else { %>Opps, no Title<% } %></title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <ul>
  <% for(var i=0; i < sitemap.length; i++) { %>
    <li>
      <a href="<%= sitemap[i].path %>"><%= sitemap[i].title %></a>
      <% if ( sitemap[i].children.length > 0 ) { %>
      <ul>
        <% for(var r=0; r < sitemap[i].children.length; r++) { %>
        <li>
          <a href="<%= sitemap[i].children[r].path %>"><%= sitemap[i].children[r].title %></a>
          <% if ( sitemap[i].children[r].children.length > 0 ) { %>
          <ul>
            <% for(var rr=0; rr < sitemap[i].children[r].children.length; rr++) { %>
            <li>
              <a href="<%= sitemap[i].children[r].children[rr].path %>"><%= sitemap[i].children[r].children[rr].title %></a>
            </li>
            <% } %>
          </ul>
          <% } %>
        </li>
        <% } %>
      </ul>
      <% } %>
   </li>
  <% } %>
  </ul>

  <%- content %>

</body>
</html>
```

[npm-image]: https://img.shields.io/npm/v/trailpack-markdown-doc.svg?style=flat-square
[npm-url]: https://npmjs.org/package/trailpack-markdown-doc
[ci-image]: https://img.shields.io/travis/trailsjs/trailpack-markdown-doc/master.svg?style=flat-square
[ci-url]: https://travis-ci.org/trailsjs/trailpack-markdown-doc
[daviddm-image]: http://img.shields.io/david/trailsjs/trailpack-markdown-doc.svg?style=flat-square
[daviddm-url]: https://david-dm.org/trailsjs/trailpack-markdown-doc
[codeclimate-image]: https://img.shields.io/codeclimate/github/trailsjs/trailpack-markdown-doc.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/trailsjs/trailpack-markdown-doc
