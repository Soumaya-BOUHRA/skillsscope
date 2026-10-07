import {
  Bar,
  BarChart,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';

const CATEGORY_COLORS = {
  frontend: '#6366f1',
  backend: '#22c55e',
  database: '#f59e0b',
  devops: '#ef4444',
  ai: '#a855f7',
  mobile: '#06b6d4',
  design: '#ec4899',
  soft: '#84cc16',
  tools: '#64748b',
  general: '#6366f1',
};

function toChart(skills = []) {
  const map = new Map();
  for (const skill of skills) {
    const key = skill.category || 'general';
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .map(([category, count]) => ({
      category,
      count,
      fill: CATEGORY_COLORS[category] || '#6366f1',
    }))
    .sort((a, b) => b.count - a.count);
}

function levelChart(skills = []) {
  const order = ['beginner', 'intermediate', 'advanced', 'expert'];
  const counts = Object.fromEntries(order.map((l) => [l, 0]));
  for (const skill of skills) {
    if (skill.level && counts[skill.level] !== undefined) counts[skill.level] += 1;
  }
  return order.map((level) => ({ level, count: counts[level] }));
}

export default function SkillChart({ skills = [] }) {
  const { t } = useLanguage();
  const categories = toChart(skills);
  const levels = levelChart(skills);

  if (!skills.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('analysis.skillChart')}</CardTitle>
        <CardDescription>{t('landing.skillsText')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories">
          <TabsList className="mb-4">
            <TabsTrigger value="categories">{t('analysis.category')}</TabsTrigger>
            <TabsTrigger value="levels">{t('analysis.skillLevel')}</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={categories} outerRadius="75%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.45} />
              </RadarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="levels" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levels} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                <XAxis dataKey="level" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'var(--muted)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {levels.map((entry, index) => (
                    <Cell key={entry.level} fill={['#94a3b8', '#6366f1', '#22c55e', '#a855f7'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
