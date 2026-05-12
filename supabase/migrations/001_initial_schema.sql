-- ============================================================
-- Age of Goal v2 — Database Schema
-- Burdenless Architecture: No AOG points, No rankings, 
-- No realtime subscriptions, Simplified RLS
-- ============================================================

-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.tournament_status AS ENUM ('upcoming', 'live', 'completed');
CREATE TYPE public.royal_type AS ENUM ('solo', 'duo', 'squad');
CREATE TYPE public.registration_payment_status AS ENUM ('pending', 'verified', 'cancelled');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  level INT CHECK (level >= 1 AND level <= 100),
  city TEXT,
  age INT,
  gender TEXT,
  region TEXT,
  play_style TEXT,
  preferred_mode TEXT,
  verification_status public.verification_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  profile_completed BOOLEAN NOT NULL DEFAULT false,
  edit_count INT NOT NULL DEFAULT 0,
  last_edit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============ SECURITY DEFINER FUNCTIONS (avoids RLS recursion) ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_verified(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND verification_status = 'approved'
  )
$$;

-- ============ TEAMS ============
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_level INT NOT NULL DEFAULT 0,
  join_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- ============ TEAM MEMBERS ============
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX idx_team_members_unique_user ON public.team_members(user_id);

-- ============ SERIES TOURNAMENTS ============
CREATE TABLE public.series_tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT,
  match_team_size INT NOT NULL DEFAULT 4,
  min_team_members INT NOT NULL DEFAULT 4,
  max_team_members INT NOT NULL DEFAULT 6,
  bracket_size INT NOT NULL DEFAULT 4,
  max_participants INT,
  starts_at TIMESTAMPTZ NOT NULL,
  registration_ends_at TIMESTAMPTZ,
  status public.tournament_status NOT NULL DEFAULT 'upcoming',
  thumbnail_url TEXT,
  -- Sponsor
  sponsor_name TEXT,
  sponsor_hook TEXT,
  sponsor_cta_label TEXT,
  sponsor_cta_url TEXT,
  sponsor_banner_url TEXT,
  -- Entry fee
  entry_fee NUMERIC NOT NULL DEFAULT 0,
  payment_account_label TEXT,
  payment_account_number TEXT,
  payment_instructions TEXT,
  -- Prize pool
  prize_pool JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Meta
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.series_tournaments ENABLE ROW LEVEL SECURITY;

-- ============ SERIES REGISTRATIONS ============
CREATE TABLE public.series_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.series_tournaments(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  registered_by UUID NOT NULL REFERENCES auth.users(id),
  receipt_url TEXT,
  payment_status public.registration_payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, team_id)
);
ALTER TABLE public.series_registrations ENABLE ROW LEVEL SECURITY;

-- ============ SERIES MATCHES (bracket system) ============
CREATE TABLE public.series_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.series_tournaments(id) ON DELETE CASCADE,
  round TEXT NOT NULL DEFAULT '1',
  match_order INT NOT NULL DEFAULT 1,
  team_a_id UUID REFERENCES public.teams(id),
  team_b_id UUID REFERENCES public.teams(id),
  winner_id UUID REFERENCES public.teams(id),
  score_a INT,
  score_b INT,
  scheduled_at TIMESTAMPTZ,
  room_id TEXT,
  room_password TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.series_matches ENABLE ROW LEVEL SECURITY;

-- ============ ROYAL TOURNAMENTS ============
CREATE TABLE public.royal_tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT,
  type public.royal_type NOT NULL DEFAULT 'squad',
  max_participants INT,
  match_starts_at TIMESTAMPTZ NOT NULL,
  registration_ends_at TIMESTAMPTZ,
  status public.tournament_status NOT NULL DEFAULT 'upcoming',
  thumbnail_url TEXT,
  -- Sponsor
  sponsor_name TEXT,
  sponsor_hook TEXT,
  sponsor_cta_label TEXT,
  sponsor_cta_url TEXT,
  sponsor_banner_url TEXT,
  -- Entry fee
  entry_fee NUMERIC NOT NULL DEFAULT 0,
  payment_account_label TEXT,
  payment_account_number TEXT,
  payment_instructions TEXT,
  -- Prize pool
  prize_pool JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Meta
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.royal_tournaments ENABLE ROW LEVEL SECURITY;

-- ============ ROYAL REGISTRATIONS (anonymous) ============
CREATE TABLE public.royal_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.royal_tournaments(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  player_uids TEXT[] NOT NULL, -- Array of Free Fire UIDs
  receipt_url TEXT,
  payment_status public.registration_payment_status NOT NULL DEFAULT 'pending',
  elimination_order INT, -- NULL = still alive, lower number = eliminated earlier (last place)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.royal_registrations ENABLE ROW LEVEL SECURITY;

-- ============ BANNERS (admin announcements) ============
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  cta_label TEXT,
  cta_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- ============ PUSH SUBSCRIPTIONS (endpoint-based, supports anonymous) ============
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============ TRIGGERS ============

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profile updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Profile edit cooldown
CREATE OR REPLACE FUNCTION public.profiles_before_update_cooldown()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  cooldown_days INT;
BEGIN
  -- Skip cooldown check for admins updating other profiles
  IF OLD.id <> auth.uid() THEN RETURN NEW; END IF;
  
  -- Only enforce cooldown on user-initiated edits that change key fields
  IF NEW.username IS DISTINCT FROM OLD.username
     OR NEW.level IS DISTINCT FROM OLD.level
     OR NEW.city IS DISTINCT FROM OLD.city
     OR NEW.region IS DISTINCT FROM OLD.region THEN

    -- Calculate cooldown based on edit count
    IF OLD.edit_count = 0 THEN cooldown_days := 0;
    ELSIF OLD.edit_count = 1 THEN cooldown_days := 3;
    ELSIF OLD.edit_count = 2 THEN cooldown_days := 7;
    ELSE cooldown_days := 30;
    END IF;

    -- Check if cooldown has elapsed
    IF cooldown_days > 0 AND OLD.last_edit_at IS NOT NULL
       AND OLD.last_edit_at + (cooldown_days || ' days')::interval > now() THEN
      RAISE EXCEPTION 'Profile edit cooldown: wait % days', cooldown_days;
    END IF;

    -- Increment edit count and reset verification
    NEW.edit_count := OLD.edit_count + 1;
    NEW.last_edit_at := now();
    NEW.verification_status := 'pending';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_cooldown_check
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_before_update_cooldown();

-- Team level auto-recompute
CREATE OR REPLACE FUNCTION public.recompute_team_level(_team_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.teams
  SET team_level = COALESCE((
    SELECT SUM(p.level)
    FROM public.team_members tm
    JOIN public.profiles p ON p.id = tm.user_id
    WHERE tm.team_id = _team_id
  ), 0)
  WHERE id = _team_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.team_members_after_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recompute_team_level(OLD.team_id);
    RETURN OLD;
  ELSE
    PERFORM public.recompute_team_level(NEW.team_id);
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER team_members_change
  AFTER INSERT OR UPDATE OR DELETE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.team_members_after_change();

-- Auto-add owner as member when team created
CREATE OR REPLACE FUNCTION public.teams_after_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id) VALUES (NEW.id, NEW.owner_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER teams_add_owner
  AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.teams_after_insert();

-- Deactivate old banners when new one is created
CREATE OR REPLACE FUNCTION public.banners_before_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.banners SET is_active = false WHERE is_active = true;
  RETURN NEW;
END;
$$;

CREATE TRIGGER banners_deactivate_old
  BEFORE INSERT ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.banners_before_insert();

-- ============ RLS POLICIES ============

-- profiles: viewable by everyone, editable by self or admin
CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Admins update any profile" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- user_roles: users see own, NO recursive check
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- teams: viewable by everyone
CREATE POLICY "Teams viewable by all" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Verified users create teams" ON public.teams FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id AND public.is_verified(auth.uid()));
CREATE POLICY "Owner updates team" ON public.teams FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owner or admin deletes team" ON public.teams FOR DELETE TO authenticated
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

-- team_members: viewable by everyone
CREATE POLICY "Team members viewable by all" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Members join teams" ON public.team_members FOR INSERT TO authenticated
  WITH CHECK (public.is_verified(user_id) AND (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid())
  ));
CREATE POLICY "Members leave or owner removes" ON public.team_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid()));

-- series_tournaments: viewable by everyone, managed by admin
CREATE POLICY "Series tournaments viewable by all" ON public.series_tournaments FOR SELECT USING (true);
CREATE POLICY "Admins manage series" ON public.series_tournaments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- series_registrations: viewable by everyone
CREATE POLICY "Series registrations viewable by all" ON public.series_registrations FOR SELECT USING (true);
CREATE POLICY "Verified users register for series" ON public.series_registrations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = registered_by AND public.is_verified(auth.uid()));
CREATE POLICY "Admins manage series registrations" ON public.series_registrations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- series_matches: viewable by everyone, managed by admin
CREATE POLICY "Series matches viewable by all" ON public.series_matches FOR SELECT USING (true);
CREATE POLICY "Admins manage series matches" ON public.series_matches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- royal_tournaments: viewable by everyone, managed by admin
CREATE POLICY "Royal tournaments viewable by all" ON public.royal_tournaments FOR SELECT USING (true);
CREATE POLICY "Admins manage royal" ON public.royal_tournaments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- royal_registrations: viewable by everyone, insertable by ANYONE (anonymous)
CREATE POLICY "Royal registrations viewable by all" ON public.royal_registrations FOR SELECT USING (true);
CREATE POLICY "Anyone can register for royal" ON public.royal_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage royal registrations" ON public.royal_registrations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- banners: viewable by everyone, managed by admin
CREATE POLICY "Banners viewable by all" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Admins manage banners" ON public.banners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- push_subscriptions: insertable by anyone (anonymous support)
CREATE POLICY "Anyone can subscribe to push" ON public.push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own sub" ON public.push_subscriptions FOR UPDATE USING (true);
CREATE POLICY "Admins read subscriptions" ON public.push_subscriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
