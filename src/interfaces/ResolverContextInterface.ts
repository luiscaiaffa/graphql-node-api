import { RequestedFields } from './../graphql/ast/RequestedFields';
import { DataLoaders } from './DataLoadersInterface';
import { AuthUser } from "./AuthUserInterface";
import { DbConnection } from "./DbConnectionInterface";

export interface ResolverContext {
    db?: DbConnection;
    authorization?: String;
    authUser?: AuthUser;
    dataloaders?: DataLoaders;
    requestedFields?: RequestedFields;
}