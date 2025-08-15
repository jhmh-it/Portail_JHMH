/**
 * Composant pour afficher une carte d'outil accounting
 */

import { ArrowRight, Calculator } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import type { AccountingTool } from '../types';

interface ToolCardProps {
  /** Données de l'outil à afficher */
  tool: AccountingTool;
  /** Composant d'icône à utiliser */
  IconComponent?: React.ComponentType<{ className?: string }>;
}

/**
 * Carte d'outil accounting avec animation et interaction
 */
export function ToolCard({ tool, IconComponent = Calculator }: ToolCardProps) {
  return (
    <Card className="group hover:border-navy/20 transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-1">
          <div className="bg-navy/10 group-hover:bg-navy/20 rounded-lg p-2 transition-colors">
            <IconComponent className="text-navy h-6 w-6" />
          </div>
          <CardTitle className="text-navy group-hover:text-navy/80 transition-colors">
            {tool.title}
          </CardTitle>
        </div>
        <CardDescription className="text-sm">
          {tool.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          asChild
          className="bg-navy hover:bg-navy/90 group-hover:bg-navy/80 w-full text-white transition-colors"
        >
          <Link
            href={tool.url}
            className="flex items-center justify-center gap-2"
          >
            Accéder
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
