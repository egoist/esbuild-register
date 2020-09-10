import path from 'path'
import fs from 'fs'

console.log(fs.existsSync(path.resolve(__dirname, './import.ts')))