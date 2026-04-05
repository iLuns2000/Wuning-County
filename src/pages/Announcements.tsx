import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ExternalLink, Megaphone } from 'lucide-react';
import { getActiveAnnouncements, type Announcement } from '@/utils/cloudApi';
import { formatImageUrl } from '@/components/ActivityModal';

const POSITION_LABEL: Record<Announcement['display_position'], string> = {
  activity: '活动',
  banner: '横幅',
  top: '置顶',
};

function sortAnnouncements(data: Announcement[]): Announcement[] {
  return [...data].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.id - a.id;
  });
}

export const Announcements: React.FC = () => {
  const navigate = useNavigate();
  const { announcementId } = useParams<{ announcementId?: string }>();
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getActiveAnnouncements();
        if (cancelled) return;
        if (!res.success) {
          setError('加载公告失败，请稍后再试');
          setList([]);
          return;
        }
        setList(sortAnnouncements(res.data || []));
      } catch {
        if (!cancelled) {
          setError('网络异常，无法获取公告');
          setList([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const idNum = announcementId !== undefined ? Number.parseInt(announcementId, 10) : NaN;
  const selected = useMemo(() => {
    if (!Number.isFinite(idNum)) return null;
    return list.find((a) => a.id === idNum) ?? null;
  }, [list, idNum]);

  const isDetail = announcementId !== undefined && announcementId !== '';

  /**
   * 顶栏返回统一用 history 后退：
   * - 在详情：弹出详情，回到列表（不要用 push/replace 到 /announcements，否则会叠两条列表或回到详情）。
   * - 在列表：回到进入公告前的页面（如游戏）。
   */
  const handleBack = () => navigate(-1);

  return (
    <div className="p-4 min-h-screen bg-gradient-to-b from-sky-50 to-sky-100/60 dark:from-slate-900 dark:to-slate-900/95">
      <div className="mx-auto mb-4 max-w-md">
        <button
          type="button"
          onClick={() => handleBack()}
          className="inline-flex items-center text-sky-800 hover:text-sky-600 dark:text-sky-300 dark:hover:text-sky-200"
        >
          <ArrowLeft className="mr-1 w-5 h-5" />
          {isDetail ? '返回列表' : '返回'}
        </button>
      </div>

      <div className="mx-auto space-y-4 max-w-md">
        <div className="py-2 text-center">
          <h1 className="flex gap-2 justify-center items-center text-2xl font-bold text-sky-900 dark:text-sky-100">
            <Megaphone className="w-8 h-8 text-sky-600 dark:text-sky-400" />
            县城公告
          </h1>
          <p className="mt-1 text-sm text-sky-800/80 dark:text-sky-300/90">
            {isDetail ? '公告正文' : '点击一条查看全文与配图'}
          </p>
        </div>

        {loading && (
          <div className="p-8 text-center text-sky-600 dark:text-sky-400 text-sm">县衙正在张贴榜文…</div>
        )}

        {!loading && error && (
          <div className="p-4 border rounded-lg border-destructive/30 bg-destructive/5 text-sm text-center text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && !isDetail && list.length === 0 && (
          <div className="p-8 text-center text-sky-600 dark:text-sky-400 text-sm">当前暂无生效中的公告</div>
        )}

        {!loading && !error && !isDetail && list.length > 0 && (
          <div className="overflow-hidden bg-white dark:bg-card rounded-lg border border-sky-100 dark:border-sky-900/40 shadow-lg">
            <div className="px-4 py-3 bg-sky-600 dark:bg-sky-800">
              <h2 className="flex gap-2 items-center font-bold text-white text-sm">
                <Megaphone className="w-4 h-4" />
                公告列表（共 {list.length} 条）
              </h2>
            </div>
            <div className="divide-y divide-sky-50 dark:divide-border">
              {list.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`/announcements/${item.id}`)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-sky-50/80 dark:hover:bg-accent/40"
                >
                  <div className="flex justify-center items-center w-9 h-9 text-sm font-bold rounded-full shrink-0 bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 gap-y-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/80 dark:text-sky-200">
                        {POSITION_LABEL[item.display_position]}
                      </span>
                      {item.priority > 0 && (
                        <span className="text-[10px] text-muted-foreground">优先 {item.priority}</span>
                      )}
                    </div>
                    <div className="mt-1 font-medium text-sky-950 dark:text-foreground line-clamp-2">{item.title}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 shrink-0 text-sky-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && isDetail && Number.isFinite(idNum) && !selected && (
          <div className="p-8 text-center text-sky-600 dark:text-sky-400 text-sm border rounded-lg bg-white dark:bg-card border-sky-100">
            未找到该公告，可能已撤下或链接有误。
            <button
              type="button"
              className="block mx-auto mt-4 text-sky-700 dark:text-sky-300 underline text-sm"
              onClick={() => handleBack()}
            >
              回公告列表
            </button>
          </div>
        )}

        {!loading && !error && selected && (
          <article className="overflow-hidden rounded-lg border bg-white dark:bg-card border-sky-100 dark:border-border shadow-lg">
            <div className="px-4 py-3 border-b border-border/80 flex flex-wrap items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/80 dark:text-sky-200">
                {POSITION_LABEL[selected.display_position]}
              </span>
              <h2 className="text-base font-bold flex-1 min-w-0 text-sky-950 dark:text-foreground">{selected.title}</h2>
            </div>
            {selected.content ? (
              <div className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                {selected.content}
              </div>
            ) : null}
            {selected.image_url ? (
              <div className="px-0">
                <img
                  src={formatImageUrl(selected.image_url)}
                  alt=""
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
            ) : null}
            {selected.link_url ? (
              <div className="px-4 py-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => window.open(selected.link_url, '_blank', 'noopener,noreferrer')}
                  className="flex items-center justify-center gap-2 w-full p-2.5 text-sm font-medium rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                >
                  <span>查看详情</span>
                  <ExternalLink size={16} />
                </button>
              </div>
            ) : null}
          </article>
        )}
      </div>
    </div>
  );
};
