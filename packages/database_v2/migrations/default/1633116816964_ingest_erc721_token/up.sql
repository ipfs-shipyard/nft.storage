CREATE FUNCTION ingest_erc721_token (
-- Unique token identifier
id nft.id % TYPE,
-- ERC721 tokenID (unique within a contract space)
token_id nft.token_id % TYPE,
-- ERC721 tokenURI
token_uri nft_asset.token_uri % TYPE,
-- ERC721 mintTime
mint_time nft.mint_time % TYPE,
-- NFT Contract
contract_id nft.contract_id % TYPE, contract_name blockchain_contract.name % TYPE, contract_symbol blockchain_contract.symbol % TYPE, contract_supports_eip721_metadata blockchain_contract.supports_eip721_metadata % TYPE,
-- Block
block_hash blockchain_block.hash % TYPE, block_number blockchain_block.number % TYPE,
-- Owner
owner_id nft_ownership.owner_id % TYPE,
-- Timestamps
updated_at nft.updated_at % TYPE DEFAULT timezone('utc'::text, now()), inserted_at nft.inserted_at % TYPE DEFAULT timezone('utc'::text, now()))
  RETURNS SETOF nft
  LANGUAGE plpgsql
  AS $$
DECLARE
  token_uri_hash nft.token_uri_hash % TYPE;
  nft_id nft.id % TYPE;
BEGIN
  nft_id := id;
  -- Create a corresponding token_asset record. If one already
  -- exists just update it's `update_at` timestamp.
  INSERT INTO nft_asset (token_uri, ipfs_url, content_cid, status, status_text)
    VALUES (token_uri, NULL, NULL, 'Queued', '')
  ON CONFLICT ON CONSTRAINT nft_asset_pkey
    DO UPDATE SET
      updated_at = EXCLUDED.updated_at
    RETURNING
      nft_asset.token_uri_hash INTO token_uri_hash;
  -- Record the block information if already exists just update the timestamp.
  INSERT INTO blockchain_block (hash, number)
    VALUES (block_hash, block_number)
  ON CONFLICT ON CONSTRAINT blockchain_block_pkey
    DO UPDATE SET
      updated_at = EXCLUDED.updated_at;
  -- Record contract information if already exists just update
  -- the date.
  INSERT INTO blockchain_contract (id, name, symbol, supports_eip721_metadata)
    VALUES (contract_id, contract_name, contract_symbol, contract_supports_eip721_metadata)
  ON CONFLICT ON CONSTRAINT blockchain_contract_pkey
    DO UPDATE SET
      updated_at = EXCLUDED.updated_at;
  -- Record owner information
  INSERT INTO nft_ownership (nft_id, owner_id, block_number)
    VALUES (nft_id, owner_id, block_number)
  ON CONFLICT ON CONSTRAINT nft_ownership_pkey
    DO UPDATE SET
      updated_at = EXCLUDED.updated_at;
  -- Record nft
  INSERT INTO nft (id, token_id, token_uri_hash, mint_time, contract_id, nft_owner_id)
    VALUES (nft_id, token_id, token_uri_hash, mint_time, contract_id, owner_id)
  ON CONFLICT ON CONSTRAINT nft_pkey
    DO UPDATE SET
      updated_at = EXCLUDED.updated_at, nft_owner_id = EXCLUDED.nft_owner_id;
  -- Record nft to block association
  INSERT INTO nfts_by_blockchain_blocks (blockchain_block_hash, nft_id)
    VALUES (block_hash, nft_id)
  ON CONFLICT ON CONSTRAINT nfts_by_blockchain_blocks_pkey
    DO UPDATE SET
      updated_at = EXCLUDED.updated_at;
  RETURN QUERY
  SELECT
    *
  FROM
    nft
  WHERE
    nft.id = nft_id;
END;
$$;
