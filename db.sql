create table authors
(
    id        int generated always as identity primary key,
    full_name varchar(100),
    country   varchar(100)
);

create table books
(
    id               int generated always as identity primary key,
    title            varchar(100) unique,
    publication_year int,
    price            int,
    author_id        int references authors (id)
);

create table readers
(
    id        int generated always as identity primary key,
    full_name varchar(100)
);

create table loads
(
    id        int generated always as identity primary key,
    reader_id int references readers (id),
    book_id   int references books (id)
);

create
or replace function getDiscountOfId(
b_id int,
b_percent numeric
)
returns numeric
language plpgsql
as $$
declare
temp_price numeric;
begin
select price
into temp_price
from books
where id = b_id;
return round(temp_price * (1 - b_percent / 100), 2);
end;
$$;