DROP FUNCTION IF EXISTS upload_fn;
DROP FUNCTION IF EXISTS deals_fn;

DROP TYPE IF EXISTS upload_pin_type;

CREATE TYPE upload_pin_type AS
(
    status  pin_status_type,
    service service_type
);

CREATE OR REPLACE FUNCTION upload_fn(data json) RETURNS setof upload
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
BEGIN

    insert into content (cid, dag_size)
    values (data ->> 'content_cid',
            (data ->> 'dag_size')::BIGINT)
    ON CONFLICT ( cid ) DO NOTHING;

    insert into pin (content_cid, status, service)
    select data ->> 'content_cid', status, service
    from json_populate_recordset(null::upload_pin_type, (data ->> 'pins')::json)
    on conflict (content_cid, service) do nothing;

    insert into upload (account_id,
                        key_id,
                        content_cid,
                        source_cid,
                        mime_type,
                        type,
                        name,
                        files,
                        origins,
                        meta)
    values ((data ->> 'account_id')::BIGINT,
            (data ->> 'key_id')::BIGINT,
            data ->> 'content_cid',
            data ->> 'source_cid',
            data ->> 'mime_type',
            (data ->> 'type')::upload_type,
            data ->> 'name',
            (data ->> 'files')::jsonb,
            (data ->> 'origins')::jsonb,
            (data ->> 'meta')::jsonb)
    ON CONFLICT ( account_id, content_cid ) DO NOTHING;


    return query select *
                 from upload u
                 where u.account_id = (data ->> 'account_id')::BIGINT
                   AND u.content_cid = data ->> 'content_cid';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No upload found %', data ->> 'content_cid';
    END IF;

    RETURN;

END
$$;

CREATE OR REPLACE FUNCTION deals_fn(cids text[])
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
WHERE ae.cid_v1 = ANY(cids)
ORDER BY de.entry_last_updated
$$;
