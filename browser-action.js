var dom = 'tr td input'.split` `.reduce((dom, nodename) => {
  dom[nodename] = (attrs = {}, children = '') => {
    var node = document.createElement(nodename)

    Object.entries(attrs).forEach(([key, value]) => {
      value != null && value !== false && node.setAttribute(key, value)
    })

    if (typeof children === 'string') {
      node.textContent = children
    } else if (Array.isArray(children)) {
      node.append(...children)
    } else {
      node.append(children)
    }

    return node
  }
  return dom
}, {})

function createRow ({from = '', to = '', sensitive = false, isRegex = false} = {}) {
  return dom.tr({class: 'js-row'}, [
    dom.td({}, dom.input({class: 'js-from', type: 'text', value: from})),
    dom.td({}, dom.input({class: 'js-to', type: 'text', value: to})),
    dom.td({}, dom.input({class: 'js-sensitive', type: 'checkbox', checked: sensitive})),
    dom.td({}, dom.input({class: 'js-isRegex', type: 'checkbox', checked: isRegex}))
  ])
}

var table = document.getElementById('table')
var body = document.getElementById('body')

function serialise () {
  return [].reduce.call(table.querySelectorAll('.js-row'), (items, row) => items.concat({
      from: row.querySelector('.js-from').value || '',
      to: row.querySelector('.js-to').value || '',
      sensitive: !!row.querySelector('.js-sensitive').checked,
      isRegex: !!row.querySelector('.js-isRegex').checked
  }), [])
}

Array.prototype.last = function () {
  return this[Math.max(this.length - 1, 0)]
}

function appendRow ({from, to, sensitive, isRegex} = {}) {
  return body.append(createRow({from, to, sensitive, isRegex}))
}

function handleKeyDown () {
  var items = serialise()

  browser.storage.local.set({items}).then(() => browser.runtime.sendMessage({
    type: 'items:change',
    value: items
  }))

  var last = items.last()

  if (last.from && last.to) appendRow()
}

document.addEventListener('keydown', handleKeyDown)

browser.storage.local.get('items').then(({items}) => {
  if (!Array.isArray(items) || !items.length) return
  body.textContent = ''
  items.forEach(appendRow)
})
