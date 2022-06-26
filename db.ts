import sqlite3 from "sqlite3";
import mkdirp from "mkdirp";

mkdirp.sync("./var/db");

const db = new sqlite3.Database("./var/db/devices.db");

db.serialize(function () {
  // create the database schema for the todos app
  db.run(
    "CREATE TABLE IF NOT EXISTS users ( \
    id INTEGER PRIMARY KEY, \
    username TEXT UNIQUE, \
    hashed_password BLOB, \
    salt BLOB, \
    name TEXT, \
    email TEXT UNIQUE, \
    email_verified INTEGER \
  )"
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS federated_credentials ( \
    id INTEGER PRIMARY KEY, \
    user_id INTEGER NOT NULL, \
    provider TEXT NOT NULL, \
    subject TEXT NOT NULL, \
    UNIQUE (provider, subject) \
  )"
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS devices ( \
    id INTEGER PRIMARY KEY, \
    owner_id INTEGER NOT NULL, \
    videoPath TEXT NOT NULL, \
    dataPath TEXT NOT NULL, \
    shippingRequested BOOLEAN NOT NULL, \
    shipped BOOLEAN NOT NULL \
  )"
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS shipping( \
   id INTEGER PRIMARY KEY, \
   owner_id INTEGER NOT NULL, \
   address_line_1 TEXT NOT NULL, \
   address_line_2 TEXT, \
   country TEXT NOT NULL, \
   postCode TEXT NOT NULL, \
   fullName TEXT NOT NULL, \
   state TEXT NOT NULL \
  )"
  );
});

export default db;