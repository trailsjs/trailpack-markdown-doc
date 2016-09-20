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
    // Has ability to gather meta data from route
    const routesMaker = routesmaker.routesMaker

    // Make Routes
    let routes = _.map(routesMaker(app, docs, prefix, sitemap), (route, index) => {
      return {
        method: 'GET',
        path: route[0],
        handler: 'MarkdowndocController.doc',
        config: {
          app: {
            path: route[0] || '',
            content: route[1] || '', // Default to string
            meta: route[2] || {}, // Default to Object
            children: route[3] || [] // Default to Arrray
          }
        }
      }
    })
    //let routes = routesMaker(app, docs, prefix, sitemap)
    // Routes is now blended with default controller
    // routes = _.map(routes, (route, index) => {
    //   return {
    //     method: 'GET',
    //     path: route[0],
    //     handler: 'MarkdowndocController.doc',
    //     config: {
    //       app: {
    //         path: route[0] || '',
    //         content: route[1] || '', // Default to string
    //         meta: route[2] || {}, // Default to Object
    //         children: route[3] || [] // Default to Arrray
    //       }
    //     }
    //   }
    // })

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
        app.config.routes[index].config.app.path = routes[exsits].config.app.path
        app.config.routes[index].config.app.content = routes[exsits].config.app.content
        app.config.routes[index].config.app.meta = routes[exsits].config.app.meta
        app.config.routes[index].config.app.children = routes[exsits].config.app.children

        // Remove the route form 'routes'
        routes.splice(exsits, 1)
        return
      }
    })

    // Fuzzy Lookup
    routes = _.map(routes, (inDocRoute, index) => {
      // Find app.config.routes that match
      const fuzzyMatch = _.findIndex(app.config.routes, (inAppRoute, i) => {
        // make a regex from the path
        const inRegexPath = new RegExp('^' + inAppRoute.path.replace(/:\w+/g, '(.+)') + '$')
        // Test the route against the regex
        const outRegexPath = inRegexPath.test(inDocRoute.path)
        // If the regex matches
        if (outRegexPath) {
          return inAppRoute
        }
      })

      if (fuzzyMatch != -1) {
        app.log.debug('trailpack-markdown-doc GRACEFULLY blending markdown document', routes[index].path, 'with config from', app.config.routes[fuzzyMatch].path)
        const route = _.cloneDeep({}, app.config.routes[fuzzyMatch])

        route.path = inDocRoute.path

        if (!route.config) {
          route.config = {}
        }
        if (!route.config.app) {
          route.config.app = {}
        }
        route.config.app.path = inDocRoute.config.app.path
        route.config.app.content = inDocRoute.config.app.content
        route.config.app.meta = inDocRoute.config.app.meta
        route.config.app.children = inDocRoute.config.app.children

        //console.log(route.path, route.config.app.content)

        return route
      }
      else {
        app.log.debug('trailpack-markdown-doc adding route', inDocRoute.path)
        // console.log(newRoutes[index].path, newRoutes[index].config.app.content)
        return inDocRoute
      }
    })

    // _.each(routes, r => {
    //   console.log(r.path, r.config.app.content)
    // })

    const finalRoutes = routerUtil.mergeRoutes(routes, app.config.routes)

    // Bind sitemap to app root.
    app.sitemap = sitemap

    // Export final Routes
    app.config.routes = finalRoutes
  }
}
