import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { BarChart3, FileText, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { resumeApi } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';

const statusVariant = {
  uploaded: 'outline',
  processing: 'warning',
  analyzed: 'success',
  failed: 'destructive',
};

export default function MyCvs() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await resumeApi.list();
      setResumes(res.data.resumes);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    try {
      await resumeApi.remove(pendingDelete.id);
      toast.success(t('myCvs.deleted'));
      setResumes((prev) => prev.filter((r) => r.id !== pendingDelete.id));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('myCvs.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('myCvs.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={load} aria-label={t('common.retry')}>
            <RefreshCw />
          </Button>
          <Button asChild size="sm">
            <Link to="/app/upload">
              <Plus />
              {t('myCvs.upload')}
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('myCvs.empty')}</p>
            <Button asChild>
              <Link to="/app/upload">
                <Plus />
                {t('myCvs.upload')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume.id} className="transition-shadow hover:shadow-md">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{resume.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('myCvs.uploadedAt', {
                          date: format(new Date(resume.createdAt), 'PPP', { locale: undefined }),
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusVariant[resume.status] || 'outline'}>
                    {t(`myCvs.status.${resume.status}`)}
                  </Badge>
                </div>

                {resume.error ? (
                  <p className="truncate text-xs text-destructive">{resume.error}</p>
                ) : null}

                <div className="flex gap-2">
                  {resume.status === 'analyzed' ? (
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link to={`/app/analysis/${resume.id}`}>
                        <BarChart3 />
                        {t('myCvs.view')}
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate('/app/upload')}
                      disabled={resume.status === 'processing'}
                    >
                      <BarChart3 />
                      {t('myCvs.analyze')}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPendingDelete(resume)}
                    aria-label={t('common.delete')}
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.delete')}</DialogTitle>
            <DialogDescription>{t('myCvs.deleteConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
