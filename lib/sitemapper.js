/* eslint no-console: [0, { allow: ["log","warn", "error"] }] */
'use strict'
// const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const markdownDocBundler = require('markdown-doc-bundler')
const imageRegex = /\.(gif|jp?g|png|svg)$/
/*
 * capitalizeFirstLetter
 * @param {String} string
 * @return String with capitalized first letter
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
/*
 * handleTitle
 * @param {String} doc
 * @param {String} title
 * @return String from first line of doc or capitilized file name
 */
function handleTitle(doc, title) {
  if (imageRegex.test(title)) {
    return title
  }
  else if (title === 'README.md') {
    // Replace README.md with something more friendly
    // The first h1 tag or first line.
    return doc.match(/^(.*)$/m)[0].replace('#','').trim()
  }
  else {
    return capitalizeFirstLetter(title.replace('.md','').trim())
  }
}

/*
 * handleTitle
 * @param {Object|String} docs
 * @param {String} pwd
 */
function handleRecursive(docs, pwd) {
  if (typeof docs == 'string' || imageRegex.test(pwd)) {
    return []
  }
  const routes = _.map(docs, (doc, title) => {

    // Init route
    let route

    // If doc is a string.
    if (_.isString(doc)) {
      route = markdownDocBundler.fixUrl(path.join(pwd, title))
    }

    // If the value is a Buffer (usually images)
    else if (Buffer.isBuffer(doc)) {
      route = path.join('/', pwd, title)
    }

    // If doc is an object just do a normal join
    else if (_.isObject(doc)) {
      route = markdownDocBundler.fixUrl(path.join(pwd, title))
    }

    const item = {
      title: handleTitle(doc, title),
      route: route,
      routes: handleRecursive(doc, route)
    }
    return item
  })
  return routes
}
exports.init = (docs, prefix) => {
  // The Sitemap
  return handleRecursive(docs, prefix)
}
