import fs from 'fs'

if (typeof fs.readFileSync === 'function') {
  console.log('fs imported')
}
