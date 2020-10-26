import fs from "fs";

export async function asyncForEach<T>(arr: T[], callback: (T) => void) {
  for (let i = 0; i < arr.length; i++) {
    await callback(arr[i]);
  }
}

export function coerceBoolean(value: any): boolean {
  return !!value;
}

export function readFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err: any, data: any) => {
      err ? reject(err) : resolve(data);
    });
  });
}

export function enforceFolder(folder: string | string[]) {
  let folders;

  if (Array.isArray(folder)) {
    folders = [...folder];
  } else {
    folders = folder.split('/');
  }

  folders.reduce(
    (acc, folder) => {
      const folderPath = acc + folder + '/';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }
      return folderPath;
    },
    ''
  );
}

export function writeFile(filePath: string, data: string): Promise<void> {
  return new Promise((resolve, reject) => {

    enforceFolder(filePath.split('/').slice(0, -1));  // remove last item as it is the file name

    fs.writeFile(filePath, data, (err: any) => {
      err ? reject(err) : resolve();
    });
  });
}

export function copyFile(srcFilePath: string, targetFilePath: string): Promise<void> {
  return new Promise( (resolve, reject) => {
    enforceFolder(targetFilePath.split('/').slice(0, -1));

    if(fs.existsSync(targetFilePath)) {
      // remove the existing file as we want to overwrite it
      fs.unlinkSync(targetFilePath);
    }

    fs.copyFile(srcFilePath, targetFilePath, (err: any) => {
      err ? reject(err) : resolve();
    });
  });
}

export function camelize(str) {
  return str.replace(
    /([-_][a-z])/g,
    (group) => group.toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );
}

export function normalize(str) {
  if (typeof str === 'string') {
    return str.toLowerCase()
      .replace(/ /g, '-')
      .replace(/\//g, '')
      .replace(/\(/g, '')
      .replace(/\)/g, '');
  }
  return '';
}
