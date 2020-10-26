import chalk from 'chalk';
import globby from 'globby';
import matter from 'gray-matter';
import {Contacts} from './contacts';
import {Job} from './job.class';
import {asyncForEach, readFile} from './utils';

export class Jobs {
  private compiledJobs: Job[] = [];
  private contacts: Contacts;

  constructor(private globString: string) {
  }

  public async loadJobs() {
    if (this.contacts === undefined) {
      console.error(chalk.red.bold`Contacts are not defined`);
      throw('Contacts needs to be added!');
    }
    const files = await globby(this.globString);
    console.info(chalk.green`Found ${files.length} job file(s)`);

    console.info(chalk.white`Loading jobs...`);
    await asyncForEach(files, async (file) => {
      const rawContent = await readFile(file);
      const structuredData = await matter(rawContent);
      this.compiledJobs.push(new Job(structuredData, this.contacts));
    });
    console.info(chalk.white`Job loading done.`);
  }

  public getJobsForLanguage(language: string): Job[] {
    return this.compiledJobs
      .filter(it => it.published)
      .filter(it => it.language === language);
  }

  public getJobMetadataForLanguage(language: string) {
    return this.getJobsForLanguage(language)
      .map(item => {
        return {
          id: item.id,
          location: item.location,
          discipline: item.discipline,
          level: item.level,
          company: item.company
        }
    });
  }

  public addContacts(contacts: Contacts) {
    this.contacts = contacts;
  }
}
