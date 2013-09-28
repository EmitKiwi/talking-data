CREATE DATABASE talkingdata;

CREATE TABLE stories
(
  id text PRIMARY KEY,
  name text,
  svg text,
  geojson text,
  type text,
  done boolean DEFAULT false,
  deleted boolean DEFAULT false,
  date_created timestamp without time zone DEFAULT now()
);
