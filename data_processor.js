const { eachOfLimit } = require('async')
const fs = require('fs');
const { Pool } = require('pg');
const csv = require('csv-parser')
let users = [];
let users_events = [];
let usersRevenue = {}
// PostgreSQL connection setup
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'theassa1504', //TODO remove it 
    port: 5432,
});

const db_table = fs.readFileSync('./db.sql', 'utf8')

function getAmount(name, value) {
    switch (name) {
        case "add_revenue":
            return value;
        case "subtract_revenue":
            return -1 * value;
    }
}

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
async function fetchDataFromCSV() {
    return new Promise((resolve, reject) => {
        fs.createReadStream('./events_data.csv')
            .pipe(csv())
            .on('data', (data) => users_events.push(data))
            .on('end', () => resolve(users_events))
            .on('error', (err) => reject(err));
    });
}

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
    // await pool.query(db_table)
    await fetchDataFromCSV()
    await calculateUserRevenue()
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