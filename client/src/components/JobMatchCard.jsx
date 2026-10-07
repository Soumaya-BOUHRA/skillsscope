import { motion } from 'framer-motion';
import { BadgeCheck, CircleAlert, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';

export default function JobMatchCard({ match, showBreakdown = true }) {
  const { t } = useLanguage();
  if (!match) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{t('matcher.matchScore')}</CardTitle>
            {match.summary ? <CardDescription className="mt-1">{match.summary}</CardDescription> : null}
          </div>
          <div className="text-end">
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-4xl font-bold"
            >
              {match.overallScore}%
            </motion.p>
            <p className="text-xs text-muted-foreground">{t('matcher.compatibility')}</p>
          </div>
        </div>
        <Progress value={match.overallScore} className="h-2.5" />
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-success">
              <BadgeCheck className="h-4 w-4" />
              {t('matcher.matchedKeywords')} · {t('analysis.matched')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {match.matchingSkills?.length ? (
                match.matchingSkills.map((skill) => (
                  <Badge key={skill} variant="success">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">{t('common.none')}</span>
              )}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-destructive">
              <CircleAlert className="h-4 w-4" />
              {t('analysis.missing')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {match.missingSkills?.length ? (
                match.missingSkills.map((skill) => (
                  <Badge key={skill} variant="destructive">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">{t('common.none')}</span>
              )}
            </div>
          </div>
        </div>

        {showBreakdown && match.scoreBreakdown?.length ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">{t('matcher.breakdown')}</p>
            {match.scoreBreakdown.map((part) => (
              <div key={part.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {part.label} <span className="text-muted-foreground">({part.weight}%)</span>
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {part.score}/{part.max}
                  </span>
                </div>
                <Progress value={part.max ? (part.score / part.max) * 100 : 0} />
              </div>
            ))}
          </div>
        ) : null}

        {match.recommendation ? (
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="mb-1 flex items-center gap-1.5 text-sm font-medium">
              <Lightbulb className="h-4 w-4 text-primary" />
              {t('matcher.recommendation')}
            </p>
            <p className="text-sm text-muted-foreground">{match.recommendation}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
