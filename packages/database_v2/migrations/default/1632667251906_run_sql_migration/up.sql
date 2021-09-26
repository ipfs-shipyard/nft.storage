-- Create a derived column
ALTER TABLE resource
    ADD COLUMN uri_hash bytea
    GENERATED ALWAYS AS (sha256(uri::bytea))
    STORED;

-- Remove primary key constraint
ALTER TABLE resource
    DROP CONSTRAINT resource_pkey;

-- Add primary key constraint to new column
ALTER TABLE resource
    ADD CONSTRAINT resource_pkey PRIMARY KEY (uri_hash);
