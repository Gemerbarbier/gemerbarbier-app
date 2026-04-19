CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE reservation
    DROP CONSTRAINT IF EXISTS no_overlap;

ALTER TABLE reservation
    ADD CONSTRAINT no_overlap
        EXCLUDE USING gist (
        barber_id WITH =,
        tsrange(start_time, end_time) WITH &&
        )
        WHERE (status = 'CREATED');
