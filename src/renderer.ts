import chalk from 'chalk';
import globby from 'globby';
import * as Handlebars from 'handlebars';
import {Console} from 'inspector';
import {Redirects} from './redirects';
import {TemplateData} from './template-data.interface';
import YAML from 'yaml';
import {asyncForEach, camelize, copyFile, normalize, readFile, writeFile} from './utils';

export class Renderer {

  private compiledTemplates: { file: string, outputFile: string, content: string }[] = [];
  private readonly partialFolderName = 'partials';
  private redirects: Redirects;
  private templates = [];
  private partials = [];
  private data;
  private translations = {
    en: {},
    de: {}
  };

  constructor(public globString: string) {
  }

  public async loadTranslations(enFile: string, deFile: string) {

    console.info(chalk.white`Loading English translations...`);
    const enYmlContent = await readFile(enFile);
    const enJson = YAML.parse(enYmlContent);
    this.translations.en = enJson;

    console.info(chalk.white`Loading German translations...`);
    const deYmlContent = await readFile(deFile);
    const deJson = YAML.parse(deYmlContent);
    this.translations.de = deJson;
  }

  public async loadTemplates() {
    const files = await globby(this.globString);
    console.info(chalk.green`Found ${files.length} template file(s)`);

    console.info(chalk.white`Loading templates...`);
    await asyncForEach(files, async (file) => {
      const source = await readFile(file);

      const fileSegments = file.split('/');
      const isPartial = fileSegments.includes(this.partialFolderName);
      let outputFile = '';
      if (!isPartial) {
        fileSegments.shift();
        // TODO: What if it's not the file name that needs to be dynamic, but a segment of the url?
        if (fileSegments[fileSegments.length - 1].startsWith('_')) {
          fileSegments[fileSegments.length - 1] = '%s.html';
        }
        outputFile = fileSegments.join('/');
        // if file name starts with _ use old path without file name and replace file-name with %s
        // else remove /template/ from path
        const template = Handlebars.compile(source);

        this.templates.push({
          outputFile,
          file,
          template
        });
      } else {
        const partialName = fileSegments[fileSegments.length - 1].replace('.html', '');
        this.partials.push({partialName: camelize(partialName), source});
      }

    });
    console.info(chalk.white`Template loading done.`);
  }

  public async loadRedirects(file = 'redirects.json') {
    console.info(chalk.white`Load redirects.json`);
    const redirectsRaw = await readFile(file);
    this.redirects = new Redirects(JSON.parse(redirectsRaw));
  }

  public compile(data?: TemplateData[]) {
    this.data = data;
    if (this.data === undefined) {
      throw Error(' No data provided');
    }

    this.registerHelpers();

    console.info(chalk.green`Rendering...`);
    this.partials.forEach(partial => {
      console.info(chalk.white`Register partial ${partial.partialName}.`);
      Handlebars.registerPartial(partial.partialName, partial.source);
    });

    this.templates
      .filter(it => !it.isPartial)
      .forEach((template) => {
        // find data with the same template path
        const dataForThisTemplate = this.data.find(it => it.template === template.file);

        console.info(chalk.white`Rendering "${template.file}"...`);
        let compiledContent = '';
        let outputFile = template.outputFile;
        if (dataForThisTemplate !== undefined) {
          compiledContent = template.template(dataForThisTemplate.data);
          // TODO: title isn't the best option, maybe original filename, or a new field?
          outputFile = outputFile.replace(/%s/g, normalize((dataForThisTemplate.data.title)));
        } else {
          compiledContent = template.template({});
        }


        this.compiledTemplates.push({
          file: template.file,
          outputFile,
          content: compiledContent
        });
      });
    console.info(chalk.green`Rendering done.`);
  }

  public async write(outputDir: string) {
    console.info(chalk.green`Writing to "${outputDir}/"...`);
    await asyncForEach(this.compiledTemplates, async item => {
      console.info(chalk.white`Writing "${outputDir}/${item.outputFile}"...`);
      await writeFile(`${outputDir}/${item.outputFile}`, item.content);
      console.info(chalk.white`Succesful.`);
    });
    console.info(chalk.green`Writing done...`);

    await this.redirects.createRedirects(outputDir);
  }

  public async copyAssets(assetsGlobString: string, outputDir: string) {
    const files = await globby(assetsGlobString);

    console.info(chalk.green`Found ${files.length} asset file(s) to copy to "${outputDir}/"`);
    await asyncForEach(files, async srcFile => {
      // remove template folder from folder structure, it should always be the first
      const fileSegments = srcFile.split('/');
      fileSegments.shift();
      const targetFile = [outputDir, ...fileSegments].join('/');

      console.info(chalk.white`Copy "${srcFile}" to "${targetFile}"...`);
      await copyFile(srcFile, targetFile);
    });
    console.info(chalk.white`Assets succesfully copied.`);
  }

  private registerHelpers() {

    console.info(chalk.green`Register translations...`);

    Handlebars.registerHelper('translate', (key, lang) => {
      if(this.translations[lang] && this.translations[lang][key]) {
        return this.translations[lang][key]
      }

      return key;
    });

    console.info(chalk.green`Register date...`);

    Handlebars.registerHelper('convertDate', (date: Date) => {
      let result = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
      try {
        result = date.toISOString().split('T')[0].split('-').reverse().join('.');
      }
      catch (e) {
        console.info(chalk.red`The attempt to convert ${date} failed. The fallback ${result} was used.`)
      }
      return result;
    });
  }
}
