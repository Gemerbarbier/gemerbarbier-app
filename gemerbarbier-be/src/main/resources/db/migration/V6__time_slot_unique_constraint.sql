ALTER TABLE time_slot
ADD CONSTRAINT uk_barber_start UNIQUE (barber_id, start_time);
