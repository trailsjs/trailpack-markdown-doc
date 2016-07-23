'use strict'

const Trailpack = require('trailpack')
const lib = require('./lib')
// const _ = require('lodash')

module.exports = class StripeTrailpack extends Trailpack {

  /**
   * Check web server is used and verify markdowndoc configuration
   */
  validate () {
    // if (!_.includes(_.keys(this.app.packs), 'express')) {
    //   return Promise.reject(new Error('This Trailpack only works for express!'))
    // }

    if (!this.app.config.markdowndoc) {
      return Promise.reject(new Error('No configuration found at config.markdowndoc!'))
    }
  }

  /**
   * Initialize Stripe
   */
  configure () {
    lib.Markdowndoc.init(this.app)
    lib.Markdowndoc.addRoutes(this.app)
  }

  constructor (app) {
    super(app, {
      config: require('./config'),
      api: require('./api'),
      pkg: require('./package')
    })
  }
}

