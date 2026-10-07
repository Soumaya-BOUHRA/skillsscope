import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Image as ImageIcon, Loader2, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

const MAX_SIZE_MB = 5;
const ACCEPT = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
};

export default function ResumeUploader({ file, onFile, disabled, error }) {
  const { t } = useLanguage();
  const [rejected, setRejected] = useState(null);

  const onDrop = useCallback(
    (accepted, rejections) => {
      setRejected(null);
      if (rejections.length) {
        const code = rejections[0].errors?.[0]?.code;
        setRejected(code === 'file-too-large' ? t('upload.tooBig', { size: MAX_SIZE_MB }) : t('upload.invalidType'));
        return;
      }
      onFile(accepted[0] || null);
    },
    [onFile, t]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 1,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    multiple: false,
    disabled,
    noClick: Boolean(file),
  });

  const message = error || rejected;

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          isDragActive && 'border-primary bg-primary/5',
          file && 'border-solid bg-muted/30',
          disabled && 'cursor-not-allowed opacity-60',
          message && 'border-destructive/60'
        )}
        onClick={file ? undefined : undefined}
      >
        <input {...getInputProps()} />

        {file ? (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              {file.type?.startsWith('image/') ? <ImageIcon className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
            </div>
            <div>
              <p className="max-w-xs truncate text-sm font-medium">{t('upload.selected')}</p>
              <p className="max-w-xs truncate text-sm text-muted-foreground">{file.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!disabled ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFile(null);
                }}
              >
                <X />
                {t('common.delete')}
              </Button>
            ) : null}
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium">{t('upload.dropTitle')}</p>
              <p className="text-sm text-muted-foreground">{t('upload.dropText')}</p>
            </div>
            <p className="text-xs text-muted-foreground">{t('upload.formats', { size: MAX_SIZE_MB })}</p>
            <Button type="button" variant="outline" size="sm" onClick={open} disabled={disabled}>
              {disabled && <Loader2 className="animate-spin" />}
              {t('upload.dropText')}
            </Button>
          </>
        )}
      </div>

      {message ? <p className="text-sm font-medium text-destructive">{message}</p> : null}
    </div>
  );
}
