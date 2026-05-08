-- Migration: add filter columns that were missing from the initial schema
-- Run this once against your Cloudflare D1 database
-- Command: npx wrangler d1 execute <DB_NAME> --file=migrations/add_filter_columns.sql

ALTER TABLE collections ADD COLUMN style      TEXT DEFAULT '[]';
ALTER TABLE collections ADD COLUMN fabrics    TEXT DEFAULT '[]';
ALTER TABLE collections ADD COLUMN type       TEXT DEFAULT '';
ALTER TABLE collections ADD COLUMN stitchType TEXT DEFAULT '';
