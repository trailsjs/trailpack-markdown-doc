/* eslint no-console: [0, { allow: ["log","warn", "error"] }] */
'use strict'
const path = require('path')
const _ = require('lodash')
const markdownDocBundler = require('markdown-doc-bundler')
const imageRegex = /\.(gif|jp?g|png|svg)$/
const MetaRemarkable = require('meta-remarkable')

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
function handleTitle(doc, title, meta) {
  if (imageRegex.test(title)) {
    return title
  }
  else if (meta.title && meta.title !== ''){
    return meta.title
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
 * handleMeta
 * @param {String} doc
 * @return Object of YAML metadata from meta-remarkable to lowercase keys
 */
function handleMeta(doc, title) {
  // If this is an image we need to not try and parse it
  if (imageRegex.test(title)) {
    return {}
  }
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
    let meta = {}

    // If doc is a string.
    if (_.isString(doc)) {
      try {
        route = markdownDocBundler.fixUrl(path.join(pwd, title))
      }
      catch (err) {
        console.log('ERROR in markdownDocBundler',err)
        throw err
      }

      // See if the doc has metadata
      try {
        meta = handleMeta(doc, title)
      }
      catch (err) {
        console.log('ERROR in mhandleMeta',err)
        throw err
      }
    }

    // If the value is a Buffer (usually images)
    else if (Buffer.isBuffer(doc)) {
      route = path.join('/', pwd, title)
    }

    // If doc is an object just fix the url and leave meta empty
    else if (_.isObject(doc)) {
      try {
        route = markdownDocBundler.fixUrl(path.join(pwd, title))
      }
      catch (err) {
        throw err
      }
    }

    return {
      title: handleTitle(doc, title, meta),
      meta: meta,
      path: route,
      children: handleRecursive(doc, route)
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
function init(docs, prefix){
  // The Sitemap
  return handleRecursive(docs, prefix)
}


exports.handleRecursive = handleRecursive
exports.init = init
