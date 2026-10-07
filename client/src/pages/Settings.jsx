import { format } from 'date-fns';
import { Globe, Monitor, Moon, ShieldCheck, Sun, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, LANGUAGES } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { user } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();

  const themes = [
    { key: 'light', label: t('settings.themeLight'), icon: Sun },
    { key: 'dark', label: t('settings.themeDark'), icon: Moon },
    { key: 'system', label: t('settings.themeSystem'), icon: Monitor },
  ];

  const initials = (user?.name || '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" />
            {t('settings.account')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('settings.memberSince', {
                date: user?.createdAt ? format(new Date(user.createdAt), 'PP') : '—',
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-primary" />
            {t('settings.language')}
          </CardTitle>
          <CardDescription>{t('settings.languageHint')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => setLang(language.code)}
              className={cn(
                'flex items-center justify-between rounded-lg border p-4 text-start text-sm transition-colors',
                lang === language.code
                  ? 'border-primary bg-primary/5 font-medium'
                  : 'hover:bg-accent'
              )}
            >
              {language.label}
              <Badge variant={lang === language.code ? 'default' : 'outline'}>{language.dir.toUpperCase()}</Badge>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sun className="h-4 w-4 text-primary" />
            {t('settings.theme')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {themes.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTheme(item.key)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg border p-4 text-sm transition-colors',
                theme === item.key ? 'border-primary bg-primary/5 font-medium' : 'hover:bg-accent'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-start gap-3 p-5 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          {t('settings.securityNote')}
        </CardContent>
      </Card>
    </div>
  );
}
