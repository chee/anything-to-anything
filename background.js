var escape = char => `\\${char}`

var special = new RegExp('[' +
  '()}{[]|\\^$*+?.'.split``
  .map(escape)
  .join`|` +
  ']', 'g'
)

var escapeRegex = string => string.replace(special, '\\$&')

var wordStartRegex = /((?:^|\s|[-_])\w)/g

String.prototype.toTitleCase = function () {
  return this.toLowerCase().replace(wordStartRegex, $1 => $1.toUpperCase())
}

function createInsensitiveReplacements ({from, to}) {
  var replacements = []
  replacements.push({from, to})

  replacements.push({
    from: from.toUpperCase(),
    to: to.toUpperCase()
  })

  replacements.push({
    from: from.toLowerCase(),
    to: to.toLowerCase()
  })

  replacements.push({
    from: from.toTitleCase(),
    to: to.toTitleCase()
  })

  return replacements
}

var build = items => items.reduce((map, item) => {
  var {
    from = '',
    to = '',
    sensitive = false,
    isRegex = false
  } = item

  if (!from) return map

  var replacements = sensitive
    ? [{from, to}]
    : createInsensitiveReplacements({from, to})

  return replacements.reduce((map, {from, to}) => (
    map[isRegex
      ? from
      : escapeRegex(from)
    ] = to, map
  ), map)

}, {})

var currentData = {}

browser.storage.local.get('map').then(results => {
  currentData = results
})

browser.tabs.onUpdated.addListener = (tabId, changeInfo, tab) => {
  browsers.tabs.sendMessage(tabId, currentData)
}

function handleBrowserActionMessage ({type, value}) {
  if (type === 'items:change') {
    currentData.map = build(value)
    browser.storage.local.set(currentData)
  }
}

browser.runtime.onMessage.addListener((message, sender) => {
  if (sender.tab && sender.url.endsWith('the-replacements.htm')) {
    // we are getting messages from our special tab
    handleBrowserActionMessage(message)
  }
})

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.create({
    active: true,
    url: './the-replacements.htm'
  }).then(() => {
    setTimeout(() => {
      browser.runtime.sendMessage('hello m8')
      browser.runtime.sendMessage(['like this', '?'])
    }, 4000)
  })
})
