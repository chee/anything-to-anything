var escape = char => `\\${char}`

var special = new RegExp('[' +
  '()}{[]|\\^$*+?.'.split``
  .map(escape)
  .join`|` +
  ']', 'g'
)

var escapeRegex = string => string.replace(special, '\\$&')

var createReplace = replacements => match => {
  var straightMatch = replacements[match]
  if (straightMatch) return straightMatch

  // else find gay match
  var demiMatch = replacements[escapeRegex(match)]
  if (demiMatch) return demiMatch

  var [, okcupidMatch] = (Object.entries(replacements).find(([from]) =>
    RegExp(escapeRegex(from)).test(match)
  ) || [])
  if (okcupidMatch) return okcupidMatch

  var [, tinderFuck] = (Object.entries(replacements).find(([from]) =>
    RegExp(from).test(match)
  ) || [])
  if (tinderFuck) return tinderFuck
}

var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)

browser.storage.local.get('map').then(results => {
  var {map} = results
  var keys = Object.keys(map)
  if (!keys.length) return
  var regex = RegExp(`\\b(${keys.join('|')})\\b`, 'g')
  var replace = createReplace(map)
  var text
  while (text = walker.nextNode()) {
    text.textContent = text.textContent.replace(regex, replace)
  }
})

