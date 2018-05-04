import {envDefault} from './default';
import {envDevelopment} from './development';
import {envTest} from './test';
import {envProduction} from './production';

export type defaultEnvType = envDefault;
export type envEnvType = envTest | envProduction | envDevelopment;
export type mergedEnvType = envDefault & envEnvType;

export interface secureType {
  ssl: boolean,
  privateKey: string,
  certificate: string,
  caBundle: string
}