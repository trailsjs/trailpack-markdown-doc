/* eslint no-console: [0, { allow: ["log","warn", "error"] }] */
'use strict'

const _ = require('lodash')
const sitemapper = require('./sitemapper')

module.exports = {
  init: (app) => {
    // const stripe = app.services.StripeService.stripe
  },

  addRoutes: app => {
    const prefix = _.get(app.config, 'markdowndoc.prefix') || _.get(app.config, 'footprints.prefix')
    const routerUtil = app.packs.router.util

    // Initiate the bundler
    const markdownDocBundler = require('markdown-doc-bundler').bundler

    // Fetch Docs
    const docs = markdownDocBundler(app.config.markdowndoc.path)

    // Initialize the sitemap
    const sitemap = sitemapper.init(docs, prefix)

    // Route Maker
    const routesMaker = require('markdown-doc-bundler').routesMaker

    // Make Routes
    let routes = routesMaker(docs, prefix)

    routes = _.map(routes, (route, index) => {
      return {
        method: 'GET',
        path: route[0],
        handler: 'MarkdowndocController.doc',
        config: {
          content: route[1]
        }
      }
    })
    console.log(sitemap)

    app.config.markdowndoc.sitemap = sitemap
    app.config.routes = routerUtil.mergeRoutes(routes, app.config.routes)
  }
}
