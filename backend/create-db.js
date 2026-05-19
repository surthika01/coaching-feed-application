const { Client } = require("pg");
require("dotenv").config();

async function createDb() {
  const client = new Client({
    host: process.env.PGHOST || "localhost",
    port: parseInt(process.env.PGPORT || "5432", 10),
    database: "postgres", // Connect to the default database
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "password",
  });

  try {
    await client.connect();
    console.log("Connected to default 'postgres' database.");
    
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'coaching_feed'");
    
    if (res.rowCount === 0) {
      console.log("Database 'coaching_feed' does not exist. Creating it now...");
      await client.query('CREATE DATABASE "coaching_feed"');
      console.log("✅ Database 'coaching_feed' created successfully!");
    } else {
      console.log("✅ Database 'coaching_feed' already exists.");
    }
  } catch (err) {
    console.error("❌ Error creating database:", err);
  } finally {
    await client.end();
  }
}

createDb();
