create table users
(
    id       bigserial primary key,
    username varchar(255),
    password varchar(255)
);

create table barber
(
    id   bigserial primary key,
    name varchar(255)
);
create table cut_service
(
    id               bigserial primary key,
    name             varchar(255),
    duration_minutes int,
    price            int
);
create table reservation
(
    id             bigserial primary key,
    customer_name  varchar(255),
    customer_email varchar(255),
    customer_phone varchar(255),
    note           varchar(255),
    barber_id      bigint references barber (id),
    cut_service_id bigint references cut_service (id),
    start_time     timestamp,
    end_time       timestamp,
    status         varchar(50)
);
create table time_slot
(
    id         bigserial primary key,
    barber_id  bigint references barber (id),
    start_time timestamp,
    end_time   timestamp,
    status     varchar(50)
);
