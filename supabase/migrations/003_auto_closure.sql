-- ==========================================
-- Auto-Closure Trigger
-- Automatically closes registrations when capacity is reached.
-- ==========================================

CREATE OR REPLACE FUNCTION public.check_tournament_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
  max_cap INT;
BEGIN
  -- 1. Determine which tournament we are checking
  IF TG_TABLE_NAME = 'series_registrations' THEN
    SELECT count(*), (SELECT max_participants FROM public.series_tournaments WHERE id = NEW.tournament_id)
    INTO current_count, max_cap
    FROM public.series_registrations
    WHERE tournament_id = NEW.tournament_id AND payment_status = 'verified';

    -- 2. If full, update status
    IF current_count >= max_cap THEN
      UPDATE public.series_tournaments 
      SET status = 'completed' -- In v2, we use 'completed' to hide from active list
      WHERE id = NEW.tournament_id;
    END IF;

  ELSIF TG_TABLE_NAME = 'royal_registrations' THEN
    SELECT count(*), (SELECT max_participants FROM public.royal_tournaments WHERE id = NEW.tournament_id)
    INTO current_count, max_cap
    FROM public.royal_registrations
    WHERE tournament_id = NEW.tournament_id AND payment_status = 'verified';

    -- 2. If full, update status
    IF current_count >= max_cap THEN
      UPDATE public.royal_tournaments 
      SET status = 'completed'
      WHERE id = NEW.tournament_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to Series
DROP TRIGGER IF EXISTS tr_check_series_capacity ON public.series_registrations;
CREATE TRIGGER tr_check_series_capacity
AFTER UPDATE OF payment_status ON public.series_registrations
FOR EACH ROW
WHEN (NEW.payment_status = 'verified')
EXECUTE FUNCTION public.check_tournament_capacity();

-- Apply to Royal
DROP TRIGGER IF EXISTS tr_check_royal_capacity ON public.royal_registrations;
CREATE TRIGGER tr_check_royal_capacity
AFTER UPDATE OF payment_status ON public.royal_registrations
FOR EACH ROW
WHEN (NEW.payment_status = 'verified')
EXECUTE FUNCTION public.check_tournament_capacity();
