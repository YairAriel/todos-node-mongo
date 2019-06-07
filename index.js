// const http = require('http');

// http.createServer((request, response) => {
//     response.writeHead(200, {'Content-Type': 'text/plain'});
//     response.end('Hello from server!!');
// })
// .listen(3000);

// console.log('Server is running on localhost:3000');

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const mongodb = require('mongodb');

const app = express();
app.use(bodyParser.json());
app.use(cors());

let collection = null;
(async () => {
    const url = 'mongodb+srv://admin:admin@cluster0-fbusi.mongodb.net/test?retryWrites=true&w=majority';
    const connection = await mongodb.connect(url);
    const db = connection.db('mydb');
    collection = db.collection('todos');
})()

app.get('/todos', async (req, res) => {
    res.send(await collection.find({}).toArray())
});

app.get('/todos/:id', async (req, res) => {
    res.send(await collection.findOne({_id: +req.params.id}))
});

app.post('/todos', async (req, res) => {
    const { _id: maxId } = await collection.find({}).sort({ _id: -1 }).next();
    const { title, completed } = req.body;

    try {
        await collection.insertOne({ _id: maxId + 1, title, completed });
        res.status(200).json('OK!');
    } catch (e) {
        res.send(e);
    }
});

app.put('/todos/:id', async (req, res) => {
    const { title, completed } = req.body;
    await collection.updateOne(
        { _id: +req.params.id },
        { $set: { title, completed }}
    );
    res.status(200).json('ok');
});

app.delete('/todos/:id', async (req, res) => {
    try {
        await collection.deleteOne({ _id: +req.params.id });
        res.status(200).json('ok');
    } catch (e) {
        res.send(e);
    }
});

app.get('/reset-db', async(req, res) => {
    try {
        await collection.deleteMany({});
        const initialTodos = [
            {
                "_id": 0,
                "title": "Learn node.js",
                "completed": false
            },
            {
                "_id": 1,
                "title": "Learn vue.js",
                "completed": true
            }
        ];
        collection.insertMany(initialTodos);
        res.status(200).json('Reset completed!');
    } catch(e) {
        res.send(e);
    }
});

app.get('/test-get', async (req, res) => {
    const fetchResp = await fetch('http://localhost:3000/todos');
    const json = await fetchResp.json();
    res.send(json);
});

app.get('/test-post', async (req, res) => {
    try {
        const fetchResp = await fetch('http://localhost:3000/todos', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'check',
                completed: false
            })
        });
        const json = await fetchResp.json();
        res.send(json);
    } catch (e) {
        res.send(e);
    }
})

app.listen(3000, console.log('Server is running on localhost:3000....'));