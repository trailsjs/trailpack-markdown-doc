'use strict'

module.exports = {
  // Directory containing docs
  path: 'docs',
  // Prefix to be used for routes
  prefix: 'docs',
  // The layout page to embed the doc
  layout: 'index.ejs',
  // The Settings for Remarkable
  remarkable: {},
  // The Settings for Searching the Routes
  search: {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    keys: [
      'title',
      'content'
    ]
  }
}
