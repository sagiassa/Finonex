# Finonex home assignment - Sagi Assa

## Overview

This project involves running a server, client, and data processor. The client makes requests to the server, and the data processor handles all events data and upsert them to the postgresSQL DB.

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- A PostgreSQL database set up and configured.
- Change the DB params in the server and data processor files. (pool initialization)
  
### Running the Server

To start the server, run the following command:

```bash
node server.js

### Running the Client

After starting the server, run the client to make requests:

```bash
node client.js

### Running the Script

To run the data processor, execute the following command:

```bash
node data_processor.js
