import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { BriefcaseBusiness, Loader2, Plus, Target, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input, Field, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import JobMatchCard from '@/components/JobMatchCard';
import LoadingAnalysis from '@/components/LoadingAnalysis';
import { jobApi, resumeApi } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';

const emptyForm = {
  title: '',
  company: '',
  location: '',
  description: '',
  skills: '',
  experienceRequired: '',
  educationRequired: '',
};

export default function JobMatcher() {
  const { t } = useLanguage();
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [matching, setMatching] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [jobMatches, setJobMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const analyzedResumes = useMemo(() => resumes.filter((r) => r.status === 'analyzed'), [resumes]);

  const load = async () => {
    setLoading(true);
    try {
      const [r, j] = await Promise.all([resumeApi.list(), jobApi.list()]);
      setResumes(r.data.resumes);
      setJobs(j.data.jobs);
      if (r.data.resumes.length && !selectedResume) {
        const firstAnalyzed = r.data.resumes.find((x) => x.status === 'analyzed') || r.data.resumes[0];
        setSelectedResume(firstAnalyzed.id);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedJob) {
      setJobMatches([]);
      return;
    }
    jobApi
      .matches(selectedJob)
      .then((res) => setJobMatches(res.data.matches))
      .catch(() => setJobMatches([]));
  }, [selectedJob]);

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = t('matcher.jobTitle');
    if (form.description.trim().length < 40) next.description = t('matcher.minDescription');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const runMatch = async (jobId) => {
    if (!selectedResume) {
      toast.error(t('matcher.noCvs'));
      return;
    }
    setMatching(true);
    setCurrentMatch(null);
    try {
      const res = await jobApi.match(jobId, selectedResume);
      setCurrentMatch(res.data.match);
      toast.success(t('common.success'));
      const matches = await jobApi.matches(jobId);
      setJobMatches(matches.data.matches);
    } catch (err) {
      toast.error(err.message || t('errors.generic'));
    } finally {
      setMatching(false);
    }
  };

  const handleCreateAndMatch = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setMatching(true);
    setCurrentMatch(null);
    try {
      const created = await jobApi.create({
        title: form.title,
        company: form.company,
        location: form.location,
        description: form.description,
        skills: form.skills,
        experienceRequired: form.experienceRequired,
        educationRequired: form.educationRequired,
      });
      setJobs((prev) => [created.data.job, ...prev]);
      setSelectedJob(created.data.job.id);
      setForm(emptyForm);

      const res = await jobApi.match(created.data.job.id, selectedResume);
      setCurrentMatch(res.data.match);
      toast.success(t('common.success'));
      const matches = await jobApi.matches(created.data.job.id);
      setJobMatches(matches.data.matches);
    } catch (err) {
      toast.error(err.message || t('errors.generic'));
    } finally {
      setMatching(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await jobApi.remove(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      if (selectedJob === jobId) setSelectedJob('');
      toast.success(t('matcher.jobDeleted'));
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('matcher.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('matcher.subtitle')}</p>
      </div>

      {resumes.length === 0 ? (
        <Alert>
          <BriefcaseBusiness />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{t('matcher.noCvs')}</span>
            <Button asChild size="sm">
              <Link to="/app/upload">{t('matcher.uploadCv')}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('matcher.selectCv')}</CardTitle>
              <CardDescription>{t('myCvs.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedResume} onValueChange={setSelectedResume}>
                <SelectTrigger>
                  <SelectValue placeholder={t('matcher.selectCv')} />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.originalName} · {t(`myCvs.status.${resume.status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {resumes.length > 0 && analyzedResumes.length === 0 ? (
                <p className="text-xs text-warning">{t('matcher.noCvs')}</p>
              ) : null}
            </CardContent>
          </Card>

          <Tabs defaultValue="existing" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">{t('matcher.savedJobs')}</TabsTrigger>
              <TabsTrigger value="new">{t('matcher.newOffer')}</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-3">
              {jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('common.none')}</p>
              ) : (
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className={`flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors ${
                        selectedJob === job.id ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-start"
                        onClick={() => setSelectedJob(job.id)}
                      >
                        <p className="truncate text-sm font-medium">{job.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {[job.company, job.location].filter(Boolean).join(' · ')}
                        </p>
                      </button>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => runMatch(job.id)} disabled={matching}>
                          {matching ? <Loader2 className="animate-spin" /> : <Target />}
                          {t('matcher.matchAgain')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteJob(job.id)}
                          aria-label={t('matcher.deleteJob')}
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="new">
              <form onSubmit={handleCreateAndMatch} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t('matcher.jobTitle')} htmlFor="title" error={errors.title}>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Frontend Developer"
                    />
                  </Field>
                  <Field label={t('matcher.company')} htmlFor="company">
                    <Input
                      id="company"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="Acme Inc."
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t('matcher.location')} htmlFor="location">
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="Paris / Remote"
                    />
                  </Field>
                  <Field label={t('matcher.requiredSkills')} htmlFor="skills">
                    <Input
                      id="skills"
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                      placeholder="React, TypeScript, Git"
                    />
                  </Field>
                </div>

                <Field
                  label={t('matcher.jobDescription')}
                  htmlFor="description"
                  error={errors.description}
                >
                  <Textarea
                    id="description"
                    rows={7}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder={t('matcher.jobDescriptionPlaceholder')}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t('matcher.experienceRequired')} htmlFor="exp">
                    <Input
                      id="exp"
                      value={form.experienceRequired}
                      onChange={(e) => setForm({ ...form, experienceRequired: e.target.value })}
                      placeholder="2+ years"
                    />
                  </Field>
                  <Field label={t('matcher.educationRequired')} htmlFor="edu">
                    <Input
                      id="edu"
                      value={form.educationRequired}
                      onChange={(e) => setForm({ ...form, educationRequired: e.target.value })}
                      placeholder="BSc Computer Science"
                    />
                  </Field>
                </div>

                <Button type="submit" className="w-full" disabled={matching || !selectedResume}>
                  {matching ? <Loader2 className="animate-spin" /> : <Plus />}
                  {matching ? t('matcher.matching') : t('matcher.createMatch')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6 lg:col-span-3">
          {matching ? (
            <Card>
              <CardContent>
                <LoadingAnalysis text={t('matcher.matching')} />
              </CardContent>
            </Card>
          ) : currentMatch ? (
            <div className="space-y-4">
              <JobMatchCard match={currentMatch} />
              {currentMatch.matchingExperience ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t('matcher.experienceAnalysis')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>{currentMatch.matchingExperience}</p>
                    {currentMatch.matchingEducation ? (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">{t('matcher.educationAnalysis')}:</span>{' '}
                        {currentMatch.matchingEducation}
                      </p>
                    ) : null}
                    {currentMatch.relevantProjects?.length ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {currentMatch.relevantProjects.map((project) => (
                          <Badge key={project} variant="secondary">
                            {project}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <Target className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t('matcher.orPaste')}</p>
              </CardContent>
            </Card>
          )}

          {jobMatches.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('matcher.historyMatches')}
                  {jobs.find((j) => j.id === selectedJob)
                    ? ` · ${t('matcher.matchesFor')} ${jobs.find((j) => j.id === selectedJob)?.title}`
                    : ''}
                </CardTitle>
                <CardDescription>
                  {format(new Date(jobMatches[0].createdAt), 'PP')} · {jobMatches.length}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {jobMatches.slice(0, 5).map((match) => (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => setCurrentMatch(match)}
                    className="flex w-full items-center justify-between rounded-lg border p-3 text-start transition-colors hover:bg-accent"
                  >
                    <span className="text-sm text-muted-foreground">{format(new Date(match.createdAt), 'PPp')}</span>
                    <span className="text-lg font-semibold">{match.overallScore}%</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          ) : selectedJob ? (
            <p className="text-sm text-muted-foreground">{t('matcher.noMatches')}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
