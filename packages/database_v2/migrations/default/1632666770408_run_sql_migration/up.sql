-- Add token_uri_hash field
ALTER TABLE nft
    ADD COLUMN token_uri_hash bytea;

-- Populate column with hashes
UPDATE nft
    SET token_uri_hash = sha256(token_uri::bytea);

-- Make token_uri_hash non-nullable.
ALTER TABLE nft
    ALTER COLUMN token_uri_hash SET NOT NULL;

-- Remove source column
ALTER TABLE nft
    DROP COLUMN token_uri;
