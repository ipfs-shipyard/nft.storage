-- Authenticator login
GRANT web_anon TO authenticator;
-- NFT.Storage user
GRANT nft_storage TO authenticator;
GRANT USAGE ON SCHEMA public TO nft_storage;
GRANT SELECT, UPDATE, DELETE ON public.aggregate, public.aggregate_entry, public.auth_key, public.content, public.deal, public.pin, public.upload, public.user TO nft_storage;
