// Issues the signed Bunny Stream URL of a lesson's video or a course's welcome
// video, valid for 2 hours. The access check is RLS: the queries run as the
// signed-in user, so a lesson they can't reach (no live membership, draft
// content) comes back empty and gets a 403.
//
// Secret BUNNY_TOKEN_KEYS: JSON of library id -> that library's Token
// Authentication key, e.g. {"123456":"key"}. Each library has its own key.
import { createClient } from 'npm:@supabase/supabase-js@2.45.0';
import { z } from 'npm:zod@3.23.8';

const LINK_LIFETIME_SECONDS = 2 * 60 * 60;

const ALLOWED_ORIGINS = ['https://andresgbe.github.io', 'http://localhost:5173'];

const Body = z.union([
  z.object({ lessonId: z.string().uuid() }).strict(),
  z.object({ courseId: z.string().uuid() }).strict(),
]);

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function readTokenKeys(): Record<string, string> {
  try {
    return JSON.parse(Deno.env.get('BUNNY_TOKEN_KEYS') ?? '{}');
  } catch {
    return {};
  }
}

Deno.serve(async (request) => {
  const headers = corsHeaders(request.headers.get('Origin'));
  const reply = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });

  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  if (request.method !== 'POST') return reply(405, { error: 'method_not_allowed' });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return reply(400, { error: 'invalid_body' });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: request.headers.get('Authorization') ?? '' } },
    auth: { persistSession: false },
  });

  let videoId: string | null = null;
  let libraryId: string | null = null;

  if ('lessonId' in parsed.data) {
    const { data, error } = await supabase
      .from('lessons')
      .select('bunny_video_id, bunny_library_id, modules!inner(courses!inner(bunny_library_id))')
      .eq('id', parsed.data.lessonId)
      .maybeSingle();
    if (error) return reply(500, { error: 'lookup_failed' });
    const lesson = data as unknown as { bunny_video_id: string | null; bunny_library_id: string | null; modules: { courses: { bunny_library_id: string | null } } } | null;
    videoId = lesson?.bunny_video_id ?? null;
    libraryId = lesson?.bunny_library_id ?? lesson?.modules.courses.bunny_library_id ?? null;
  } else {
    const { data, error } = await supabase
      .from('courses')
      .select('welcome_video_id, bunny_library_id')
      .eq('id', parsed.data.courseId)
      .maybeSingle();
    if (error) return reply(500, { error: 'lookup_failed' });
    videoId = data?.welcome_video_id ?? null;
    libraryId = data?.bunny_library_id ?? null;
  }

  if (!videoId || !libraryId) return reply(403, { error: 'no_access' });

  const tokenKey = readTokenKeys()[libraryId];
  if (!tokenKey) return reply(503, { error: 'library_not_configured' });

  const expires = Math.floor(Date.now() / 1000) + LINK_LIFETIME_SECONDS;
  const token = await sha256Hex(tokenKey + videoId + expires);
  const url = new URL(`https://player.mediadelivery.net/embed/${encodeURIComponent(libraryId)}/${encodeURIComponent(videoId)}`);
  url.search = new URLSearchParams({
    token,
    expires: String(expires),
    autoplay: 'false',
    preload: 'false',
    responsive: 'true',
  }).toString();

  return reply(200, { url: url.toString() });
});
