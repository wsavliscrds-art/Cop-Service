-- Centraliza a atualização de chamados em uma função autorizada.
-- Aplicada em produção em 2026-08-29.

create or replace function public.update_ticket(
  p_ticket_id uuid,
  p_patch jsonb,
  p_history_text text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old public.tickets%rowtype;
  v_role text;
  v_is_admin boolean;
  v_is_handler boolean;
  v_can_manage boolean;
  v_keys text[];
  v_new_watchers uuid[];
  v_new_participants uuid[];
  v_history jsonb;
begin
  if auth.uid() is null then raise exception 'Sessão necessária'; end if;
  if p_patch is null or jsonb_typeof(p_patch) <> 'object' then
    raise exception 'Atualização inválida';
  end if;

  select * into v_old from public.tickets where id = p_ticket_id for update;
  if not found then raise exception 'Chamado não encontrado'; end if;

  select role into v_role from public.profiles where id = auth.uid() and active;
  v_is_admin := public.is_admin();
  v_is_handler := public.is_handler();
  v_can_manage := v_is_admin
    or v_old.assigned_to = auth.uid()
    or (v_old.assigned_to is null and v_old.assigned_role is not null and v_old.assigned_role = v_role)
    or (v_is_handler and v_old.status = 'Aguardando aprovação' and v_old.requester_id <> auth.uid());
  v_keys := array(select jsonb_object_keys(p_patch));

  if p_patch ? 'watchers' then
    select coalesce(array_agg(value::uuid), '{}') into v_new_watchers
    from jsonb_array_elements_text(p_patch->'watchers');
    if exists (select 1 from unnest(v_new_watchers) x where x <> auth.uid() and not x = any(coalesce(v_old.watchers, '{}')))
       or exists (select 1 from unnest(coalesce(v_old.watchers, '{}')) x where x <> auth.uid() and not x = any(v_new_watchers)) then
      raise exception 'Só é permitido alterar a própria observação';
    end if;
  end if;

  if p_patch ? 'participants' then
    select coalesce(array_agg(value::uuid), '{}') into v_new_participants
    from jsonb_array_elements_text(p_patch->'participants');
    if exists (select 1 from unnest(coalesce(v_old.participants, '{}')) x where not x = any(v_new_participants))
       or exists (select 1 from unnest(v_new_participants) x where x <> auth.uid() and not x = any(coalesce(v_old.participants, '{}'))) then
      raise exception 'Só é permitido incluir você como participante';
    end if;
  end if;

  if not v_can_manage then
    if v_keys <@ array['watchers'] then
      null;
    elsif v_keys <@ array['participants'] then
      null;
    elsif v_old.requester_id = auth.uid()
      and v_keys <@ array['status', 'participants']
      and p_patch ? 'status'
      and p_patch->>'status' in ('Cancelado', 'Aberto') then
      null;
    else
      raise exception 'Você não tem permissão para alterar este chamado';
    end if;
  end if;

  v_history := coalesce(v_old.history, '[]'::jsonb);
  if p_history_text is not null and length(trim(p_history_text)) > 0 then
    v_history := v_history || jsonb_build_array(jsonb_build_object('text', left(p_history_text, 2000), 'at', floor(extract(epoch from clock_timestamp()) * 1000)));
  end if;

  update public.tickets
  set status = coalesce(p_patch->>'status', v_old.status),
      assigned_role = case when p_patch ? 'assigned_role' then nullif(p_patch->>'assigned_role', '') else v_old.assigned_role end,
      assigned_to = case when p_patch ? 'assigned_to' then nullif(p_patch->>'assigned_to', '')::uuid else v_old.assigned_to end,
      watchers = case when p_patch ? 'watchers' then v_new_watchers else v_old.watchers end,
      participants = case when p_patch ? 'participants' then v_new_participants else v_old.participants end,
      history = v_history,
      updated_at = clock_timestamp()
  where id = p_ticket_id;
end;
$$;

revoke all on function public.update_ticket(uuid, jsonb, text) from public;
grant execute on function public.update_ticket(uuid, jsonb, text) to authenticated;

drop policy if exists tickets_update on public.tickets;
