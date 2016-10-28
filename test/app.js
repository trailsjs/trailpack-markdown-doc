'use strict'

const _ = require('lodash')
const smokesignals = require('smokesignals')

const packs = [
  smokesignals.Trailpack,
  require('trailpack-core'),
  require('trailpack-router'),
  require('../') // trailpack-markdown-doc
]
const ENGINE = process.env.ENGINE || 'express'

let web

if (ENGINE === 'hapi') {
  packs.push(require('trailpack-hapi'))
  web = {
    hapi: require('hapi')
  }
}
else {
  packs.push(require('trailpack-express'))
  web = {
    express: require('express'),
    middlewares: {
      order: [
        'addMethods',
        'cookieParser',
        'session',
        'bodyParser',
        'passportInit',
        'passportSession',
        'methodOverride',
        'router',
        'www',
        '404',
        '500'
      ]
    }
  }
}


const App = {
  pkg: {
    name: require('../package').name + '-test'
  },
  api: {
    models: { },
    controllers: {
      DefaultController: class DefaultController extends require('trails-controller') {
        info(req, res){
          res.send('ok')
        }
      }
    },
    services: { }
  },
  config: {
    markdowndoc: {
      path: 'docs',
      prefix: 'docs',
      layout: 'index.ejs',
      search: {
        // shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        keys: [
          'title',
          'content'
        ]
      }
    },
    main: {
      packs: packs
    },
    routes: [
      {
        path: '/',
        method: ['GET'],
        handler: 'DefaultController.info'
      },
      {
        path: '/search/:query',
        method: ['GET'],
        handler: 'MarkdowndocController.search'
      }
      // {
      //   path: '/docs/override/',
      //   method: ['GET'],
      //   handler: 'MarkdowndocController.doc'
      // },
      // {
      //   path: '/docs/override/:id',
      //   method: ['GET'],
      //   handler: 'MarkdowndocController.doc'
      // }
    ],
    policies: {

    },
    views: {
      engine: 'ejs'
    },
    web: web
  }
}
_.defaultsDeep(App, smokesignals.FailsafeConfig)
module.exports = App
