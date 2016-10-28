/* eslint no-console: [0, { allow: ['log','warn', 'error'] }] */
'use strict'

const Controller = require('trails-controller')
const MetaRemarkable = require('meta-remarkable')
const Fuse = require('fuse.js')
const _ = require('lodash')
/**
 * @module MarkdowndocController
 * @description Markdown doc bundler Controller.
 * @help ::
 */
module.exports = class MarkdowndocController extends Controller{
  /**
   * Handle search route requests using flow.js
   * @param {Object} req
   * @param {Object} res
   */
  search(req, res) {
    let query = ''

    if (!req.query['query']) {
      query = ''
    }
    else {
      query = req.query['query']
    }

    const list = []
    _.each(this.app.routes, route => {
      const ret = {
        path: route.path
      }

      _.each(this.app.config.markdowndoc.search.keys, key => {
        if (route.config && route.config.app) {
          if (route.config.app[key]) {
            ret[key] = route.config.app[key]
          }
          if (route.config.app.meta && route.config.app.meta[key]) {
            ret[key] = route.config.app.meta[key]
          }
        }
      })
      list.push(ret)
    })

    // Options set in Markdowndoc Config
    const options = this.app.config.markdowndoc.search
    const fuse = new Fuse(list, options) // 'list' is the route array as an extensible object
    const results = fuse.search(query)
    res.json(results)

  }
  /**
   * Handle doc route requests
   * @param {Object} req
   * @param {Object} res
   */
  doc(req, res) {
    // Set Route
    const route = req.route

    // Set Render
    const md = new MetaRemarkable('full', this.app.config.markdowndoc.remarkable)

    // Render Page
    const page = md.render(route.config.app.content)
    res.render(this.app.config.markdowndoc.layout, {content: page.html, meta: page.meta, sitemap: this.app.sitemap})
  }
}
