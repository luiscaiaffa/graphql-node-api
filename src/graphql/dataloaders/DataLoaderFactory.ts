import { DataLoaderParam } from './../../interfaces/DataLoaderParamInterface';
import { RequestedFields } from './../ast/RequestedFields';
import { PostLoader } from './PostLoader';
import { PostInstance } from './../../models/PostModel';
import { UserLoader } from './UserLoader';
import { UserInstance } from './../../models/UserModel';
import * as DataLoader from 'dataloader';

import { DataLoaders } from './../../interfaces/DataLoadersInterface';
import { DbConnection } from './../../interfaces/DbConnectionInterface';
export class DataLoaderFactory {

    constructor(
        private db: DbConnection,
        private requestedFields: RequestedFields
    ) {}

    getLoaders(): DataLoaders {
        return {
            userLoader: new DataLoader<DataLoaderParam<number>, UserInstance>(
                (params: DataLoaderParam<number>[]) => UserLoader.batchUsers(this.db.User, params, this.requestedFields),
                { cacheKeyFn:  (param: DataLoaderParam<number[]>) => param.key }
            ),
            postLoader: new DataLoader<DataLoaderParam<number>, PostInstance>(
                (params: DataLoaderParam<number>[]) => PostLoader.bachPosts(this.db.Post, params, this.requestedFields),
                { cacheKeyFn:  (param: DataLoaderParam<number[]>) => param.key }
            )
        }
    }

}