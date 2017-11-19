#!/bin/bash

dropdb pluton
createdb -E UNICODE pluton
psql pluton < sql/main.sql
psql pluton < sql/websockets.sql
psql pluton < sql/pluton.sql

echo "To create the DB objects run (replace the <encapsulated> strings with their respective values):"
echo "perl -I lib script/create.pl model DB DBIC::Schema Pluton::Schema create=static dbi:Pg:dbname=pluton <dbuser> <dbpass>"
