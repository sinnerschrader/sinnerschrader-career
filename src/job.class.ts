import html from 'rehype-stringify';
import markdownParser from 'remark-parse';
import remark2rehype from 'remark-rehype';
import unified from 'unified';
import {Contact} from './contact.class';
import {Contacts} from './contacts';
import {coerceBoolean} from './utils';

export class Job {
  public id: string;
  public content: string;
  public language: 'de' | 'en';
  public location: string;
  public discipline: string;
  public level: string;
  public published: boolean;
  public contact: Contact;
  public date: string;
  public title: string;
  public description: string;

  // this needs to be a little bit more complex
  get wrappedContent(): string {
    return `<div id="job-${this.id}">\n${this.content}\n</div>`;
  }

  constructor(data, contacts: Contacts) {
    this.convertContent(data.content).then(convertedData => {
      this.content = convertedData;
    });

    this.id = String(Math.floor(Math.random() * 100000));

    this.language = data.data.language;
    this.location = data.data.location;
    this.discipline = data.data.discipline;
    this.level = data.data.level;
    this.date = data.data.date;
    this.title = data.data.title;
    this.description = data.data.description;

    this.contact = contacts.getContact(data.data.contact ? data.data.contact : 'default');

    this.published = coerceBoolean(data.data.published);
  }

  private convertContent(content: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      unified()
        .use(markdownParser)
        .use(remark2rehype)
        .use(html)
        .process(content, (err, file) => {
          if (err) {
            reject(err);
          } else {
            resolve(String(file));
          }
        });
    });
  }
}
