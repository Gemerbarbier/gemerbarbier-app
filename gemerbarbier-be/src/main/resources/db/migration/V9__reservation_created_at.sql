-- Personal data in a reservation is kept for a limited time counted from when it was created.
-- Existing rows have no creation time; their start time is the closest known upper bound.
alter table reservation
    add column created_at timestamp;

update reservation
set created_at = least(start_time, (now() at time zone 'Europe/Bratislava'))
where created_at is null;

update reservation
set created_at = (now() at time zone 'Europe/Bratislava')
where created_at is null;

alter table reservation
    alter column created_at set default (now() at time zone 'Europe/Bratislava'),
    alter column created_at set not null;

create index idx_reservation_created_at on reservation (created_at);
