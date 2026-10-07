import { motion } from 'framer-motion';
import { BadgeCheck, CircleAlert, Compass, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';

export default function CareerRecommendationCard({ career, index = 0 }) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Card className="group relative h-full overflow-hidden transition-shadow hover:shadow-lg">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Compass className="h-4 w-4" />
              </span>
              <CardTitle className="text-base">{career.jobTitle}</CardTitle>
            </div>
            <div className="text-end">
              <p className="text-2xl font-bold text-primary">{career.compatibilityScore}%</p>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t('careers.compatibility')}
              </p>
            </div>
          </div>
          <Progress value={career.compatibilityScore} />
        </CardHeader>

        <CardContent className="space-y-4">
          {career.reason ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{t('careers.why')}: </span>
              {career.reason}
            </p>
          ) : null}

          {career.matchingSkills?.length ? (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-success">
                <BadgeCheck className="h-3.5 w-3.5" />
                {t('careers.matchingSkills')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {career.matchingSkills.map((skill) => (
                  <Badge key={skill} variant="success">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {career.missingSkills?.length ? (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-destructive">
                <CircleAlert className="h-3.5 w-3.5" />
                {t('careers.missingSkills')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {career.missingSkills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {career.skillsToDevelop?.length ? (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium">
                <Wrench className="h-3.5 w-3.5 text-primary" />
                {t('careers.develop')}
              </p>
              <p className="text-sm text-muted-foreground">{career.skillsToDevelop.join(' · ')}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
