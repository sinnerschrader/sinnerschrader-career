export class Contact {
  public id: string;
  public name: string;
  public level: string;
  public phone: string;
  public mail: string;
  public xing: string;
  public linkedin: string;

  constructor(data, filePath: string) {

    const fileSegments = filePath.replace('.md', '').split('/');
    this.id = fileSegments[fileSegments.length - 1];

    this.name = data.data.name;
    this.level = data.data.level;
    this.phone = data.data.phone;
    this.mail = data.data.mail;
    this.xing = data.data.xing;
    this.linkedin = data.data.linkedin;
  }
}
