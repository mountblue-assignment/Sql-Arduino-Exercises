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

fs.readFile('./data/Comments.xml', 'utf-8', (err, data) => {
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
      const rows = Array.isArray(result.comments.row)
        ? result.comments.row
        : [result.comments.row];

      const client = await pool.connect();

      for (const row of rows) {
        const {
          Id,
          PostId,
          Score,
          Text,
          CreationDate,
          UserDisplayName,
          UserId,
          ContentLicense,
        } = row.$;
        const query = {
          text: 'INSERT INTO comments(id, postId, score, text, creationDate,userDisplayName ,userId,contentLicense) VALUES($1, $2, $3, $4,$5,$6,$7,$8)',
          values: [
            Id,
            PostId,
            Score,
            Text,
            CreationDate,
            UserDisplayName,
            UserId,
            ContentLicense,
          ],
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
