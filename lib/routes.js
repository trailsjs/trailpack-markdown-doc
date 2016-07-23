'use strict'

const _ = require('lodash')

// Initiate the bundler
const markdownDocBundler = require('markdown-doc-bundler').bundler

// Fetch Docs
const docs = markdownDocBundler(this.app.config.markdowndoc.path)

// Make Routes
const routesMaker = require('markdown-doc-bundler').routesMaker

let routes = routesMaker(docs)

routes = _.map(routes, route => {
  return {
    method: 'GET',
    path: route,
    handler: 'MarkdowndocController.doc'
  }
})

module.exports = routes
