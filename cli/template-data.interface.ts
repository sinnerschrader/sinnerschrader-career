
export interface MatterData {
  [key: string]: string | {[key: string]: string}[] | MatterData;
}


export interface TemplateData {
  template: string;
  data: MatterData | any
}
