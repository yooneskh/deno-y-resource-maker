import { ensureFile } from 'https://deno.land/std@0.220.1/fs/mod.ts';
import { paramCase } from 'https://deno.land/x/case@2.2.0/mod.ts';
import { plural } from 'https://deno.land/x/deno_plural@2.0.0/mod.ts';


const [ model, basePath, moduleName ] = Deno.args;
const modelSnaked = paramCase(model);
const modelSnakedPlural = paramCase(plural(model));
const moduleNameSnaked = moduleName ? paramCase(moduleName) : '';

console.log({ model, basePath, modelSnaked, modelSnakedPlural, moduleName, moduleNameSnaked });


const baseDirectory = `${basePath}/${modelSnakedPlural}`;

const interfacesFile = `${baseDirectory}/interfaces.d.ts`;
const resourceFile = `${baseDirectory}/resource.ts`;
const modelFile = `${baseDirectory}/model.ts`;
const controllerFile = `${baseDirectory}/controller.ts`;
const routerFile = `${baseDirectory}/router.ts`;


const interfacesContent = (
`import { IResourceBase } from 'resource-maker';


export interface I${model}Base {
  name: string;
} export interface I${model} extends I${model}Base, IResourceBase {};
`);

const resourceContent = (
`import { ResourceMaker } from 'resource-maker';
import { I${model}Base, I${model} } from './interfaces.d.ts';


export const ${model}Maker = new ResourceMaker<I${model}Base, I${model}>('${model}');
`);

const modelContent = (
`import { ${model}Maker } from './resource.ts';


${model}Maker.setProperties({
  name: {
    type: 'string',
    required: true,
    titleable: true,
  },
});


${model}Maker.makeModel();
`);

const controllerContent = (
`import { ${model}Maker } from './resource.ts';
import './model.ts';


export const ${model}Controller = ${model}Maker.getController();


${model}Maker.addValidations({

});
`);

const routerContent = (
`import { ${model}Maker } from './resource.ts';
import './controller.ts';


${model}Maker.addActions({
  'list': {
    template: 'list',
    permission: 'admin${moduleNameSnaked ? `.${moduleNameSnaked}` : ''}.${modelSnaked}.list',
  },
  'count': {
    template: 'count',
    permission: 'admin${moduleNameSnaked ? `.${moduleNameSnaked}` : ''}.${modelSnaked}.count',
  },
  'retrieve': {
    template: 'retrieve',
    permission: 'admin${moduleNameSnaked ? `.${moduleNameSnaked}` : ''}.${modelSnaked}.retrieve',
  },
  'create': {
    template: 'create',
    permission: 'admin${moduleNameSnaked ? `.${moduleNameSnaked}` : ''}.${modelSnaked}.create',
  },
  'update': {
    template: 'update',
    permission: 'admin${moduleNameSnaked ? `.${moduleNameSnaked}` : ''}.${modelSnaked}.update',
  },
  'delete': {
    template: 'delete',
    permission: 'admin${moduleNameSnaked ? `.${moduleNameSnaked}` : ''}.${modelSnaked}.delete',
  },
});


export const ${model}Router = ${model}Maker.getRouter();
`);


await ensureFile(interfacesFile);
await Deno.writeTextFile(interfacesFile, interfacesContent);

await ensureFile(resourceFile);
await Deno.writeTextFile(resourceFile, resourceContent);

await ensureFile(modelFile);
await Deno.writeTextFile(modelFile, modelContent);

await ensureFile(controllerFile);
await Deno.writeTextFile(controllerFile, controllerContent);

await ensureFile(routerFile);
await Deno.writeTextFile(routerFile, routerContent);
