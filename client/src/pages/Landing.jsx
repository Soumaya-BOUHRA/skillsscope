import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Cpu,
  FileSearch,
  GitBranch,
  Layers,
  Moon,
  ScanText,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BorderBeam, NumberCounter, ShimmerText, Spotlight } from '@/components/magic';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const CURRENT_YEAR = new Date().getFullYear();

const CRITERIA = [
  { label: 'Contact', weight: 10, score: 9 },
  { label: 'Summary', weight: 10, score: 7 },
  { label: 'Skills', weight: 20, score: 18 },
  { label: 'Experience', weight: 25, score: 21 },
  { label: 'Education', weight: 10, score: 9 },
  { label: 'Projects', weight: 10, score: 7 },
  { label: 'Certifications', weight: 5, score: 4 },
  { label: 'Structure', weight: 10, score: 8 },
];

const STEPS = [
  { icon: ScanText, title: 'step1Title', text: 'step1Text' },
  { icon: Sparkles, title: 'step2Title', text: 'step2Text' },
  { icon: BarChart3, title: 'step3Title', text: 'step3Text' },
  { icon: Target, title: 'step4Title', text: 'step4Text' },
];

const FEATURES = [
  { icon: FileSearch, title: 'analysisTitle', text: 'analysisText' },
  { icon: Layers, title: 'skillsTitle', text: 'skillsText' },
  { icon: BriefcaseBusiness, title: 'careersTitle', text: 'careersText' },
  { icon: Target, title: 'matchingTitle', text: 'matchingText' },
];

const TECH = [
  { icon: Zap, name: 'React + Vite' },
  { icon: Cpu, name: 'Node.js + Express' },
  { icon: GitBranch, name: 'MongoDB Atlas' },
  { icon: Sparkles, name: 'Groq API' },
  { icon: ShieldCheck, name: 'JWT + bcrypt' },
  { icon: ScanText, name: 'OCR engine' },
];

function CountUpStat({ value, suffix = '', label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold">
        <NumberCounter value={value} />
        {suffix}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default function Landing() {
  const { t, lang, setLang, languages } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const appHref = loading ? '/app' : user ? '/app' : '/register';

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header
        className={cn(
          'sticky top-0 z-40 border-b transition-colors',
          scrolled ? 'bg-background/85 backdrop-blur' : 'border-transparent bg-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              S
            </span>
            <span className="text-lg font-semibold tracking-tight">{t('common.appName')}</span>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">
              {t('landing.howItWorks')}
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              {t('landing.analysisTitle')}
            </a>
            <a href="#score" className="transition-colors hover:text-foreground">
              {t('landing.scorePreview')}
            </a>
            <a href="#tech" className="transition-colors hover:text-foreground">
              {t('landing.tech')}
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center rounded-lg border p-0.5 sm:flex">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={cn(
                    'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                    lang === l.code ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {l.code.toUpperCase()}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="theme"
            >
              {theme === 'dark' ? <Sun /> : <Moon />}
            </Button>
            {user ? (
              <Button asChild size="sm">
                <Link to="/app">{t('nav.dashboard')}</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/login">{t('nav.login')}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">{t('nav.register')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <Spotlight className="absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_60%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:py-32">
            <Badge variant="secondary" className="mb-6 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5" />
              {t('landing.badge')}
            </Badge>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              <ShimmerText>{t('landing.title')}</ShimmerText>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{t('landing.subtitle')}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="relative overflow-hidden">
                <Link to={appHref}>
                  {t('landing.ctaAnalyze')}
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={user ? '/app/matcher' : '/register'}>{t('landing.ctaMatcher')}</Link>
              </Button>
            </div>

            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
              <CountUpStat value={8} label={t('landing.analysisTitle')} />
              <CountUpStat value={100} suffix="/100" label={t('common.score')} />
              <CountUpStat value={6} label={t('nav.careers')} />
              <CountUpStat value={3} label={t('settings.language')} />
            </div>

            <p className="mt-10 text-xs text-muted-foreground">{t('landing.trustedBy')}</p>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">{t('landing.howItWorks')}</h2>
            <p className="mt-3 text-muted-foreground">{t('landing.howItWorksSubtitle')}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                className="group relative rounded-xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="absolute end-4 top-4 text-4xl font-bold text-muted/70">
                  0{index + 1}
                </span>
                <step.icon className="mb-4 h-6 w-6 text-primary" />
                <h3 className="mb-2 font-semibold">{t(`landing.${step.title}`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`landing.${step.text}`)}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="border-y bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">{t('common.appName')}</h2>
              <p className="mt-3 text-muted-foreground">{t('landing.footerText')}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {FEATURES.map((feature, index) => (
                <div key={feature.title} className="relative overflow-hidden rounded-xl border bg-card p-6">
                  {index === 0 ? <BorderBeam duration={8} /> : null}
                  <feature.icon className="mb-3 h-6 w-6 text-primary" />
                  <h3 className="mb-2 text-lg font-semibold">{t(`landing.${feature.title}`)}</h3>
                  <p className="text-sm text-muted-foreground">{t(`landing.${feature.text}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="score" className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{t('landing.scorePreview')}</h2>
              <p className="mt-3 text-muted-foreground">{t('landing.scorePreviewText')}</p>
              <ul className="mt-6 space-y-3">
                {CRITERIA.map((criterion) => (
                  <li key={criterion.label} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    <span className="w-32">{criterion.label}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(criterion.score / criterion.weight) * 100}%` }}
                      />
                    </span>
                    <span className="w-16 text-end tabular-nums text-muted-foreground">
                      {criterion.score}/{criterion.weight}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">{t('landing.disclaimer')}</p>
            </div>

            <div className="rounded-2xl border bg-card p-8 shadow-xl">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-muted-foreground">{t('analysis.overallScore')}</span>
                <span className="text-5xl font-bold">
                  <NumberCounter value={83} />
                  <span className="text-lg text-muted-foreground">/100</span>
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {CRITERIA.map((criterion, index) => (
                  <div key={criterion.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{criterion.label}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {criterion.score}/{criterion.weight}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${(criterion.score / criterion.weight) * 100}%`,
                          animation: `grow 900ms ease-out ${index * 80}ms both`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="tech" className="border-t bg-muted/30 py-16">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight">{t('landing.tech')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t('landing.techText')}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {TECH.map((item) => (
                <span
                  key={item.name}
                  className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_65%)]" />
          <div className="relative mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('landing.ctaTitle')}</h2>
            <p className="mt-4 text-muted-foreground">{t('landing.ctaText')}</p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link to={appHref}>
                  {t('landing.ctaAnalyze')}
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              S
            </span>
            <div className="text-sm">
              <p className="font-semibold">{t('common.appName')}</p>
              <p className="text-muted-foreground">{t('landing.footerText')}</p>
            </div>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <span>{t('landing.product')}</span>
            <span>{t('landing.privacy')}</span>
            <span>{t('landing.terms')}</span>
          </nav>
          <p className="text-xs text-muted-foreground">© {CURRENT_YEAR} SkillScope. {t('landing.rights')}</p>
        </div>
        <p className="mx-auto mt-6 max-w-3xl px-4 text-center text-[11px] text-muted-foreground">
          {t('landing.disclaimer')}
        </p>
      </footer>
    </div>
  );
}
