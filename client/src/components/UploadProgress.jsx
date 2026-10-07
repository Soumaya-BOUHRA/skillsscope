import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';

const STEPS = [
  { key: 'upload', bar: 10 },
  { key: 'extract', bar: 28 },
  { key: 'ocr', bar: 40 },
  { key: 'profile', bar: 58 },
  { key: 'skills', bar: 72 },
  { key: 'score', bar: 86 },
  { key: 'recommendations', bar: 100 },
];

export default function UploadProgress({ activeIndex = 0, uploadPercent = 0, done = false }) {
  const { t } = useLanguage();

  const barValue = done ? 100 : Math.max(uploadPercent * 0.1, STEPS[activeIndex]?.bar || 0);

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            {done ? t('upload.success') : t('upload.analyzingTitle')}
          </span>
          <span className="tabular-nums text-muted-foreground">{Math.round(barValue)}%</span>
        </div>
        <Progress value={barValue} className="h-2.5" />
        {!done ? <p className="mt-2 text-sm text-muted-foreground">{t('upload.analyzingText')}</p> : null}
      </div>

      <ol className="space-y-3">
        {STEPS.map((step, index) => {
          const state = done || index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending';
          return (
            <motion.li
              key={step.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 text-sm"
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium',
                  state === 'done' && 'border-transparent bg-success/15 text-success',
                  state === 'active' && 'border-primary text-primary',
                  state === 'pending' && 'border-border text-muted-foreground'
                )}
              >
                {state === 'done' ? (
                  <Check className="h-3.5 w-3.5" />
                ) : state === 'active' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  index + 1
                )}
              </span>
              <span className={state === 'pending' ? 'text-muted-foreground' : 'font-medium'}>
                {t(`upload.steps.${step.key}`)}
              </span>
              <span className="ms-auto text-xs text-muted-foreground">
                {t(`upload.stepStatus.${state}`)}
              </span>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
