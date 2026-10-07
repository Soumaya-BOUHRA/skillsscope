import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NumberCounter } from '@/components/magic';
import { useLanguage } from '@/context/LanguageContext';

function gradeFor(score) {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'average';
  return 'weak';
}

const strokeColor = (score) => {
  if (score >= 85) return 'var(--color-success)';
  if (score >= 70) return 'var(--color-primary)';
  if (score >= 50) return 'var(--color-warning)';
  return 'var(--color-destructive)';
};

export default function ScoreCard({ score = 0, label, className }) {
  const { t } = useLanguage();
  const value = Math.max(0, Math.min(100, Number(score) || 0));
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const grade = gradeFor(value);

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className="relative h-44 w-44">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" className="stroke-muted" strokeWidth="12" />
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={strokeColor(value)}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tracking-tight">
            <NumberCounter value={value} />
          </span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{label || t('analysis.overallScore')}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t(`analysis.grades.${grade}`)}
        </p>
      </div>
    </div>
  );
}
