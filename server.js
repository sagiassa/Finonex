const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const app = express()
const fs = require('fs');
const { Pool } = require('pg');

const PORT = 8000;
const SECRET = 'secret';

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'node_modules')))
app.use(bodyParser.json())

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '****', //TODO enter your own password
    port: 5432,
});

const csvFilePath = path.join(__dirname, 'events_data.csv');
if (!fs.existsSync(csvFilePath)) {
    fs.writeFileSync(csvFilePath, 'userId,name,value', 'utf8');
}

function auth(req, res, next) {
    const authHeader = req.headers['authorization']
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1];

    if (token !== SECRET) {
        return res.status(403).json({ error: 'Forbidden: Invalid secret' });
    }
    next()
}

app.get('/userEvents/:userId', async (req, res) => {
    const { userId } = req.params
    const query = 'SELECT * FROM users_revenue WHERE user_id = $1'
    const response = await pool.query(query, [userId])
    if (response.rows.length > 0) {
        return res.json(response.rows[0])
    }
    return res.send({})
})



app.post('/liveEvent', auth, (req, res) => {
    const { userId, name, value } = req.body;

    if (!userId || !name || !value) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newRow = `\n${userId},${name},${value}`;

    fs.appendFile(csvFilePath, newRow, (err) => {
        if (err) {
            console.error('Error writing to CSV:', err);
            return res.status(500).json({ error: 'Failed to write to CSV' });
        }

        res.status(200).json({ message: 'Event added successfully' });
    });
})

app.listen(PORT, function (err, res) {
    if (err) {
        console.log('Server error', err);

    } else {
        console.log("the server runs on port " + PORT)
    }
})