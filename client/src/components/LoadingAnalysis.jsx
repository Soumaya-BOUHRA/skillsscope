import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LoadingAnalysis({ text }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
      >
        <Sparkles className="h-6 w-6" />
      </motion.span>
      <div>
        <p className="font-medium">{text || t('upload.analyzingTitle')}</p>
        <p className="text-sm text-muted-foreground">{t('upload.analyzingText')}</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
