import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  FileSearch,
  Layers,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { statsApi, historyApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatDistanceToNow } from 'date-fns';

function StatCard({ icon: Icon, label, value, hint, accent }) {
  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value ?? '—'}</p>
            {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
          </div>
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [s, h] = await Promise.all([statsApi.dashboard(), historyApi.list({ limit: 6 })]);
        if (!mounted) return;
        setStats(s.data);
        setActivity(h.data.items);
      } catch {
        if (mounted) setStats(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const counters = stats?.counters;
  const chartData = (stats?.scoreSeries || []).map((point) => ({
    ...point,
    label: formatDistanceToNow(new Date(point.date), { addSuffix: true }),
  }));

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('dashboard.welcome', { name: user?.name?.split(' ')[0] || '' })}
          </h1>
          <p className="text-sm text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/app/matcher">
              <Target />
              {t('dashboard.matchJob')}
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/app/upload">
              <FileSearch />
              {t('dashboard.uploadCv')}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label={t('dashboard.cvScore')}
          value={counters?.latestScore != null ? `${counters.latestScore}` : null}
          hint={
            counters?.bestCvScore != null
              ? `${t('common.score')}: ${counters.bestCvScore}/100`
              : t('dashboard.noData')
          }
          accent="bg-primary/10 text-primary"
        />
        <StatCard
          icon={BriefcaseBusiness}
          label={t('dashboard.jobsAnalyzed')}
          value={counters?.jobs ?? 0}
          hint={counters?.matches ? `${counters.matches} matches` : null}
          accent="bg-warning/15 text-warning"
        />
        <StatCard
          icon={Target}
          label={t('dashboard.bestMatch')}
          value={counters?.bestMatch != null ? `${counters.bestMatch}%` : null}
          hint={counters?.bestMatch != null ? t('matcher.compatibility') : t('dashboard.noData')}
          accent="bg-success/15 text-success"
        />
        <StatCard
          icon={Layers}
          label={t('dashboard.skillsDetected')}
          value={counters?.skillsDetected ?? 0}
          hint={counters?.analyses ? `${counters.analyses} analyses` : null}
          accent="bg-destructive/10 text-destructive"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t('dashboard.scoreTrend')}
            </CardTitle>
            <CardDescription>{t('dashboard.scoreOverTime')}</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      color: 'var(--popover-foreground)',
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#scoreFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {t('dashboard.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              {t('dashboard.topSkills')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.skillBreakdown?.length ? (
              stats.skillBreakdown.map((skill) => (
                <div key={skill.skill} className="flex items-center justify-between text-sm">
                  <span className="truncate">{skill.skill}</span>
                  <Badge variant="secondary">{skill.count}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t('dashboard.noData')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t('dashboard.recentActivity')}
              </CardTitle>
              <CardDescription>{t('history.subtitle')}</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/history">
                {t('common.seeAll')}
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activity.length ? (
            <ul className="divide-y">
              {activity.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.subtitle ? `${item.subtitle} · ` : ''}
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant={item.kind === 'match' ? 'success' : 'secondary'}>
                    {item.score}
                    {item.kind === 'match' ? '%' : '/100'}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">{t('dashboard.noData')}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
