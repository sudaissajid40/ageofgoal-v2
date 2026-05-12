-- ============================================================
-- Age of Goal v2 — Scheduling RPC
-- Manages bracket generation and round mapping for series
-- ============================================================

CREATE OR REPLACE FUNCTION public.replace_tournament_schedule(_tournament_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  participant_ids UUID[];
  match_count INT;
  round_label TEXT;
  i INT;
BEGIN
  -- 1. Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can manage schedules';
  END IF;

  -- 2. Clear existing matches
  DELETE FROM public.series_matches WHERE tournament_id = _tournament_id;

  -- 3. Get all approved registrations
  SELECT array_agg(team_id) INTO participant_ids
  FROM public.series_registrations
  WHERE tournament_id = _tournament_id AND payment_status = 'verified';

  IF participant_ids IS NULL OR array_length(participant_ids, 1) < 2 THEN
    RETURN;
  END IF;

  -- 4. Simple Bracket Generation (Round 1)
  -- This is a basic implementation that pairs teams 1-2, 3-4, etc.
  match_count := floor(array_length(participant_ids, 1) / 2);
  round_label := 'Round 1';

  FOR i IN 1..match_count LOOP
    INSERT INTO public.series_matches (
      tournament_id,
      round,
      match_order,
      team_a_id,
      team_b_id,
      status
    ) VALUES (
      _tournament_id,
      round_label,
      i,
      participant_ids[(i*2)-1],
      participant_ids[i*2],
      'scheduled'
    );
  END LOOP;

  -- Handle bye if odd number of teams
  IF array_length(participant_ids, 1) % 2 <> 0 THEN
    INSERT INTO public.series_matches (
      tournament_id,
      round,
      match_order,
      team_a_id,
      status
    ) VALUES (
      _tournament_id,
      round_label,
      match_count + 1,
      participant_ids[array_length(participant_ids, 1)],
      'bye'
    );
  END IF;

END;
$$;
