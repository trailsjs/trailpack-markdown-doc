/* eslint no-console: [0, { allow: ["log","warn", "error"] }] */
'use strict'

const _ = require('lodash')

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

    // Route Maker
    const routesMaker = require('markdown-doc-bundler').routesMaker

    // Make Routes
    let routes = routesMaker(docs, prefix)

    routes = _.map(routes, route => {
      return {
        method: 'GET',
        path: route[0],
        handler: 'MarkdowndocController.doc',
        config: {
          content: route[1]
        }
      }
    })
    // if (prefix){
    //   routes.forEach(route => {
    //     route.path = route.path
    //   })
    // }
    app.config.routes = routerUtil.mergeRoutes(routes, app.config.routes)
  }
}
