const computed = require('mutant/computed')
const WatchHeads = require('tre-watch-heads')
const isObservable = require('mutant/is-observable')
const oll = require('observable-linked-list')
const merge = require('lodash.merge')

module.exports = function(ssb) {
  const watchHeads = WatchHeads(ssb)

  return function watch_merged(revRoot_or_obv, opts) {
    opts = opts || {}
    const head_kv = isObservable(revRoot_or_obv) ? revRoot_or_obv : watchHeads(revRoot_or_obv)
    const chain_kv = oll(head_kv, proto, watchHeads)
    return computed(chain_kv, kvs => {
      const prototypes = kvs.slice(1).map(kv => revRoot(kv) || kv && kv.key)
      if (!prototypes.length) return kvs[0]
      const merged = merge({}, ...kvs.reverse())
      if (opts.meta !== false) {
        merged.meta = Object.assign(merged.meta || {}, {"prototype-chain": kvs})
      }
      return merged
    })
  }
}

// -- utils

function content(kv) {
  return kv && kv.value && kv.value.content 
}

function proto(kv) {
  const c = content(kv)
  return c && c.prototype
}

function revRoot(kv) {
  const c = content(kv)
  return c && c.revisionRoot || kv && kv.key
}

