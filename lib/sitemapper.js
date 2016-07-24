/* eslint no-console: [0, { allow: ["log","warn", "error"] }] */
'use strict'
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
    // Return the file name minus the extension and capitalize it
    return capitalizeFirstLetter(title.replace('.md','').trim())
  }
}

/*
 * handleRecursive
 * @param {Object|String} docs
 * @param {String} pwd,
 * @return Object with nested sitemap 
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

    // If doc is an object just fix the url
    else if (_.isObject(doc)) {
      route = markdownDocBundler.fixUrl(path.join(pwd, title))
    }

    return {
      title: handleTitle(doc, title),
      route: route,
      routes: handleRecursive(doc, route)
    }
  })
  return routes
}
/*
 * init
 * @param {Object|String} docs
 * @param {String} prefix,
 * @return Object with nested sitemap 
 */
exports.init = (docs, prefix) => {
  // The Sitemap
  return handleRecursive(docs, prefix)
}
