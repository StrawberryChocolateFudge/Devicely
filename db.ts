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
    deviceIdentifier INTEGER NOT NULL, \
    owner_id INTEGER NOT NULL, \
    videoPath TEXT NOT NULL, \
    pagePath TEXT NOT NULL, \
    name TEXT NOT NULL,\
    description TEXT NOT NULL,\
    works TEXT NOT NULL,\
    shipsTo TEXT NOT NULL,\
    price INTEGER NOT NULL,\
    stock TEXT NOT NULL\
  )"
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS userdetails( \
   id INTEGER PRIMARY KEY, \
   owner_id INTEGER NOT NULL, \
   address_line_1 TEXT NOT NULL, \
   address_line_2 TEXT, \
   country TEXT NOT NULL, \
   postCode TEXT NOT NULL, \
   fullName TEXT NOT NULL, \
   state TEXT NOT NULL, \
   ethWalletAddress TEXT NOT NULL UNIQUE, \
   emailAddress TEXT NOT NULL UNIQUE\
  )"
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS orders( \
    id INTEGER PRIMARY KEY, \
    name TEXT NOT NULL,\
    seller_id INTEGER NOT NULL, \
    seller_address TEXT NOT NULL,\
    buyer_id INTEGER NOT NULL, \
    buyer_address TEXT NOT NULL,\
    device INTEGER NOT NULL,\
    escrow_number INTEGER NOT NULL, \
    price INTEGER NOT NULL, \
    status TEXT NOT NULL, \
    shipped BOOLEAN NOT NULL \
    )"
  );
});

export default db;
