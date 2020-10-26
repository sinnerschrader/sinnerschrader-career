
# General

This repository includes three parts.  
Part one is the `cli` folder that includes the code to build the Sinnnerschrader career page.  
Part two is the `template` folder that includes all template related information. it uses handlebar.  
Part three is the `data` folder that includes the jobs, contact person and all other informations, that are written
in markdown and compiled to the final page that is located in `docs`.

## CLI

Within the `cli` folder all code to build the sinnerschrader-career page is located. It contains the following important files.
The `index.ts` is the entry file called that is setting everything up.  
The `renderer.ts` is the class that loads the template data, wraps handlebar, compiles the data and writes it to `docs`.  
The `jobs.ts` and `contacts.ts` classes are specific to load the data for contacts and jobs and provide them for later
rendering.  

Two basic commands exist `build`, which can be executed via `yarn build` and `watch`,
which watches all files within `template/` and rerenders the `docs`.

Hint: the watch is currently kept simple and rerender everything if any file changes within `template`.


## Data

The `data` folder includes all changeable data for the Sinnerschrader career page.
It uses *markdown* and *front matter* to structure the information. Data is divided in `jobs` and `contact-persons`.

### Markdowns

#### What is Markdown

TODO: find a good tutorial or explanation

#### What is front matter

TODO: find a good tutorial or explanation

### Jobs

In the folder `data/jobs` are all job position located. Each job offer is one markdown file. The folder structure below  
`data/jobs/` and the file name are up for the editors to define and will have no affect on the later
renderer Sinnerschrader career page. 

#### Front matter

A job markdown always has to inlcude a front matter with the following information

|key|input|description|mandatory|
| :---: | :---: | :---: | :---: |
|language | `en`/ `de`| defines the language for the job post| yes |
|location | `Ber`/ `Fra`/ `Ham`/ `Muc` / `Pra` | Short key for the location the job will be located at | yes |
|discipline | `Account`/ `Creative`/ `Strategy`/ `Tech`| This key is to provide the information for the discipline | yes |
|level | `Internships`/ `Professionals`/ `Students`/ `Young Professionals` | What level of professionality is searched for | yes |
|company | `SinnerSchrader`/ `Swipe`/ `Commerce` | TODO: do we need this? | maybe |
|date | example `2020-10-21` | The date this job post was published (it will not be auto published) the format is year - month (always two digits) - day (always to digits)| maybe |
|published | `true`/ `false` | This flag defines if the job post will be published or not | yes |
|title | Text | The title shown for this job post, it will also be used for social sharing | yes |
|description | Text | The description will only be used for social sharing | no |
|contact | `contact key` | This is the file name of the contact data that will be shown. e.g. 'victoria'. If not provided the 'default' contact will be used| no |

#### Content

The content of each markdown file within jobs will be rendered into the later page and detail pages. 
Please don't start with the title as that one will be taken from the _front matter_. The language used in the content
should match the language provided in _front matter_ of the file.

### Contacts

In the folder `data/contact-persons/` holds all contacts that are connectable to the jobs.  
The file name becomes the key to referr to in the `jobs` files, so keep it simple in lower case and without spaces.   
There should always be a file named `default` as a fallback if a job doesn't have a contact person.  

The contact files for now only include _front matter_.

#### Front matter

|key|example|description|mandatory|
| :---: | :---: | :---: | :---: |
|name| Victoria Breuer| Name of the contact person | yes |
|level| Talent Acquisition| Title of the contact person | maybe |
|phone| +49 40 398855 485| phone number of the contact person| yes |
|mail| jobs@sinnerschrader.com| email address of the contact person| yes |
|xing| https://www.xing.com/profile/Victoria_Breuer2/cv| xing profile url of the contact person | no |
|linkedin| https://www.linkedin.com/in/victoria-breuer-045832182/|linkedin profile url of the contact person | no |



## Templates

The `template` folder includes all template files needed to render the Sinnerschrader career page.
Handlebar is used for templating. The job and contact data will be provided to those templates.

The folder structure will be transfered to the final `docs` folder after rendering. All file names that DO NOT
start with a underscore, will be named exactly as given.  
All files that starts with an underscore in the file name (e.g. `_detail.html`) will be rendered with a different file
name into `docs`. Currently we use the job title as a file name (to be discussed).  
All files within `template/assets/` will be copied to `docs` without changing anything.  
All files within `template/partials/` will be provided to the other templates as *Handlebar* partials. 
The file name will become the partial name in camelCase (example: `de-job-detail.html` will be available as `deJobDetail`).

Currently the following file names/ paths are hardwired to the respective markdown information.

`template/de/index.html` - will get all German (`language: de`) jobs as an array as well as a `metaInfos` string with all metadata of those jobs.  
`template/en/index.html` - will get all English (`language: en`) jobs as an array as well as a `metaInfos` string with all metadata of those jobs.  

`template/de/_detail.html` - will be used for the detail view of every German (`language: de`) job.
`template/en/_detail.html` - will be used for the detail view of every English (`language: en`) job.  

The partials are not related to languages so if they need a special treatment for seperate languages they need to be
provided twice with (for example) the language as a prefix   
   
   
### Data

The following data are provided for the templates.

`template/**/index.html`:  

* metaInfos: a stringified array of all published jobs for the current language with the following properties
```
id: auto-generate 5 digit id (changes each compilation)
location: location as provided in the front matter
discipline: discipline as provided in the front matter
level: level as provided in the front matter
company: company as provided in the front matter   
```
* jobs: an array of all published jobs for the current language. For the properties see `_detail.html` template. 


`template/**/_detail.html`:  

The following data is provided for this template based on the current language and if the job is published.

```
content: renderer html for the job,
title: title of the job,
id: auto-generate 5 digit id (changes each compilation)
date: date in the format yyyy-mm-dd
contact.name: name of the contact person
contact.level: level of the contact person
contact.phone: phonenumber of the contact person
contact.mail: mail of the contact person
contact.xing: xing of the contact person (if provided)
contact.linkedin: linkedin of the contact person (if provided
```
