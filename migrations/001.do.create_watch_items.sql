CREATE TABLE watch_items (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title TEXT NOT NULL,
    strmservice TEXT NOT NULL, 
    date TIMESTAMP DEFAULT now() NOT NULL,
    watched NUMERIC DEFAULT 0
);
