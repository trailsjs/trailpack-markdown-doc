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

    // Any unsed routes are now added in
    routes = _.map(routes, (route, index) => {
      return {
        method: 'GET',
        path: route[0],
        handler: 'MarkdowndocController.doc',
        config: {
          app: {
            content: route[1]
          }
        }
      }
    })

    // Gracefully add Route content to possibly existing routes.
    // This allows the previously written route to use it's own controller while also receiving the content

    _.each(app.config.routes, (inAppRoute, index) => {
      // Find Exact Match, add content to match then remove from routes array.
      const exsits = _.findIndex(routes, (r) => { return r.path == inAppRoute.path })
      if (exsits > -1) {
        if (!app.config.routes[index].config) {
          app.config.routes[index].config = {}
        }
        if (!app.config.routes[index].config.app) {
          app.config.routes[index].config.app = {}
        }
        app.config.routes[index].config.app.content = routes[exsits].config.app.content
        return routes.splice(exsits, 1)
      }

      // No exact match, so let's look for fuzzy matches and add inAppRoute handlers to doc route
      // make a regex from the path
      const inRegexPath = new RegExp('^' + inAppRoute.path.replace(/:\w+/g, '(.+)') + '$')

      _.each(routes, (inDocRoute, i) => {

        // const outRegexPath = inDocRoute.path.replace(/:\w+/g, '*replace')
        // If the regex matches
        const outRegexPath = inRegexPath.test(inDocRoute.path)

        //console.log(inAppRoute.path, inDocRoute.path, inRegexPath, outRegexPath)

        if (outRegexPath) {
          // Save these because we are replacing the route
          const path = routes[i].path
          const content = routes[i].config.app.content

          //Replace the route
          routes[i] = inAppRoute
          routes[i].path = path

          if (!routes[i].config) {
            routes[i].config = {}
          }
          if (!routes[i].config.app) {
            routes[i].config.app = {}
          }
          routes[i].config.app.content = content
          return
        }
      })
    })

    app.config.markdowndoc.sitemap = sitemap
    app.config.routes = routerUtil.mergeRoutes(routes, app.config.routes)
  }
}
