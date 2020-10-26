import chalk from 'chalk';
import globby from 'globby';
import matter from 'gray-matter';
import {Contact} from './contact.class';
import {asyncForEach, readFile} from './utils';

export class Contacts {
  private contacts: Contact[] = [];

  constructor(private globString: string) {
  }

  public async loadContacts() {
    const files = await globby(this.globString);
    console.info(chalk.green`Found ${files.length} contact file(s)`);

    console.info(chalk.white`Loading contacts...`);
    await asyncForEach(files, async (file) => {
      const rawContent = await readFile(file);
      const structuredData = await matter(rawContent);

      this.contacts.push(new Contact(structuredData, file));
    });
    console.info(chalk.white`Contact loading done.`);
  }

  public getContact(id: string): Contact {
    return this.contacts.find(it => it.id === id);
  }
}
