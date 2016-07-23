/* eslint no-console: [0, { allow: ["log","warn", "error"] }] */
'use strict'

const Controller = require('trails-controller')
const Remarkable = require('remarkable')
const md = new Remarkable()
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
    const route = req.route
    const page = md.render(route.config.content)
    res.render(this.app.config.markdowndoc.layout, {content: page})
  }
}
