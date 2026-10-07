import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Languages as LanguagesIcon,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Sparkles,
  Target,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ScoreCard from '@/components/ScoreCard';
import ScoreBreakdown from '@/components/ScoreBreakdown';
import SkillBadge from '@/components/SkillBadge';
import SkillChart from '@/components/SkillChart';
import ExperienceTimeline from '@/components/ExperienceTimeline';
import CareerRecommendationCard from '@/components/CareerRecommendationCard';
import { resumeApi, analysisApi } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';

function Section({ icon: Icon, title, children }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function EmptyText({ children }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export default function ResumeAnalysis() {
  const { resumeId } = useParams();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await resumeApi.get(resumeId);
      setResume(res.data.resume);
      setAnalysis(res.data.analysis);
      if (!res.data.analysis) {
        const result = await analysisApi.analyze(resumeId);
        setAnalysis(result.data.analysis);
        setResume(result.data.resume);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72" />
          <Skeleton className="h-72 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>{t('upload.failed')}</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error || t('errors.notFound')}</span>
            <Button size="sm" variant="outline" onClick={load}>
              <RefreshCw />
              {t('common.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const profile = analysis.profile || {};

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('analysis.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {resume?.originalName} · {resume?.status === 'analyzed' ? t('myCvs.status.analyzed') : resume?.status}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/app/careers/${analysis.id}`}>
              <Sparkles />
              {t('nav.careers')}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/matcher">
              <Target />
              {t('nav.jobMatcher')}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <CardContent className="flex justify-center pt-6">
              <ScoreCard score={analysis.score} />
            </CardContent>
          </Card>

          <Section icon={Mail} title={t('analysis.profile')}>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="font-medium">{profile.fullName || t('analysis.notFound')}</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {profile.email || t('analysis.notFound')}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                {profile.phone || t('analysis.notFound')}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {profile.location || t('analysis.notFound')}
              </li>
            </ul>
            {profile.summary ? (
              <p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">{profile.summary}</p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">{t('analysis.notFound')}</p>
            )}
          </Section>

          <Section icon={Award} title={t('analysis.certifications')}>
            {analysis.certifications?.length ? (
              <ul className="space-y-2 text-sm">
                {analysis.certifications.map((cert, i) => (
                  <li key={`${cert.name}-${i}`}>
                    <span className="font-medium">{cert.name}</span>
                    {cert.issuer ? <span className="text-muted-foreground"> · {cert.issuer}</span> : null}
                    {cert.date ? <span className="text-muted-foreground"> · {cert.date}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyText>{t('analysis.noCertifications')}</EmptyText>
            )}
          </Section>

          <Section icon={LanguagesIcon} title={t('analysis.languages')}>
            {analysis.languages?.length ? (
              <div className="flex flex-wrap gap-2">
                {analysis.languages.map((lang, i) => (
                  <Badge key={`${lang.name}-${i}`} variant="outline">
                    {lang.name}
                    {lang.level ? ` · ${lang.level}` : ''}
                  </Badge>
                ))}
              </div>
            ) : (
              <EmptyText>{t('common.none')}</EmptyText>
            )}
          </Section>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <ScoreBreakdown
            parts={analysis.scoreBreakdown}
            title={t('analysis.scoreBreakdown')}
            description={t('landing.scorePreviewText')}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Section icon={Wrench} title={t('analysis.skills')}>
              {analysis.skills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.map((skill, i) => (
                    <SkillBadge key={`${skill.name}-${i}`} skill={skill} />
                  ))}
                </div>
              ) : (
                <EmptyText>{t('common.none')}</EmptyText>
              )}

              {analysis.technicalSkills?.length ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t('analysis.technical')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.technicalSkills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {analysis.softSkills?.length ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t('analysis.soft')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.softSkills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {analysis.tools?.length || analysis.technologies?.length ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {[...analysis.tools, ...analysis.technologies].map((tool) => (
                    <Badge key={tool} variant="secondary">
                      {tool}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </Section>

            <SkillChart skills={analysis.skills} />
          </div>

          <ExperienceTimeline experience={analysis.experience} education={analysis.education} />

          <Section icon={BookOpen} title={t('analysis.projects')}>
            {analysis.projects?.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {analysis.projects.map((project, i) => (
                  <div key={`${project.name}-${i}`} className="rounded-lg border p-4">
                    <p className="font-medium">{project.name}</p>
                    {project.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                    ) : null}
                    {project.technologies?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-[10px]">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyText>{t('analysis.noProjects')}</EmptyText>
            )}
          </Section>

          <div className="grid gap-4 md:grid-cols-2">
            <Section icon={Briefcase} title={t('analysis.strengths')}>
              <ul className="space-y-2 text-sm">
                {analysis.strengths?.map((item, i) => (
                  <li key={`${item}-${i}`} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
            <Section icon={Target} title={t('analysis.weaknesses')}>
              <ul className="space-y-2 text-sm">
                {analysis.weaknesses?.map((item, i) => (
                  <li key={`${item}-${i}`} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          <Section icon={GraduationCap} title={t('analysis.recommendations')}>
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              {analysis.recommendations?.map((item, i) => (
                <li key={`${item}-${i}`} className="flex gap-2 rounded-lg bg-muted/40 p-3">
                  <span className="text-primary">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          {analysis.careerRecommendations?.length ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      {t('careers.title')}
                    </CardTitle>
                    <CardDescription>{t('careers.subtitle')}</CardDescription>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/app/careers/${analysis.id}`}>{t('common.seeAll')}</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {analysis.careerRecommendations.slice(0, 2).map((career, i) => (
                  <CareerRecommendationCard key={career.jobTitle} career={career} index={i} />
                ))}
              </CardContent>
            </Card>
          ) : null}

          <p className="text-xs text-muted-foreground">{t('analysis.disclaimer')}</p>
        </div>
      </div>
    </div>
  );
}
