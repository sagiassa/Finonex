const { eachOfLimit } = require('async')
const fs = require('fs');
const { Pool } = require('pg');
const csv = require('csv-parser')
let users = [];
let users_events = [];
let usersRevenue = {}

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '****', //TODO enter your own password
    port: 5432,
});

const db_table = fs.readFileSync('./db.sql', 'utf8')

// A functions that check if the revenue table is already created ot needed to be created
async function getOrCreateUserRevenue() {
    try {
        await pool.query('SELECT * FROM users_revenue');
        console.log('Table ensured.');
    } catch (err) {
        console.log('Table was not created yet.');
        await pool.query(db_table)
        console.log('created users revnue table.')
    }
}

// A function that returns the amount that needs to be added\subtract based on the action name
function getAmount(name, value) {
    switch (name) {
        case "add_revenue":
            return value;
        case "subtract_revenue":
            return -1 * value;
        default:
            throw Error('Unvalid action')
    }
}

// A function that upserts the amount to the user's revenue.
async function updateRevenue({ userId, value }) {
    const query = 'SELECT update_revenue($1, $2)';
    const values = [userId, value];
    try {
        const res = await pool.query(query, values);
        console.log('Revenue updated successfully', res);
    } catch (err) {
        console.error('Error updating revenue', err.stack);
    }
}

// A function that fetches the data from the local CSV
async function fetchDataFromCSV() {
    return new Promise((resolve, reject) => {
        fs.createReadStream('./events_data.csv')
            .pipe(csv())
            .on('data', (data) => users_events.push(data))
            .on('end', () => resolve(users_events))
            .on('error', (err) => reject(err));
    });
}

// A function that calculates user's transactions based on the events that were added by the client
async function calculateUserRevenue() {
    users = [...new Set(users_events.map(event => event.userId))]
    console.log(users)
    users.map(user => {
        users_events.map(event => {
            if (event.userId === user) {
                let value = getAmount(event.name, Number(event.value))
                if (usersRevenue[user]) {
                    usersRevenue[user].value += value;
                } else {
                    usersRevenue[user] = {
                        userId: user,
                        value
                    };
                }
            }
        })
    })
}

(async = async () => {
    await getOrCreateUserRevenue();
    await fetchDataFromCSV();
    await calculateUserRevenue();
    await eachOfLimit(users, 1, async (user, key) => {
        try {
            await updateRevenue(usersRevenue[user]);
            console.log(`Successfully updated ${key + 1}/${users_events.length}`)
        } catch (error) {
            console.log(`Failed to update user ${user}`, error)
        }
    })
    pool.end();
})()