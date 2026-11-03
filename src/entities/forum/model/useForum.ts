import { useCallback, useEffect, useState } from 'react';
import { fetchThread, fetchThreads } from '../api/forumApi';
import type { ForumPost, ForumThread } from './types';

interface Loaded<T> {
  key: string;
  data: T | null;
  failed: boolean;
}

function useLoader<T>(key: string | undefined, load: (key: string) => Promise<T | null>) {
  const [loaded, setLoaded] = useState<Loaded<T> | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!key) return;
    let isCurrent = true;
    load(key)
      .then((data) => {
        if (isCurrent) setLoaded({ key, data, failed: false });
      })
      .catch(() => {
        if (isCurrent) setLoaded({ key, data: null, failed: true });
      });
    return () => {
      isCurrent = false;
    };
  }, [key, load, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  const current = key && loaded?.key === key ? loaded : null;
  return { data: current?.data ?? null, failed: current?.failed ?? false, isLoading: Boolean(key) && current === null, reload };
}

export function useForumThreads(courseId: string | undefined) {
  const { data, failed, isLoading, reload } = useLoader<ForumThread[]>(courseId, fetchThreads);
  return { threads: data ?? [], failed, isLoading, reload };
}

export function useForumThread(threadId: string | undefined) {
  const { data, failed, isLoading, reload } = useLoader<{ thread: ForumThread; posts: ForumPost[] }>(threadId, fetchThread);
  return { thread: data?.thread ?? null, posts: data?.posts ?? [], failed, isLoading, reload };
}
