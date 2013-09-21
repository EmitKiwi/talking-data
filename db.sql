-- Table: talkingdata

-- DROP TABLE talkingdata;

CREATE TABLE talkingdata
(
  id serial NOT NULL,
  name text,
  svg text,
  geojson text,
  geom geometry,
  date_created timestamp without time zone DEFAULT now()
)
WITH (
  OIDS=FALSE
);
ALTER TABLE talkingdata
  OWNER TO postgres;
