/* eslint no-console: [0, { allow: ["log","warn", "error"] }] */
'use strict'

const _ = require('lodash')
const path = require('path')
const markdownDocBundler = require('markdown-doc-bundler')
const MetaRemarkable = require('meta-remarkable')
const sitemapper = require('./sitemapper')

module.exports.routesMaker = function(bundle, prefix) {

  if (!bundle) {
    throw 'Please include a bundle to parse'
  }

  if (typeof prefix === 'undefined' || !prefix) {
    prefix = '/'
  }

  const output = []

  function handleMeta(doc) {
    const md = new MetaRemarkable()
    const page = md.render(doc)

    // Initialize an empty object
    let lowerMeta = {}

    // transform meta keys to lowercase (easier to work with)
    if (page.meta){
      lowerMeta = _.transform(page.meta, function (result, val, key) {
        result[key.toLowerCase()] = val
      })
    }
    return lowerMeta
  }

  function handleChildren(doc, prefix){
    return sitemapper.handleRecursive(doc, prefix)
  }

  function recursiveRoutesMaker(bundle, pwd) {

    _.forEach(bundle, (content, key) => {
      let meta = {}
      let children = []
      // If the value is a string.
      if (_.isString(content)) {
        const nextPath = markdownDocBundler.fixUrl(path.join(pwd, key))
        meta = handleMeta(content)
        children = handleChildren(bundle, pwd)
        output.push([nextPath, markdownDocBundler.fixUrls(content, prefix, pwd), meta, children])
      }

      // If the value is a Buffer (usually images)
      else if (Buffer.isBuffer(content)) {
        const nextPath = path.join('/', pwd, key)
        output.push([nextPath, content, meta, children])
      }

      // If content is an object, run the function again.
      else if (_.isObject(content)) {
        const nextPwd = path.join(pwd, key)
        recursiveRoutesMaker(content, nextPwd)
      }

    })
  }

  recursiveRoutesMaker(bundle, prefix)

  return output

}
