/* eslint no-console: [0, { allow: ["log","warn", "error"] }] */
'use strict'

const Controller = require('trails-controller')
const MetaRemarkable = require('meta-remarkable')
/**
 * @module MarkdowndocController
 * @description Markdown doc bundler Controller.
 * @help ::
 */
module.exports = class MarkdowndocController extends Controller{
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
    res.render(this.app.config.markdowndoc.layout, {content: page.html, meta: page.meta, sitemap: this.app.config.markdowndoc.sitemap})
  }

  /**
   * Used only for Tests
   * @param {Object} req
   * @param {Object} res
   */
  test(req, res) {
    // Set Route
    const route = req.route

    // Set Render
    const md = new MetaRemarkable('full', this.app.config.markdowndoc.remarkable)

    // Render Page
    const page = md.render(route.config.app.content)
    res.render(this.app.config.markdowndoc.layout, {content: page.html, meta: page.meta, sitemap: this.app.config.markdowndoc.sitemap})
  }
}
