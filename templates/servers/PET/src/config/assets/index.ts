import {DefaultAssets} from './default';
import {TestAssets} from './test';
import {ProductionAssets} from './production';
import {DevelopmentAssets} from './development';

export type defaultAssetsType = DefaultAssets;
export type envAssetsType = TestAssets | ProductionAssets | DevelopmentAssets;
export type mergedAssetsType = defaultAssetsType & envAssetsType;