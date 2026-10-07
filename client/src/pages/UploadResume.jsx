import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ResumeUploader from '@/components/ResumeUploader';
import UploadProgress from '@/components/UploadProgress';
import { resumeApi, analysisApi } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';

const MAX_SIZE_MB = 5;

export default function UploadResume() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | uploading | analyzing | done
  const [uploadPercent, setUploadPercent] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const advanceSteps = () => {
    // Steps advance realistically: extraction/OCR happen server-side before the AI call.
    [1, 2, 3].forEach((step, i) => {
      timers.current.push(setTimeout(() => setActiveStep(step), 700 * (i + 1)));
    });
    timers.current.push(setTimeout(() => setActiveStep(4), 4000));
    timers.current.push(setTimeout(() => setActiveStep(5), 9000));
  };

  const handleStart = async () => {
    if (!file) return;
    setError(null);
    clearTimers();

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(t('upload.tooBig', { size: MAX_SIZE_MB }));
      return;
    }

    setPhase('uploading');
    setUploadPercent(0);
    setActiveStep(0);

    try {
      const uploaded = await resumeApi.upload(file, setUploadPercent);
      setPhase('analyzing');
      setActiveStep(1);
      advanceSteps();

      const result = await analysisApi.analyze(uploaded.data.resume.id);
      clearTimers();
      setActiveStep(6);
      setPhase('done');
      toast.success(t('upload.success'));

      setTimeout(() => navigate(`/app/analysis/${result.data.resume.id}`), 600);
    } catch (err) {
      clearTimers();
      setPhase('idle');
      setActiveStep(0);
      setError(err.message || t('errors.generic'));
      toast.error(err.message || t('errors.generic'));
    }
  };

  const busy = phase === 'uploading' || phase === 'analyzing';

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('upload.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('upload.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('upload.dropTitle')}</CardTitle>
          <CardDescription>{t('upload.formats', { size: MAX_SIZE_MB })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ResumeUploader file={file} onFile={setFile} disabled={busy} error={error} />

          {phase === 'idle' ? (
            <div className="flex justify-end">
              <Button onClick={handleStart} disabled={!file}>
                {t('upload.start')}
              </Button>
            </div>
          ) : null}

          {busy || phase === 'done' ? (
            <div className="rounded-lg border bg-muted/30 p-5">
              <UploadProgress
                activeIndex={activeStep}
                uploadPercent={phase === 'uploading' ? uploadPercent : 100}
                done={phase === 'done'}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
