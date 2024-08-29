# Finonex home assignment - Sagi Assa

## Overview

This project involves running a server, client, and data processor. The client makes requests to the server, and the data processor handles all events data that were saved locally and upsert them to the PostgreSQL DB.

I added the creation of the DB table in the data processot script. 

## DB.sql

There is a function for updating the revenue of each user. I used the lock mechanism in order to prevent from two processes to run on the same user in parallel.

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- A PostgreSQL database set up and configured (both in server and data processot files).
  
### Running the Server

To start the server, run the following command:

`node server.js`

### Running the Client

After starting the server, run the client to make requests:

`node client.js`

### Running the Script

To run the data processor, execute the following command:

`node data_processor.js`
