-- Every course can open with a welcome video, shown to the student at the top
-- of the course page. Same rule as lessons: it stores the Bunny Stream video id
-- and playback goes through a signed URL issued by the server after checking
-- access, so the id alone does not play. Null = the course has no welcome video.
alter table public.courses add column if not exists welcome_video_id text;
