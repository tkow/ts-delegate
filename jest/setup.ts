import fs from 'fs'
import path from 'path'

export default () => {
  const removeDir = path.join(process.cwd(), 'tmp')
  if(fs.existsSync(removeDir)){
    fs.rmSync(removeDir, { recursive: true, force: true });
  }
}
