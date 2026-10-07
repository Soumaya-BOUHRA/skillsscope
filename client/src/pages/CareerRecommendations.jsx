import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CareerRecommendationCard from '@/components/CareerRecommendationCard';
import { analysisApi, resumeApi } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';

export default function CareerRecommendations() {
  const { analysisId } = useParams();
  const { t } = useLanguage();
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(analysisId || '');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    resumeApi
      .list()
      .then((res) => {
        const analyzed = res.data.resumes.filter((r) => r.status === 'analyzed');
        setResumes(analyzed);
        if (!selectedResume && analyzed.length) setSelectedResume(analyzed[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCareers = async (resumeId, force = false) => {
    setGenerating(true);
    setError(null);
    try {
      const res = await analysisApi.get(resumeId);
      const analysis = res.data.analysis;
      if (!analysis) {
        setError(t('careers.empty'));
        setRecommendations([]);
        return;
      }
      if (!force && analysis.careerRecommendations?.length) {
        setRecommendations(analysis.careerRecommendations);
        return;
      }
      const careers = await analysisApi.careers(analysis.id, force);
      setRecommendations(careers.data.recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (selectedResume) fetchCareers(selectedResume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResume]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('careers.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('careers.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {resumes.length > 1 ? (
            <Select value={selectedResume} onValueChange={setSelectedResume}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder={t('matcher.selectCv')} />
              </SelectTrigger>
              <SelectContent>
                {resumes.map((resume) => (
                  <SelectItem key={resume.id} value={resume.id}>
                    {resume.originalName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedResume && fetchCareers(selectedResume, true)}
            disabled={!selectedResume || generating}
          >
            {generating ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            {t('careers.regenerate')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <Alert>
          <Sparkles />
          <AlertTitle>{t('careers.empty')}</AlertTitle>
          <AlertDescription>
            <Button asChild size="sm" className="mt-2">
              <Link to="/app/upload">{t('upload.title')}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : generating && recommendations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t('careers.generating')}</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>{t('common.error')}</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={() => fetchCareers(selectedResume, true)}>
              {t('common.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((career, index) => (
            <CareerRecommendationCard key={career.jobTitle} career={career} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
