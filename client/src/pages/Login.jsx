import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Field } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) next.email = t('auth.email');
    if (form.password.length < 8) next.password = t('auth.passwordHint');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(form);
      toast.success(t('common.success'));
      navigate('/app');
    } catch (err) {
      setErrors(err.errors || {});
      toast.error(err.message || t('errors.generic'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
            S
          </div>
          <CardTitle className="text-2xl">{t('auth.loginTitle')}</CardTitle>
          <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field label={t('auth.email')} htmlFor="email" error={errors.email}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>

            <Field label={t('auth.password')} htmlFor="password" error={errors.password}>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pe-9"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              {submitting ? t('auth.loggingIn') : t('auth.loginCta')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              {t('auth.registerCta')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
