import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FileSearch, History as HistoryIcon, Search, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { historyApi } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';

const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

export default function History() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('newest');

  const fetchHistory = useMemo(
    () =>
      debounce(async ({ q, type: kind, sort: order }) => {
        try {
          const res = await historyApi.list({ q, type: kind, sort: order, limit: 50 });
          setItems(res.data.items);
        } catch (err) {
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    setLoading(true);
    fetchHistory({ q: query, type, sort });
  }, [query, type, sort, fetchHistory]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('history.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('history.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-9"
            placeholder={t('history.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t('history.type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="analyses">{t('history.analysis')}</SelectItem>
            <SelectItem value="matches">{t('history.match')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder={t('history.sort')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('history.newest')}</SelectItem>
            <SelectItem value="oldest">{t('history.oldest')}</SelectItem>
            <SelectItem value="score-desc">{t('history.scoreDesc')}</SelectItem>
            <SelectItem value="score-asc">{t('history.scoreAsc')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <HistoryIcon className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('history.empty')}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      item.kind === 'match' ? 'bg-success/15 text-success' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {item.kind === 'match' ? <Target className="h-4 w-4" /> : <FileSearch className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[item.subtitle, format(new Date(item.createdAt), 'PPp')].filter(Boolean).join(' · ')}
                    </p>
                    {item.kind === 'analysis' && item.careers ? (
                      <p className="text-xs text-muted-foreground">
                        {t('history.careersCount', { count: item.careers })}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={item.kind === 'match' ? 'success' : 'secondary'}>
                    {item.score}
                    {item.kind === 'match' ? '%' : '/100'}
                  </Badge>
                  {item.kind === 'analysis' && item.resume ? (
                    <Link
                      to={`/app/analysis/${item.resume}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {t('common.viewDetails')}
                    </Link>
                  ) : item.kind === 'match' && item.job ? (
                    <Link to="/app/matcher" className="text-sm font-medium text-primary hover:underline">
                      {t('common.viewDetails')}
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
