const axios = require('axios');
const fs = require('fs');
const readline = require('readline');

const url = 'http://localhost:8000/liveEvent';
const secret = 'secret';
const filePath = './events.jsonl';
const validActions = ['add_revenue', 'subtract_revenue']
// Create a readline interface to read the file line by line
const reader = readline.createInterface({
    input: fs.createReadStream(filePath),
    creaderfDelay: Infinity
});

function validateEvent(event) {
    if (typeof event.userId === 'string' && Number.isInteger(event.value)
        && validActions.includes(event.name)) {
        return true;
    }
    return false;
}

reader.on('line', async (line) => {
    try {
        const event = JSON.parse(line);

        if (validateEvent(event)) {
            const response = await axios.post(url, event, {
                headers: {
                    'Authorization': `Bearer ${secret}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`Event sent: ${JSON.stringify(event)} - Status: ${response.status}`);
        } else {
            console.error(`Invalid event format: ${line}`);
        }
    } catch (error) {
        console.error(`Failed to send event: ${line}`);
        console.error(error.message);
    }
});

reader.on('close', () => {
    console.log('Finished processing the events file.');
});
