import chalk from 'chalk';
import {asyncForEach, writeFile} from './utils';

export class Redirects {

  constructor(private redirects: { [key: string]: string }) {
  }

  public async createRedirects(outputDir: string) {
    console.info(chalk.green`Create ${Object.entries(this.redirects).length} redirects`);

    asyncForEach(Object.entries(this.redirects), async redirectTuple => {
      await writeFile(`${outputDir}/${redirectTuple[0]}/index.html`, this.createIndex(redirectTuple[1]));
    });
    console.info(chalk.green`Created index.html files with redirects`);
  }

  private createIndex(to: string): string {
    return `<html><head><meta http-equiv="refresh" content="0; URL=${to}" /><link rel="canonical" href="${to}"></head><body></body></html>`;
  }
}
