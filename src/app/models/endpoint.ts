export class Endpoint {
  public name: string;
  public lang: string;
  // deprecated
  public tags: string[];
  public execute: string;
  public className: string;
  public defaultContext: string;
  public contextSettings: JSON;
  public file: File;
  public endpointStore: string;
  public path: string;

  constructor(endpointInfo: Object) {
    this.name = endpointInfo['name'];
    this.lang = endpointInfo['lang'];
    // deprecated
    this.tags = endpointInfo['tags'];
    this.execute = JSON.stringify(endpointInfo['execute']) || null;
    this.defaultContext = endpointInfo['defaultContext'];
    this.className = endpointInfo['className'];
    this.file = endpointInfo['file'];
    this.contextSettings = endpointInfo['contextSettings'];
    this.endpointStore = endpointInfo['endpointStore'];
    this.path = endpointInfo['path'];
  }

  executeExample() {
    let execute = JSON.parse(this.execute);
    let generatedObject: object = {};
    for (let key in execute) {
        let newObj: object = {};
        newObj[key] = this.make(execute[key]);
        Object.assign(generatedObject, newObj);
    }
    if (Object.keys(generatedObject).length === 0) {
      return '';
    } else {
      return JSON.stringify(generatedObject, null, "\t");
    }
  }

  private make(paramType) {
    let t = paramType.type;
    let args = paramType.args;
    if (t == 'MString') {
        return 'string';
    }
    if (t == 'MAny') {
        return {};
    }
    if (t == 'MMap') {
        let newObj = {};
        newObj[this.make(args[0])] = this.make(args[1]);
        return newObj;
    }
    if (t == 'MInt') {
        return Math.round(Math.random() * 10);
    }
    if (t == 'MDouble') {
        return Math.random() * 10;
    }
    if (t == 'MList') {
        let list = [];
        list.push(this.make(args[0]));
        return list;
    }
    if (t == 'MOption') {
        return this.make(args[0]);
    }
    if (t == 'MObj') {
        let newObj = {};
        for (let key in paramType.fields) {
          newObj[key] = this.make(paramType.fields[key]);
        }
        return newObj;
    }

  }
}
