alter table reservation
    add column reminder_sent_at timestamp;
alter table reservation
    add column sms_reminder_sent_at timestamp;

-- Every timestamp column in this schema holds Bratislava wall-clock time, so compare against the
-- local now() rather than the UTC one the database runs in.
update reservation
set reminder_sent_at     = (now() at time zone 'Europe/Bratislava'),
    sms_reminder_sent_at = (now() at time zone 'Europe/Bratislava')
where start_time < (now() at time zone 'Europe/Bratislava');

create index idx_reservation_reminder_pending
    on reservation (start_time) where reminder_sent_at is null;
create index idx_reservation_sms_reminder_pending
    on reservation (start_time) where sms_reminder_sent_at is null;
