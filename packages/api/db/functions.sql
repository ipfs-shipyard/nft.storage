DROP FUNCTION IF EXISTS create_upload;
DROP FUNCTION IF EXISTS find_deals_by_content_cids;

DROP TYPE IF EXISTS upload_pin_type;

CREATE TYPE upload_pin_type AS
(
    status  pin_status_type,
    service service_type
);

CREATE OR REPLACE FUNCTION create_upload(data json) RETURNS setof upload
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
BEGIN

    insert into content (cid, dag_size, updated_at, inserted_at)
    values (data ->> 'content_cid',
            (data ->> 'dag_size')::BIGINT,
            (data ->> 'updated_at')::timestamptz,
            (data ->> 'inserted_at')::timestamptz)
    ON CONFLICT ( cid ) DO NOTHING;

    insert into pin (content_cid, status, service, updated_at, inserted_at)
    select data ->> 'content_cid',
           status,
           service,
           (data ->> 'updated_at')::timestamptz,
           (data ->> 'inserted_at')::timestamptz
    from json_populate_recordset(null::upload_pin_type, (data ->> 'pins')::json)
    on conflict (content_cid, service) do nothing;

    insert into upload (user_id,
                        key_id,
                        content_cid,
                        source_cid,
                        mime_type,
                        type,
                        name,
                        files,
                        origins,
                        meta, inserted_at, updated_at)
    values ((data ->> 'user_id')::BIGINT,
            (data ->> 'key_id')::BIGINT,
            data ->> 'content_cid',
            data ->> 'source_cid',
            data ->> 'mime_type',
            (data ->> 'type')::upload_type,
            data ->> 'name',
            (data ->> 'files')::jsonb,
            (data ->> 'origins')::jsonb,
            (data ->> 'meta')::jsonb,
            (data ->> 'updated_at')::timestamptz,
            (data ->> 'inserted_at')::timestamptz)
    ON CONFLICT ( user_id, source_cid )
        DO UPDATE SET deleted_at = null,
                      updated_at = (data ->> 'inserted_at')::timestamptz,
                      name       = data ->> 'name',
                      meta       = (data ->> 'meta')::jsonb,
                      origins    = (data ->> 'origins')::jsonb,
                      mime_type  = data ->> 'mime_type',
                      type       = (data ->> 'type')::upload_type;


    return query select *
                 from upload u
                 where u.user_id = (data ->> 'user_id')::BIGINT
                   AND u.content_cid = data ->> 'content_cid';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No upload found %', data ->> 'content_cid';
    END IF;

    RETURN;

END
$$;

CREATE OR REPLACE FUNCTION find_deals_by_content_cids(cids text[])
    RETURNS TABLE
            (
                status              text,
                "lastChanged"       timestamptz,
                "chainDealID"       bigint,
                "datamodelSelector" text,
                "statusText"        text,
                "dealActivation"    timestamptz,
                "dealExpiration"    timestamptz,
                miner               text,
                "pieceCid"          text,
                "batchRootCid"      text,
                "contentCid"        text
            )
    LANGUAGE sql
    STABLE
    PARALLEL SAFE
AS
$$
SELECT COALESCE(de.status, 'queued') as status,
       de.entry_last_updated         as lastChanged,
       de.deal_id                    as chainDealID,
       ae.datamodel_selector         as datamodelSelector,
       de.status_meta                as statusText,
       de.start_time                 as dealActivation,
       de.end_time                   as dealExpiration,
       de.provider                   as miner,
       a.piece_cid                   as pieceCid,
       ae.aggregate_cid              as batchRootCid,
       ae.cid_v1                     as contentCid
FROM public.aggregate_entry ae
         join public.aggregate a using (aggregate_cid)
         LEFT JOIN public.deal de USING (aggregate_cid)
WHERE ae.cid_v1 = ANY (cids)
ORDER BY de.entry_last_updated
$$;
