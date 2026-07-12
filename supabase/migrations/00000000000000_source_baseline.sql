


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."cast_vote_with_limits"("p_poll_id" "uuid", "p_option_id" "uuid", "p_user_id" "uuid", "p_ip_address" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_poll record;
  v_ip_count integer;
BEGIN
  SELECT id, is_active, ends_at, max_votes_per_ip
    INTO v_poll
    FROM public.polls
   WHERE id = p_poll_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'poll_not_found';
  END IF;

  IF NOT v_poll.is_active THEN
    RAISE EXCEPTION 'poll_closed';
  END IF;

  IF v_poll.ends_at IS NOT NULL AND v_poll.ends_at <= NOW() THEN
    RAISE EXCEPTION 'poll_expired';
  END IF;

  IF v_poll.max_votes_per_ip IS NOT NULL THEN
    SELECT COUNT(*)
      INTO v_ip_count
      FROM public.votes v
     WHERE v.poll_id = p_poll_id
       AND v.ip_address = p_ip_address
       AND v.is_simulated = FALSE;

    IF v_ip_count >= v_poll.max_votes_per_ip THEN
      RAISE EXCEPTION 'vote_limit_reached';
    END IF;
  END IF;

  -- Ensure option belongs to poll
  IF NOT EXISTS (
    SELECT 1 FROM public.poll_options WHERE id = p_option_id AND poll_id = p_poll_id
  ) THEN
    RAISE EXCEPTION 'option_not_in_poll';
  END IF;

  -- Insert vote; on_vote_created trigger increments poll_options.vote_count
  INSERT INTO public.votes (poll_id, option_id, user_id, ip_address, is_simulated)
  VALUES (p_poll_id, p_option_id, p_user_id, p_ip_address, FALSE);
END;
$$;


ALTER FUNCTION "public"."cast_vote_with_limits"("p_poll_id" "uuid", "p_option_id" "uuid", "p_user_id" "uuid", "p_ip_address" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_poll_total_votes"("poll_uuid" "uuid") RETURNS bigint
    LANGUAGE "sql" STABLE
    AS $$
  SELECT COALESCE(SUM(vote_count), 0)::bigint
  FROM poll_options
  WHERE poll_id = poll_uuid;
$$;


ALTER FUNCTION "public"."get_poll_total_votes"("poll_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_vote_counts_by_date"("p_poll_ids" "uuid"[], "p_start_date" timestamp with time zone) RETURNS TABLE("vote_date" "date", "vote_count" bigint)
    LANGUAGE "sql" STABLE
    AS $$
    SELECT
      DATE(created_at) as vote_date,
      COUNT(*) as vote_count
    FROM votes
    WHERE poll_id = ANY(p_poll_ids)
      AND created_at >= p_start_date
    GROUP BY DATE(created_at)
    ORDER BY vote_date ASC;
  $$;


ALTER FUNCTION "public"."get_vote_counts_by_date"("p_poll_ids" "uuid"[], "p_start_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_votes_over_time"("p_poll_ids" "uuid"[], "p_start_date" timestamp with time zone, "p_group_by_hour" boolean DEFAULT false, "p_tz_offset_minutes" integer DEFAULT 0) RETURNS TABLE("poll_id" "uuid", "time_bucket" "text", "vote_count" bigint)
    LANGUAGE "sql" STABLE
    AS $$
    SELECT
      v.poll_id,
      CASE
        WHEN p_group_by_hour THEN TO_CHAR(v.created_at + (p_tz_offset_minutes || ' minutes')::INTERVAL, 'YYYY-MM-DD-HH24')
        ELSE TO_CHAR(v.created_at + (p_tz_offset_minutes || ' minutes')::INTERVAL, 'YYYY-MM-DD')
      END as time_bucket,
      COUNT(*) as vote_count
    FROM votes v
    WHERE v.poll_id = ANY(p_poll_ids)
      AND v.created_at >= p_start_date
    GROUP BY v.poll_id, time_bucket
    ORDER BY time_bucket ASC;
  $$;


ALTER FUNCTION "public"."get_votes_over_time"("p_poll_ids" "uuid"[], "p_start_date" timestamp with time zone, "p_group_by_hour" boolean, "p_tz_offset_minutes" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "poll_id" "uuid" NOT NULL,
    "total_votes" integer DEFAULT 0 NOT NULL,
    "last_vote_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."user_sessions" REPLICA IDENTITY FULL;


ALTER TABLE "public"."user_sessions" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_user_session_votes"("p_user_id" "text", "p_poll_id" "uuid") RETURNS "public"."user_sessions"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  session_row user_sessions;
BEGIN
  INSERT INTO user_sessions (user_id, poll_id, total_votes, last_vote_at)
  VALUES (p_user_id, p_poll_id, 1, now())
  ON CONFLICT (user_id, poll_id) DO UPDATE
    SET total_votes = user_sessions.total_votes + 1,
        last_vote_at = now()
  RETURNING * INTO session_row;

  RETURN session_row;
END;
$$;


ALTER FUNCTION "public"."increment_user_session_votes"("p_user_id" "text", "p_poll_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_vote_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE poll_options
  SET vote_count = vote_count + 1
  WHERE id = NEW.option_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."increment_vote_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."perform_auto_votes"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  r record;
  remaining integer;
  delta integer;
  now_epoch_seconds integer := floor(extract(epoch from now()));
  interval_ms integer;
  interval_seconds integer;
begin
  for r in
    select po.id as option_id,
           po.poll_id,
           coalesce(po.simulated_target_votes, 0) as target,
           coalesce(po.simulated_votes_added, 0) as added,
           p.auto_vote_interval_seconds
    from public.poll_options po
    join public.polls p on p.id = po.poll_id
    where po.simulated_enabled = true
      and coalesce(po.simulated_target_votes, 0) > coalesce(po.simulated_votes_added, 0)
      and p.is_active = true
      and (p.ends_at is null or p.ends_at > now())
  loop
    -- Normalize stored interval to milliseconds (legacy values below 200 are treated as seconds)
    interval_ms := case
      when r.auto_vote_interval_seconds is null then 30000
      when r.auto_vote_interval_seconds < 200 then r.auto_vote_interval_seconds * 1000
      else r.auto_vote_interval_seconds
    end;

    -- Convert to seconds for the cron cadence (minimum 1 second since the job runs minutely)
    interval_seconds := greatest(1, ceil(interval_ms::numeric / 1000)::integer);

    -- Throttle based on desired interval (minimum cadence is one minute via cron)
    if interval_seconds > 60 then
      if mod(now_epoch_seconds, interval_seconds) <> 0 then
        continue;
      end if;
    end if;

    remaining := r.target - r.added;
    if remaining <= 0 then
      continue;
    end if;

    -- Random bump between 1 and 3 votes per run, capped by remaining
    delta := floor(random() * 3) + 1;
    delta := least(delta, remaining);

    if delta > 0 then
      insert into public.votes (poll_id, option_id, user_id, ip_address, is_simulated)
      select r.poll_id, r.option_id, null, 'auto_simulator', true
      from generate_series(1, delta);

      update public.poll_options
        set vote_count = vote_count + delta,
            simulated_votes_added = simulated_votes_added + delta
      where id = r.option_id;
    end if;
  end loop;
end;
$$;


ALTER FUNCTION "public"."perform_auto_votes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_poll_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE polls
  SET updated_at = now()
  WHERE id = NEW.poll_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_poll_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_profiles_updated_at"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."poll_options" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "poll_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "image_url" "text",
    "vote_count" bigint DEFAULT 0 NOT NULL,
    "position" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "simulated_enabled" boolean DEFAULT false NOT NULL,
    "simulated_target_votes" integer,
    "simulated_votes_added" integer DEFAULT 0 NOT NULL
);

ALTER TABLE ONLY "public"."poll_options" REPLICA IDENTITY FULL;


ALTER TABLE "public"."poll_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."polls" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "creator_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_public" boolean DEFAULT true NOT NULL,
    "access_key" "text",
    "ends_at" timestamp with time zone,
    "max_votes_per_ip" integer,
    "auto_vote_interval_seconds" integer DEFAULT 30 NOT NULL,
    "slug" "text" NOT NULL
);

ALTER TABLE ONLY "public"."polls" REPLICA IDENTITY FULL;


ALTER TABLE "public"."polls" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."public_poll_leaderboard" AS
 SELECT "p"."id",
    "p"."slug",
    "p"."title",
    "p"."creator_id",
    "p"."is_active",
    "p"."is_public",
    "p"."access_key",
    "p"."created_at",
    "p"."updated_at",
    (COALESCE("sum"("po"."vote_count"), (0)::numeric))::bigint AS "total_votes",
    COALESCE("json_agg"("json_build_object"('id', "po"."id", 'title', "po"."title", 'vote_count', "po"."vote_count", 'position', "po"."position") ORDER BY "po"."position") FILTER (WHERE ("po"."id" IS NOT NULL)), '[]'::json) AS "options"
   FROM ("public"."polls" "p"
     LEFT JOIN "public"."poll_options" "po" ON (("po"."poll_id" = "p"."id")))
  WHERE (("p"."is_public" = true) AND ("p"."is_active" = true))
  GROUP BY "p"."id", "p"."slug", "p"."title", "p"."creator_id", "p"."is_active", "p"."is_public", "p"."access_key", "p"."created_at", "p"."updated_at"
  ORDER BY ((COALESCE("sum"("po"."vote_count"), (0)::numeric))::bigint) DESC;


ALTER VIEW "public"."public_poll_leaderboard" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "user_id" "uuid" NOT NULL,
    "email" "text",
    "plan" "text" DEFAULT 'free'::"text" NOT NULL,
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "valid_plan" CHECK (("plan" = ANY (ARRAY['free'::"text", 'pro'::"text"]))),
    CONSTRAINT "valid_role" CHECK (("role" = ANY (ARRAY['user'::"text", 'superadmin'::"text"])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "poll_id" "uuid" NOT NULL,
    "option_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ip_address" "text",
    "is_simulated" boolean DEFAULT false NOT NULL
);

ALTER TABLE ONLY "public"."votes" REPLICA IDENTITY FULL;


ALTER TABLE "public"."votes" OWNER TO "postgres";


ALTER TABLE ONLY "public"."poll_options"
    ADD CONSTRAINT "poll_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."polls"
    ADD CONSTRAINT "polls_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_user_id_poll_id_key" UNIQUE ("user_id", "poll_id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_poll_options_poll" ON "public"."poll_options" USING "btree" ("poll_id");



CREATE INDEX "idx_polls_active" ON "public"."polls" USING "btree" ("is_active");



CREATE INDEX "idx_polls_creator" ON "public"."polls" USING "btree" ("creator_id");



CREATE INDEX "idx_polls_public" ON "public"."polls" USING "btree" ("is_public") WHERE ("is_public" = true);



CREATE INDEX "idx_user_sessions_poll" ON "public"."user_sessions" USING "btree" ("poll_id");



CREATE INDEX "idx_votes_created" ON "public"."votes" USING "btree" ("poll_id", "created_at");



CREATE INDEX "idx_votes_option" ON "public"."votes" USING "btree" ("option_id");



CREATE INDEX "idx_votes_poll" ON "public"."votes" USING "btree" ("poll_id");



CREATE UNIQUE INDEX "polls_slug_unique" ON "public"."polls" USING "btree" ("slug");



CREATE INDEX "user_profiles_email_idx" ON "public"."user_profiles" USING "btree" ("email");



CREATE OR REPLACE TRIGGER "on_vote_created" AFTER INSERT ON "public"."votes" FOR EACH ROW EXECUTE FUNCTION "public"."increment_vote_count"();



CREATE OR REPLACE TRIGGER "on_vote_update_poll" AFTER INSERT ON "public"."votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_poll_timestamp"();



CREATE OR REPLACE TRIGGER "set_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_profiles_updated_at"();



ALTER TABLE ONLY "public"."poll_options"
    ADD CONSTRAINT "poll_options_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."polls"
    ADD CONSTRAINT "polls_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."poll_options"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Anyone can insert user sessions" ON "public"."user_sessions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can insert votes" ON "public"."votes" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can update user sessions" ON "public"."user_sessions" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Anyone can view poll options" ON "public"."poll_options" FOR SELECT USING (true);



CREATE POLICY "Anyone can view polls" ON "public"."polls" FOR SELECT USING (true);



CREATE POLICY "Anyone can view user sessions" ON "public"."user_sessions" FOR SELECT USING (true);



CREATE POLICY "Anyone can view votes" ON "public"."votes" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create polls" ON "public"."polls" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "creator_id"));



CREATE POLICY "Poll creators can delete options" ON "public"."poll_options" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."polls"
  WHERE (("polls"."id" = "poll_options"."poll_id") AND ("polls"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Poll creators can insert options" ON "public"."poll_options" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."polls"
  WHERE (("polls"."id" = "poll_options"."poll_id") AND ("polls"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Poll creators can update options" ON "public"."poll_options" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."polls"
  WHERE (("polls"."id" = "poll_options"."poll_id") AND ("polls"."creator_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."polls"
  WHERE (("polls"."id" = "poll_options"."poll_id") AND ("polls"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete own polls" ON "public"."polls" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "Users can update own polls" ON "public"."polls" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "creator_id")) WITH CHECK (("auth"."uid"() = "creator_id"));



ALTER TABLE "public"."poll_options" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."polls" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."cast_vote_with_limits"("p_poll_id" "uuid", "p_option_id" "uuid", "p_user_id" "uuid", "p_ip_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cast_vote_with_limits"("p_poll_id" "uuid", "p_option_id" "uuid", "p_user_id" "uuid", "p_ip_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cast_vote_with_limits"("p_poll_id" "uuid", "p_option_id" "uuid", "p_user_id" "uuid", "p_ip_address" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_poll_total_votes"("poll_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_poll_total_votes"("poll_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_poll_total_votes"("poll_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_vote_counts_by_date"("p_poll_ids" "uuid"[], "p_start_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_vote_counts_by_date"("p_poll_ids" "uuid"[], "p_start_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_vote_counts_by_date"("p_poll_ids" "uuid"[], "p_start_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_votes_over_time"("p_poll_ids" "uuid"[], "p_start_date" timestamp with time zone, "p_group_by_hour" boolean, "p_tz_offset_minutes" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_votes_over_time"("p_poll_ids" "uuid"[], "p_start_date" timestamp with time zone, "p_group_by_hour" boolean, "p_tz_offset_minutes" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_votes_over_time"("p_poll_ids" "uuid"[], "p_start_date" timestamp with time zone, "p_group_by_hour" boolean, "p_tz_offset_minutes" integer) TO "service_role";



GRANT ALL ON TABLE "public"."user_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sessions" TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_user_session_votes"("p_user_id" "text", "p_poll_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_user_session_votes"("p_user_id" "text", "p_poll_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_user_session_votes"("p_user_id" "text", "p_poll_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_vote_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_vote_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_vote_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."perform_auto_votes"() TO "anon";
GRANT ALL ON FUNCTION "public"."perform_auto_votes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."perform_auto_votes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_poll_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_poll_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_poll_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_profiles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_profiles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_profiles_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."poll_options" TO "anon";
GRANT ALL ON TABLE "public"."poll_options" TO "authenticated";
GRANT ALL ON TABLE "public"."poll_options" TO "service_role";



GRANT ALL ON TABLE "public"."polls" TO "anon";
GRANT ALL ON TABLE "public"."polls" TO "authenticated";
GRANT ALL ON TABLE "public"."polls" TO "service_role";



GRANT ALL ON TABLE "public"."public_poll_leaderboard" TO "anon";
GRANT ALL ON TABLE "public"."public_poll_leaderboard" TO "authenticated";
GRANT ALL ON TABLE "public"."public_poll_leaderboard" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
