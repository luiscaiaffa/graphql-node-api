"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_resolver_1 = require("./../../composable/auth.resolver");
const utils_1 = require("./../../../utils/utils");
const utils_2 = require("../../../utils/utils");
const composable_resolver_1 = require("../../composable/composable.resolver");
exports.userResolvers = {
    User: {
        posts: (user, { first = 10, offset = 0 }, { db, requestedFields }, info) => {
            return db.Post
                .findAll(({
                where: { author: user.get('id') },
                limit: first,
                offset: offset,
                attributes: requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
            }))
                .catch(utils_2.handleError);
        }
    },
    Query: {
        users: (parent, { first = 10, offset = 0 }, { db, requestedFields }, info) => {
            return db.User
                .findAll({
                limit: first,
                offset: offset,
                attributes: requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
            })
                .catch(utils_2.handleError);
        },
        user: (parent, { id }, { db }, info) => {
            return db.User
                .findById(id)
                .then((user) => {
                utils_1.throwError(!user, `User with id ${id} not found`);
                return user;
            })
                .catch(utils_2.handleError);
        },
        currentUser: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((parent, args, context, info) => {
            return context.db.User
                .findById(context.authUser.id)
                .then((user) => {
                utils_1.throwError(!user, `User with id ${context.authUser.id} not found`);
                return user;
            }).catch(utils_2.handleError);
        }),
    },
    Mutation: {
        createUser: (parent, { input }, { db }, info) => {
            return db.sequelize.transaction((t) => {
                return db.User
                    .create(input, { transaction: t });
            }).catch(utils_2.handleError);
        },
        updateUser: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((parent, { input }, { db, authUser }, info) => {
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(authUser.id)
                    .then((user) => {
                    utils_1.throwError(!user, `User with id ${authUser.id} not found`);
                    return user.update(input, { transaction: t });
                });
            }).catch(utils_2.handleError);
        }),
        updateUserPassword: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((parent, { input }, { db, authUser }, info) => {
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(authUser.id)
                    .then((user) => {
                    utils_1.throwError(!user, `User with id ${authUser.id} not found`);
                    return user.update(input, { transaction: t })
                        .then((user) => !!user);
                });
            }).catch(utils_2.handleError);
        }),
        deleteUser: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((parent, { id }, { db, authUser }, info) => {
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(authUser.id)
                    .then((user) => {
                    utils_1.throwError(!user, `User with id ${authUser.id} not found`);
                    return user.destroy({ transaction: t })
                        .then(user => !!user);
                });
            }).catch(utils_2.handleError);
        })
    }
};
