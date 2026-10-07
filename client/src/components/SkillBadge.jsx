import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const levelVariant = {
  expert: 'default',
  advanced: 'default',
  intermediate: 'secondary',
  beginner: 'outline',
};

export default function SkillBadge({ skill, className }) {
  const name = typeof skill === 'string' ? skill : skill?.name;
  const level = typeof skill === 'object' ? skill?.level : null;
  const category = typeof skill === 'object' ? skill?.category : null;

  if (!name) return null;

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <Badge variant="outline" className="rounded-md px-2 py-1 text-xs font-medium">
        {name}
      </Badge>
      {level ? (
        <Badge variant={levelVariant[level] || 'secondary'} className="text-[10px] uppercase tracking-wide">
          {level}
        </Badge>
      ) : null}
      {category && category !== 'general' ? (
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{category}</span>
      ) : null}
    </span>
  );
}
