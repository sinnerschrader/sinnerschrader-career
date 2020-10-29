import chalk from 'chalk';
import {Contact} from './contact.class';
import {Contacts} from './contacts';
import {Job} from './job.class';
import {Jobs} from './jobs';
import {Renderer} from './renderer';
import {TemplateData} from './template-data.interface';
import handler from 'serve-handler';
import http from 'http';

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
    level: job.level,
    language: job.language,
    discipline: job.discipline,
    location: job.location,
    company: job.company,
    description: job.description,
    id: job.id,
    date: job.date,
    contact: transformContact(job.contact)
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

  const contacts = new Contacts('data/contact-persons/**/*.md');
  await contacts.loadContacts();
  const jobs = new Jobs('data/jobs/**/*.md');
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

async function main(baseHref: string) {
  const data = await collectMarkdown();
  const renderer = new Renderer('template/**/*.html');
  await renderer.loadTranslations('data/translations/en.yml', 'data/translations/de.yml');
  await renderer.loadTemplates();
  await renderer.loadRedirects();
  renderer.compile(data, baseHref);

  await renderer.write('docs');
  await renderer.copyAssets('template/assets/**/*.*', 'docs');

  console.info(chalk.green`Build done`);
  return {renderer, data};
}

async function serve(baseHref: string) {
  await main(baseHref);
  console.info(chalk.green`Start serving...`);

  const server = http.createServer((request, response) => {
    return handler(request, response);
  });

  server.listen(3000, () => {
    console.log('Running at http://localhost:3000/docs/en/');
  });


}

switch (process.argv[2]) {
  case 'serve':
    serve('http://localhost:3000/docs/');
    break;
  case 'build':
  default:
    main(process.argv[3]);
    break;
}
