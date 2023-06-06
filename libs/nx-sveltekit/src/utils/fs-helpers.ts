import { logger } from '@nx/devkit';
import fs = require('fs');
import path = require('path');

export function copyDirectorySync(source: string, target: string) {
  try {
    const files = fs.readdirSync(source);

    files.forEach((file) => {
      const sourceFile = path.join(source, file);
      const targetFile = path.join(target, file);

      try {
        const stats = fs.statSync(sourceFile);

        if (stats.isDirectory()) {
          if (!fs.existsSync(targetFile)) {
            fs.mkdirSync(targetFile);
          }
          copyDirectorySync(sourceFile, targetFile);
        } else if (stats.isFile()) {
          fs.copyFileSync(sourceFile, targetFile);
        }
      } catch (err) {
        logger.error(`[@dympydev/nx-sveltekit] Error copying file or directory ${sourceFile}: ${err}`);
      }
    });
  } catch (err) {
    logger.error(`[@dympydev/nx-sveltekit] Error reading directory ${source}: ${err}`);
  }
}
