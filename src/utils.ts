import stripJsonComments from 'strip-json-comments'

const nodeVersion = (process.versions.node.match(/^(\d+)\.(\d+)/) || [])
  .slice(1)
  .map(Number)

// Use a simple regexp to replace `node:id` with `id` from source code
export function removeNodePrefix(code: string) {
  if (nodeVersion[0] < 14 || (nodeVersion[0] === 14 && nodeVersion[1] < 18)) {
    return code.replace(
      /([\b\(])require\("node:([^"]+)"\)([\b\)])/g,
      '$1require("$2")$3',
    )
  }
  return code
}

export function jsoncParse(data: string) {
  try {
    return new Function('return ' + stripJsonComments(data).trim())()
  } catch (_) {
    // Silently ignore any error
    // That's what tsc/jsonc-parser did after all
    return {}
  }
}
