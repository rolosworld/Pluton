#!/bin/bash

dropdb pluton
createdb -E UNICODE pluton
psql pluton < sql/main.sql
psql pluton < sql/websockets.sql
psql pluton < sql/pluton.sql
