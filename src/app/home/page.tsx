'use client';

import { Calculator, Users, BookOpen, Bot, ArrowRight } from 'lucide-react';
import * as React from 'react';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';

export default function DashboardPage() {
  const { data: user, isLoading: isLoadingUser } = useUser();

  const breadcrumbs = [{ label: 'Accueil' }];

  const tools = [
    {
      title: 'Accounting Tool',
      description: 'Outil de gestion comptable et financière',
      icon: Calculator,
      href: '/home/accounting',
      available: true, // Maintenant disponible
    },
    {
      title: 'Exploitation',
      description: "Outils d'analyse et de gestion de l'exploitation",
      icon: BookOpen,
      href: '/home/exploitation',
      available: true, // Maintenant disponible
    },
    {
      title: 'Greg',
      description: "Système de gestion d'espaces, documents et workflows",
      icon: Bot,
      href: '/home/greg',
      available: true, // Maintenant disponible
    },
    {
      title: 'RM Tool',
      description: 'Outil de gestion des relations clients',
      icon: Users,
      href: '/home/rm',
      available: false, // Pour l'instant pas encore disponible
    },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="my-6">
        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          {isLoadingUser ? (
            <>
              <div className="h-9 bg-gray-200 rounded animate-pulse w-64 mb-2" />
              <div className="h-5 bg-gray-200 rounded animate-pulse w-96" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-navy">
                Bonjour, {user?.displayName?.split(' ')[0] ?? 'Utilisateur'} 👋
              </h1>
              <p className="text-muted-foreground">
                Accédez aux outils internes de l&apos;entreprise depuis votre
                portail d&apos;accueil.
              </p>
            </>
          )}
        </div>

        {/* Tools Section */}
        <div className="mt-8 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-navy">
            Outils disponibles
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools.map(tool => (
              <Card
                key={tool.title}
                className="relative hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center gap-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/10">
                      <tool.icon className="h-5 w-5 text-navy" />
                    </div>
                    <CardTitle className="text-navy">{tool.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-navy text-white hover:bg-navy/90"
                    disabled={!tool.available}
                    variant={tool.available ? 'default' : 'outline'}
                    asChild={tool.available}
                  >
                    {tool.available ? (
                      <a
                        href={tool.href}
                        className="flex items-center justify-center gap-2"
                      >
                        Accéder
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    ) : (
                      <span>Bientôt disponible</span>
                    )}
                  </Button>
                </CardContent>
                {!tool.available && (
                  <div className="absolute inset-0 bg-background/50 rounded-lg" />
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
