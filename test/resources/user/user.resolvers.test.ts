import { JWT_SECRET } from './../../../src/utils/utils';
import * as jwt from 'jsonwebtoken';
import { UserInstance } from './../../../src/models/UserModel';
import { chai, db, app, handleError, expect } from './../../test-utils'

describe('User', () => {

    let token: string;
    let userId: number;

    beforeEach(() => {
        return db.Comment.destroy({where: {}})
            .then((rows: number) => db.Post.destroy({where: {}}))
            .then((rows: number) => db.User.destroy({where: {}}))
            .then((rows: number) =>  db.User.bulkCreate([
                {
                    name: 'Peter Quill',
                    email: 'peter@guardians.com',
                    password: '1234'
                },
                {
                    name: 'Peter Quill 2',
                    email: 'peter2@guardians.com',
                    password: '1234'
                },
                {
                    name: 'Peter Quill 3',
                    email: 'peter3@guardians.com',
                    password: '1234'
                }
            ])).then((users: UserInstance[]) => {
                userId = users[0].get('id');
                const payload = {sub: userId};
                token = jwt.sign(payload, JWT_SECRET)
            });
    });

    describe('Queries', () => {

        describe('application/json', () => {

            describe('users', () => {

                it('should return a list of Users', () => {

                    let body = {
                        query: `
                            query {
                                users {
                                    name
                                    email
                                }
                            }
                        `
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const usersList = res.body.data.users;
                            expect(res.body.data).to.be.an('object');
                            expect(usersList).to.be.an('array');
                            expect(usersList[0]).to.not.have.keys(['id', 'photo', 'createdAt', 'posts']);
                            expect(usersList[0]).to.have.keys(['name', 'email']);
                        }).catch(handleError);

                });

                it('should return a list of Users', () => {

                    let body = {
                        query: `
                            query getUsersList($first: Int, $offset: Int) {
                                users(first: $first, offset: $offset) {
                                    name
                                    email
                                    createdAt
                                }
                            }
                        `,
                        variables: {
                            first: 2,
                            offset: 1
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const usersList = res.body.data.users;
                            expect(res.body.data).to.be.an('object');
                            expect(usersList).to.be.an('array').of.length(2);
                            expect(usersList[0]).to.not.have.keys(['id', 'photo', 'posts']);
                            expect(usersList[0]).to.have.keys(['name', 'email', 'createdAt']);
                        }).catch(handleError);

                });

            });

            describe('user', () => {

                it('should return a single User', () => {

                    let body = {
                        query: `
                            query getSingleUser($id: ID!) {
                                user(id: $id) {
                                    id
                                    name
                                    email
                                    posts {
                                        title
                                    }
                                }
                            }
                        `,
                        variables: {
                            id: userId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const singleUser = res.body.data.user;
                            expect(res.body.data).to.be.an('object');
                            expect(singleUser).to.be.an('object');
                            expect(singleUser).to.have.keys(['id', 'name', 'email', 'posts']);
                            expect(singleUser.name).to.equal('Peter Quill');
                            expect(singleUser.email).to.equal('peter@guardians.com');
                        }).catch(handleError);

                });

                it('should only \'name\' attribute ', () => {

                    let body = {
                        query: `
                            query getSingleUser($id: ID!) {
                                user(id: $id) {
                                    name                                    
                                }
                            }
                        `,
                        variables: {
                            id: userId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const singleUser = res.body.data.user;
                            expect(res.body.data).to.be.an('object');
                            expect(singleUser).to.be.an('object');
                            expect(singleUser).to.have.key('name');
                            expect(singleUser.name).to.equal('Peter Quill');
                            expect(singleUser.email).to.be.undefined;
                        }).catch(handleError);

                });

                it('should return an error if user not exists ', () => {

                    let body = {
                        query: `
                            query getSingleUser($id: ID!) {
                                user(id: $id) {
                                    name
                                    email                                    
                                }
                            }
                        `,
                        variables: {
                            id: -1
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            expect(res.body.data.user).to.be.null;
                            expect(res.body.errors).to.be.an('array')
                            expect(res.body).to.have.keys(['data', 'errors'])
                            expect(res.body.errors[0].message).to.equal('Error: User with id -1 not found');
                        }).catch(handleError);

                });

            });

        });

    });

    describe('Mutations', () => {

        describe('application/json', () => {

            describe('createUser', () => {

                it('should create new User', () => {

                    let body = {
                        query: `
                            mutation createNewUser($input: UserCreateInput!) {
                                createUser(input: $input) {
                                    id
                                    name
                                    email
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: 'Drax',
                                email: 'drax@guardians.com',
                                password: '1234'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const createdUser = res.body.data.createUser;
                            expect(createdUser).to.be.an('object');
                            expect(createdUser.name).to.equal('Drax');
                            expect(createdUser.email).to.equal('drax@guardians.com');
                            expect(parseInt(createdUser.id)).to.be.a('number');
                        }).catch(handleError);

                });

            });

            describe('updateUser', () => {

                it('should update an existing User', () => {

                    let body = {
                        query: `
                            mutation updateExistingUser($input: UserUpdateInput!) {
                                updateUser(input: $input) {
                                    name
                                    email
                                    photo
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: 'Star Lord',
                                email: 'peter@guardians.com',
                                photo: '1234'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then(res => {
                            const updatedUser = res.body.data.updateUser;
                            expect(updatedUser).to.be.an('object')
                            expect(updatedUser.name).to.equal('Star Lord');
                            expect(updatedUser.email).to.equal('peter@guardians.com');
                            expect(updatedUser.photo).to.not.be.null;
                            expect(updatedUser.id).to.be.undefined;
                        }).catch(handleError);

                });

            });
            
        });

    });

});