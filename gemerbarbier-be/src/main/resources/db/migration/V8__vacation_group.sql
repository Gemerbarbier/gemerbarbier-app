-- Groups the slot-sized reservations created by one vacation request, so the admin list can show
-- them as a single block.
alter table reservation
    add column vacation_group_id varchar(36);
