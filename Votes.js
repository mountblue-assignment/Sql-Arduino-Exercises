const fs = require('fs');
const { Pool } = require('pg');
const parseString = require('xml2js').parseString;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Arduino',
  password: 'love123',
  port: 5432,
});

fs.readFile('./data/Votes.xml', 'utf-8', (err, data) => {
  if (err) {
    console.error('Error reading XML file:', err);
    return;
  }
  parseString(data, async (parseErr, result) => {
    if (parseErr) {
      console.error('Error parsing XML:', parseErr);
      return;
    }
    try {
      const rows = Array.isArray(result.votes.row)
        ? result.votes.row
        : [result.votes.row];

      const client = await pool.connect();

      for (const row of rows) {
        console.log(rows);
        const { Id, PostId, VoteTypeId, CreationDate } = row.$;
        const query = {
          text: 'INSERT INTO votes(id, postId, VoteTypeId, CreationDate) VALUES($1, $2, $3, $4)',
          values: [Id, PostId, VoteTypeId, CreationDate],
        };

        await client.query(query);
      }

      console.log('Data inserted successfully.');
    } catch (error) {
      console.error('Error inserting data:', error);
    } finally {
      pool.end();
    }
  });
});
