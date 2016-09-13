/* eslint no-console: [0, { allow: ["log","warn", "error"] }] */
'use strict'

const _ = require('lodash')
const sitemapper = require('./sitemapper')
const routesmaker = require('./routesmaker')

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
    // console.log(sitemap)

    // Route Maker
    // const routesMaker = require('markdown-doc-bundler').routesMaker
    // replace with ability to gather meta data from route
    const routesMaker = routesmaker.init

    // Make Routes
    let routes = routesMaker(docs, prefix)

    // Routes is now blended with default controller
    routes = _.map(routes, (route, index) => {
      return {
        method: 'GET',
        path: route[0],
        handler: 'MarkdowndocController.doc',
        config: {
          app: {
            content: route[1],
            meta: route[2]
          }
        }
      }
    })

    // Gracefully add Route content to possibly existing routes.
    // This allows the previously written route to use it's own controller while also receiving the content
    // Strict Lookup
    _.each(app.config.routes, (inAppRoute, index) => {
      // Find Exact Match, add content to match then remove from routes array so it is not merged.
      const exsits = _.findIndex(routes, (r) => { return r.path == inAppRoute.path })
      if (exsits > -1) {
        app.log.debug('trailpack-markdown-doc blending markdown document config', routes[exsits].path, 'with', inAppRoute.path)

        if (!app.config.routes[index].config) {
          app.config.routes[index].config = {}
        }
        if (!app.config.routes[index].config.app) {
          app.config.routes[index].config.app = {}
        }
        app.config.routes[index].config.app.content = routes[exsits].config.app.content
        app.config.routes[index].config.app.meta = routes[exsits].config.app.meta

        // Remove the route form 'routes'
        routes.splice(exsits, 1)
        return
      }
    })

    // Fuzzy Lookup
    routes = _.map(routes, (inDocRoute, index) => {

      // Find app.config.routes that match
      const fuzzyMatch = _.find(app.config.routes, (inAppRoute, i) => {
        // make a regex from the path
        const inRegexPath = new RegExp('^' + inAppRoute.path.replace(/:\w+/g, '(.+)') + '$')
        // Test the route against the regex
        const outRegexPath = inRegexPath.test(inDocRoute.path)
        // If the regex matches
        if (outRegexPath) {
          return inAppRoute
        }
      })

      if (fuzzyMatch) {
        app.log.debug('trailpack-markdown-doc GRACEFULLY blending markdown document', routes[index].path, 'with config from', fuzzyMatch.path)
        // Save these because we are replacing the route
        const path = inDocRoute.path
        const content = inDocRoute.config.app.content
        const meta = inDocRoute.config.app.meta

        //Replace the route with the fuzzyMatch
        const route = _.clone(fuzzyMatch)

        route.path = path

        if (!route.config) {
          route.config = {}
        }
        if (!route.config.app) {
          route.config.app = {}
        }
        route.config.app.content = content
        route.config.app.meta = meta
        return route
      }
      else {
        app.log.debug('trailpack-markdown-doc adding route', inDocRoute.path)
        return inDocRoute
      }
    })

    const finalRoutes = routerUtil.mergeRoutes(routes, app.config.routes)
    app.sitemap = sitemap
    app.config.routes = finalRoutes
  }
}
