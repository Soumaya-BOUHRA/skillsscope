import { Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';

export default function ExperienceTimeline({ experience = [], education = [] }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('analysis.experience')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {experience.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('analysis.noExperience')}</p>
          ) : (
            experience.map((item, index) => (
              <div key={`${item.title}-${index}`} className="relative ps-6">
                <span className="absolute start-0 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary/15">
                  <Briefcase className="h-2.5 w-2.5 text-primary" />
                </span>
                {index < experience.length - 1 ? (
                  <span className="absolute start-[7px] top-6 h-[calc(100%)] w-px bg-border" aria-hidden />
                ) : null}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    {item.current ? <Badge variant="success">{t('analysis.current')}</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {[item.company, item.location].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[item.startDate, item.endDate || (item.current ? '' : '')].filter(Boolean).join(' — ')}
                  </p>
                  {item.description ? (
                    <p className="whitespace-pre-line pt-1 text-sm text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('analysis.education')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {education.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('analysis.noEducation')}</p>
          ) : (
            education.map((item, index) => (
              <div key={`${item.degree}-${index}`} className="relative ps-6">
                <span className="absolute start-0 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary/15">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                </span>
                <div className="space-y-1">
                  <p className="font-medium">{item.degree}</p>
                  <p className="text-sm text-muted-foreground">
                    {[item.institution, item.field].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[item.startDate, item.endDate].filter(Boolean).join(' — ')}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
