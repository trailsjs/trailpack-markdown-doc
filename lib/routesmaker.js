/* eslint no-console: [0, { allow: ["log","warn", "error"] }] */
'use strict'

const _ = require('lodash')
const path = require('path')
const markdownDocBundler = require('markdown-doc-bundler')
const MetaRemarkable = require('meta-remarkable')
// const sitemapper = require('./sitemapper')

module.exports.routesMaker = function(app, bundle, prefix, sitemap) {

  if (!app) {
    throw 'Please include trails app'
  }

  if (!bundle) {
    throw 'Please include a bundle to parse'
  }

  if (typeof prefix === 'undefined' || !prefix) {
    prefix = '/'
  }

  const output = []

  function handleDoc(doc) {
    const md = new MetaRemarkable()
    const page = md.render(doc)

    // Initialize an empty object
    //let lowerMeta = {}

    // transform meta keys to lowercase (easier to work with)
    if (page.meta){
      page.meta = _.transform(page.meta, function (result, val, key) {
        result[key.toLowerCase()] = val
      })
    }
    return page
  }

  function handleChildren(path){

    const findByPath = function (arr, p) {
      let i, l, c
      for (i = 0, l = arr.length; i < l; i++) {
        if (arr[i].path === p) {
          return arr[i]
        }
        else {
          c = findByPath(arr[i].children, p)
          if (c !== null) {
            return c
          }
        }
      }
      return null
    }
    return findByPath(sitemap, path).children

    ///console.log(Object.keys(doc), path)
    // return sitemapper.handleRecursive(doc, path)
  }

  function recursiveRoutesMaker(bundle, pwd) {

    _.forEach(bundle, (content, key) => {
      // console.log(key)
      let meta = {}
      // let transformedContent = ''
      let children = []
      // If the value is a string.
      if (_.isString(content)) {
        const nextPath = markdownDocBundler.fixUrl(path.join(pwd, key))
        const transformedDoc = handleDoc(content)
        meta = transformedDoc.meta
        // transformedContent = transformedDoc.html
        children = handleChildren(nextPath)
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
