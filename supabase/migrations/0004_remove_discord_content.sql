-- Discord is gone from the product. The stored site_content still carried the
-- old channel list (community.channels, read by nothing since CommunitySection
-- was removed) and a FAQ answer pointing to a "canal de repeticiones".
-- Stored values win over the widget defaults, so they must be fixed here.
update public.site_content
set value = value - 'community.channels'
where id = 'site';

-- Only touch faq.items if it was saved; writing an empty array would hide the defaults.
update public.site_content
set value = jsonb_set(
  value,
  '{faq.items}',
  (
    select jsonb_agg(
      case
        when item ->> 'answer' like '%se publican en el canal de repeticiones%'
          then jsonb_set(
            item,
            '{answer}',
            to_jsonb(replace(item ->> 'answer', 'se publican en el canal de repeticiones', 'se suben a la plataforma'))
          )
        else item
      end
      order by ord
    )
    from jsonb_array_elements(value -> 'faq.items') with ordinality as t (item, ord)
  )
)
where id = 'site'
  and case when jsonb_typeof(value -> 'faq.items') = 'array'
        then jsonb_array_length(value -> 'faq.items') > 0
        else false
      end;
