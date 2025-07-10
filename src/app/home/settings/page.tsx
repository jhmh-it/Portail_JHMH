'use client';

import { User, Bell, Shield } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUser } from '@/hooks/useUser';

type SettingsSection = 'general' | 'notifications' | 'security';

interface SettingsNavItem {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const settingsNavigation: SettingsNavItem[] = [
  {
    id: 'general',
    label: 'Général',
    icon: User,
    description: 'Profil et informations personnelles',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Préférences de notifications',
  },
  {
    id: 'security',
    label: 'Sécurité',
    icon: Shield,
    description: 'Mot de passe et authentification',
  },
];

export default function SettingsPage() {
  const { data: user } = useUser();
  const [activeSection, setActiveSection] =
    React.useState<SettingsSection>('general');

  const breadcrumbs = [
    { label: 'Accueil', href: '/home' },
    { label: 'Paramètres' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings user={user} />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      default:
        return <GeneralSettings user={user} />;
    }
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6 py-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Paramètres
          </h1>
          <p className="text-muted-foreground">
            Gérez vos préférences et paramètres de compte.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation latérale */}
          <div className="lg:w-64 flex-shrink-0">
            <Card>
              <CardContent className="px-4">
                <nav className="flex flex-col gap-2 w-full">
                  {settingsNavigation.map(item => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? 'default' : 'ghost'}
                      className={`justify-start gap-3 h-auto p-3 whitespace-normal ${
                        activeSection === item.id
                          ? 'bg-navy text-white hover:bg-navy/90'
                          : 'text-navy hover:text-navy/80 hover:bg-navy/10'
                      }`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div className="flex flex-col items-start text-left w-full overflow-hidden">
                        <span className="font-medium w-full">{item.label}</span>
                        <span
                          className={`text-xs w-full leading-relaxed ${
                            activeSection === item.id
                              ? 'text-white/70'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {item.description}
                        </span>
                      </div>
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">{renderContent()}</div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function GeneralSettings({
  user,
}: {
  user:
    | { displayName?: string; email?: string; photoURL?: string }
    | null
    | undefined;
}) {
  const [displayName, setDisplayName] = React.useState(user?.displayName ?? '');
  const [email, setEmail] = React.useState(user?.email ?? '');

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-navy">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-navy/10 flex items-center justify-center">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="Avatar"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-navy" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm">
                Changer l&apos;avatar
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG ou GIF. Taille maximale de 2MB.
              </p>
            </div>
          </div>

          {/* Nom d'affichage */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="displayName">Nom d&apos;affichage</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Votre nom d'affichage"
            />
            <p className="text-xs text-muted-foreground">
              Ce nom sera affiché publiquement sur votre profil.
            </p>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Votre adresse email ne peut pas être modifiée.
            </p>
          </div>

          <div className="flex justify-end">
            <Button className="bg-navy text-white hover:bg-navy/90">
              Enregistrer les modifications
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(false);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-navy">
            Préférences de notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Notifications par email */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="email-notifications">
                Notifications par email
              </Label>
              <p className="text-sm text-muted-foreground">
                Recevez des notifications importantes par email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          {/* Notifications push */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="push-notifications">Notifications push</Label>
              <p className="text-sm text-muted-foreground">
                Recevez des notifications push dans votre navigateur
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>

          <div className="flex justify-end">
            <Button className="bg-navy text-white hover:bg-navy/90">
              Enregistrer les préférences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [showPasswordChange, setShowPasswordChange] = React.useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Authentification à deux facteurs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy">
            Authentification à deux facteurs (2FA)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="two-factor">Activer la 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Renforcez la sécurité de votre compte avec une authentification
                à deux facteurs
              </p>
            </div>
            <Switch
              id="two-factor"
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>

          {twoFactorEnabled && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-navy mb-2">
                Configuration de la 2FA
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Scannez le code QR avec votre application
                d&apos;authentification (Google Authenticator, Authy, etc.)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Afficher le code QR
                </Button>
                <Button variant="outline" size="sm">
                  Codes de récupération
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mot de passe */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy">Mot de passe</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label>Changer le mot de passe</Label>
              <p className="text-sm text-muted-foreground">
                Modifiez votre mot de passe pour renforcer la sécurité de votre
                compte
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
            >
              {showPasswordChange ? 'Annuler' : 'Changer'}
            </Button>
          </div>

          {showPasswordChange && (
            <div className="mt-4 p-4 bg-muted rounded-lg flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Votre mot de passe actuel"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Votre nouveau mot de passe"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-password">
                  Confirmer le nouveau mot de passe
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirmez votre nouveau mot de passe"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordChange(false)}
                >
                  Annuler
                </Button>
                <Button className="bg-navy text-white hover:bg-navy/90">
                  Mettre à jour le mot de passe
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions actives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy">Sessions actives</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Gérez les appareils connectés à votre compte
          </p>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-navy/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-navy" />
              </div>
              <div>
                <p className="text-sm font-medium">Session actuelle</p>
                <p className="text-xs text-muted-foreground">
                  Navigateur • Dernière activité : maintenant
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Actuelle
            </Button>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              Déconnecter tous les appareils
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
