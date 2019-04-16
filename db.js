const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

client.connect();

const query = 'SELECT table_schema,table_name FROM information_schema.tables;';
var user = {};

client.query(query, (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});
let data = JSON.stringify(user, null, 2);
fs.writeFileSync('user-data.json', data);
