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

fs.readFile('./data/Users.xml', 'utf-8', (err, data) => {
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
      const rows = Array.isArray(result.users.row)
        ? result.users.row
        : [result.users.row];

      const client = await pool.connect();

      for (const row of rows) {
        console.log(rows);
        const {
          Id = null,
          Reputation = null,
          CreationDate = null,
          DisplayName = null,
          LastAccessDate = null,
          WebsiteUrl = null,
          Location = null,
          AboutMe = null,
          Views = null,
          UpVotes = null,
          DownVotes = null,
          ProfileImageUrl = null,
          EmailHash = null,
          AccountId = null,
        } = row.$;
        const query = {
          text: 'INSERT INTO users(id, reputation, creationDate , displayName , lastAccessDate, websiteUrl , location , aboutMe, views , upVotes , downVotes , profileImageUrl , emailHash , accountId ) VALUES($1, $2, $3, $4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)',
          values: [
            Id,
            Reputation,
            CreationDate,
            DisplayName,
            LastAccessDate,
            WebsiteUrl,
            Location,
            AboutMe,
            Views,
            UpVotes,
            DownVotes,
            ProfileImageUrl,
            EmailHash,
            AccountId,
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
