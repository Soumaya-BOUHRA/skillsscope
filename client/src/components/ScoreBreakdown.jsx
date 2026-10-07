import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

export default function ScoreBreakdown({ parts = [], title, description }) {
  if (!parts.length) return null;

  const total = parts.reduce((sum, p) => sum + p.score, 0);
  const max = parts.reduce((sum, p) => sum + p.max, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
          </div>
          <span className="text-2xl font-semibold">
            {Math.round(total)}
            <span className="text-sm font-normal text-muted-foreground"> / {max}</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {parts.map((part, index) => {
          const percent = part.max ? (part.score / part.max) * 100 : 0;
          return (
            <motion.div
              key={part.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  {part.label}
                  <span className="text-muted-foreground">({part.weight}%)</span>
                  {part.details?.length ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-start">
                        <ul className="list-disc ps-4">
                          {part.details.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {part.score}/{part.max}
                </span>
              </div>
              <Progress value={percent} />
              {part.details?.length ? (
                <ul className="space-y-1 ps-1 text-xs text-muted-foreground">
                  {part.details.slice(0, 3).map((d) => (
                    <li key={d} className="flex gap-1.5">
                      <span aria-hidden>•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
