import chalk from 'chalk';
import {Contact} from './contact.class';
import {Contacts} from './contacts';
import {Job} from './job.class';
import {Jobs} from './jobs';
import {Renderer} from './renderer';
import {TemplateData} from './template-data.interface';
import watch from 'node-watch';

function transformContact(contact: Contact) {
  if (contact === undefined) {
    return;
  }
  return {
    name: contact.name,
    level: contact.level,
    phone: contact.phone,
    mail: contact.mail,
    xing: contact.xing,
    linkedin: contact.linkedin
  };
}

function transformJob(job: Job): { [key: string]: string | { [key: string]: string } } {
  return {
    content: job.content,
    title: job.title,
    id: job.id,
    date: job.date,
    contact: transformContact(job.contact)
    // TODO: provide more meta data for job?
  };
}

function transformJobs(jobs: Job[]) {
  return jobs.map(transformJob);
}

function transformDataForOverview(template: string, jobs: Job[], jobsMetadata): TemplateData {
  return {
    template,
    data: {
      jobs: transformJobs(jobs),
      metaInfos: JSON.stringify(jobsMetadata)
    }
  }
}

function transformDataForDetail(template: string, job: Job): TemplateData {
  return {
    template,
    data: transformJob(job)
  }
}

async function collectMarkdown() {

  const contacts = new Contacts('contact-persons/**/*.md');
  await contacts.loadContacts();
  const jobs = new Jobs('jobs/**/*.md');
  jobs.addContacts(contacts);
  await jobs.loadJobs();
  const germanJobs = jobs.getJobsForLanguage('de');
  const englishJobs = jobs.getJobsForLanguage('en');
  const germanMetadata = jobs.getJobMetadataForLanguage('de');
  const englishMetadata = jobs.getJobMetadataForLanguage('en');

  console.info(chalk.green`${germanJobs.length} German jobs will be published`);
  console.info(chalk.green`${englishJobs.length} English jobs will be published`);

  // generate data for template
  const germanData = transformDataForOverview('template/de/index.html', germanJobs, germanMetadata);
  const englishData = transformDataForOverview('template/en/index.html', englishJobs, englishMetadata);

  const germanDetailData = germanJobs.map(job => transformDataForDetail('template/de/_detail.html', job));
  const englishDetailData = englishJobs.map(job => transformDataForDetail('template/en/_detail.html', job));

  return [germanData, englishData, ...germanDetailData, ...englishDetailData];
}

async function main() {
  const data = await collectMarkdown();
  const renderer = new Renderer('template/**/*.html');
  await renderer.loadTemplates();
  renderer.compile(data);

  await renderer.write('docs');

  console.info(chalk.green`Done`);
  return {renderer, data};
}

async function watchTemplates() {
  // The watch mode is not sophisticated yet. It works and as long as the project size isn't to big it works
  // just fine. We want to keep it simple
  const {renderer, data} = await main();
  console.info(chalk.green`Start watching 'template/`);
  watch('template/', {recursive: true},async (evt, name) => {
    console.info(chalk.redBright`${name} changed.`);
    await renderer.loadTemplates();
    await renderer.compile(data);
    await renderer.write('docs');
    console.info(chalk.green`Keep watching 'template/`);
  });

}

switch (process.argv[2]) {
  case 'watch':
    watchTemplates();
    break;
  case 'build':
  default:
    main();
    break;
}
