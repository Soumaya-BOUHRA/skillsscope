import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  History as HistoryIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings as SettingsIcon,
  Sun,
  Languages,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

function useNavItems() {
  const { t } = useLanguage();
  return [
    { to: '/app', end: true, label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/app/cvs', label: t('nav.myCvs'), icon: FileText },
    { to: '/app/upload', label: t('nav.analyze'), icon: BarChart3 },
    { to: '/app/matcher', label: t('nav.jobMatcher'), icon: BriefcaseBusiness },
    { to: '/app/careers', label: t('nav.careers'), icon: GraduationCap },
    { to: '/app/history', label: t('nav.history'), icon: HistoryIcon },
    { to: '/app/settings', label: t('nav.settings'), icon: SettingsIcon },
  ];
}

function NavLinks({ onNavigate, className }) {
  const items = useNavItems();
  return (
    <nav className={cn('flex flex-col gap-1', className)}>
      {items.map(({ to, end, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )
          }
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Brand() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2 px-3 py-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <span className="text-sm font-bold">S</span>
      </div>
      <span className="text-lg font-semibold tracking-tight">{t('common.appName')}</span>
    </div>
  );
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t, lang, setLang, languages } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const initials = (user?.name || '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 border-e bg-card lg:block">
        <div className="flex h-full flex-col">
          <Brand />
          <div className="flex-1 overflow-y-auto px-3">
            <NavLinks />
          </div>
          <div className="border-t p-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <LogOut />
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 start-0 w-72 border-e bg-card shadow-xl">
            <div className="flex items-center justify-between px-3">
              <Brand />
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label={t('nav.closeMenu')}>
                <X />
              </Button>
            </div>
            <div className="px-3 pb-6">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:ps-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={t('nav.openMenu')}
          >
            <Menu />
          </Button>

          <div className="ms-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('settings.language')}>
                  <Languages />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('settings.language')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((l) => (
                  <DropdownMenuItem key={l.code} onSelect={() => setLang(l.code)}>
                    <span className={cn('w-4', lang === l.code ? 'opacity-100' : 'opacity-0')}>✓</span>
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={t('settings.theme')}>
              {theme === 'dark' ? <Sun /> : <Moon />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/60">
                  <Avatar>
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate('/app/settings')}>
                  <SettingsIcon />
                  {t('nav.settings')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  <LogOut />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
