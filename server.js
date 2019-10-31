if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const expressGraphQL = require('express-graphql')
const mongoose = require('mongoose')
 mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, })

const db= mongoose.connection
db.on('error', error=> console.error(error))
db.on('open', ()=> console.log('Success Mongoose connection'))
const app= express();
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');

const authors= [
    {id: 1, name: 'J. k. Rowling', authorId: 1},
    {id: 2, name: 'J. R. R. Tolkien', authorId: 2},
    {id: 3, name: 'Brent Weeks', authorId: 3},
]

const books = [
    {id: 1, name: 'Harry Potter 1 ', authorId: 1},
    {id: 2, name: 'Harry Potter 2', authorId: 1},
    {id: 3, name: 'The two towers ', authorId: 2},
    {id: 4, name: 'The way of shadows ', authorId: 3},
    {id: 5, name: 'Beyond the shadows ', authorId: 3},
]

//Obtener los Autores
const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents an Author of te book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt)},
        name: { type: GraphQLNonNull(GraphQLString)},
        books: {
            type: new GraphQLList(BookType),
            resolve: (author)=>{
                return books.filter(book=> book.authorId=== author.id)
            }
        }
    })
})

//obtener los libros cada uno con su autor
const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt)},
        name: { type: GraphQLNonNull(GraphQLString)},
        authorId: { type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book)=>{
                return authors.find(author=> author.id === book.authorId)
            }
        }
    })
})

//default query
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: ()=>({
        book:{
            type: BookType,
            description: 'Single book',
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: (parent, args)=> books.find(book=> book.id === args.id)
        },
        author:{
            type: AuthorType,
            description: 'Singleauthors',
            args: {
                id:{
                    type: GraphQLInt
                }
            },
            resolve: (parent, args)=> authors.find(author=> author.id ===args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of books',
            resolve: ()=> books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of authors',
            resolve: ()=> authors
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root mutation',
    fields: ()=>({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args)=>{
                const book= {
                    id: books.length+1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book)
                return book
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})
app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))

app.listen(5000, ()=> console.log('server running'));

//Schema example
// const schema = new GraphQLSchema({
//     //
//     query: new GraphQLObjectType({
//         name:'HelloWorld',
//         fields: () => ({
//             message: {
//                 type: GraphQLString,
//                 //resolve=> info for the message
//                 resolve: () => 'Hello World'
//             }
//         })
//     })
// })