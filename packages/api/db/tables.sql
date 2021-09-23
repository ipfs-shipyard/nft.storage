-- Pin status Type
CREATE TYPE pin_status_type AS ENUM (
    'PinError',
    'PinQueued',
    'Pinned',
    'Pinning'
    );

-- Pin Services Type
CREATE TYPE service_type AS ENUM ('Pinata', 'IpfsCluster');

-- Upload Type
CREATE TYPE upload_type AS ENUM (
    'Car',
    'Blob',
    'Multipart',
    'Remote',
    'Nft'
    );

-- Create upload table
CREATE TABLE IF NOT EXISTS account
(
    id             BIGSERIAL PRIMARY KEY,
    magic_link_id  TEXT                                                          NOT NULL UNIQUE,
    github_id      TEXT                                                          NOT NULL UNIQUE,
    name           TEXT                                                          NOT NULL,
    picture        TEXT,
    email          TEXT                                                          NOT NULL,
    public_address TEXT                                                          NOT NULL UNIQUE,
    github         jsonb,
    inserted_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_key
(
    id          BIGSERIAL PRIMARY KEY,
    name        TEXT                                                          NOT NULL,
    secret      TEXT                                                          NOT NULL,
    account_id  BIGINT                                                        NOT NULL REFERENCES account (id),
    inserted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS content
(
    -- normalized base32 v1
    cid         TEXT PRIMARY KEY,
    dag_size    BIGINT,
    inserted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS pin
(
    id          BIGSERIAL PRIMARY KEY,
    status      pin_status_type                                               NOT NULL,
    content_cid text                                                          NOT NULL REFERENCES content (cid),
    service     service_type                                                  NOT NULL,
    inserted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (content_cid, service)
);

-- Pin view with api response status
CREATE OR REPLACE VIEW pin_view
AS
SELECT id,
       CASE
           WHEN status = 'PinQueued'
               THEN 'queued'
           WHEN status = 'Pinned'
               THEN 'pinned'
           WHEN status = 'Pinning'
               THEN 'pinning'
           WHEN status = 'PinError'
               THEN 'failed'
           END status,
       content_cid,
       service,
       inserted_at,
       updated_at
FROM pin;


-- removed_at and add the on conflict logic to the function, null or date depending on the situation
-- check cid v1 or v0 logic 
CREATE TABLE IF NOT EXISTS upload
(
    id          BIGSERIAL PRIMARY KEY,
    account_id  BIGINT                                                        NOT NULL REFERENCES account (id),
    key_id      BIGINT REFERENCES auth_key (id),
    content_cid TEXT                                                          NOT NULL REFERENCES content (cid),
    source_cid  TEXT                                                          NOT NULL,
    -- MIME type of the upload data as sent in the request.
    mime_type   TEXT,
    type        upload_type                                                   NOT NULL,
    name        TEXT,
    files       jsonb,
    origins     jsonb,
    meta        jsonb,
    inserted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    --deleted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    UNIQUE (account_id, content_cid)
);