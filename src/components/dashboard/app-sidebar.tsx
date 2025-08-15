'use client';

import {
  Home,
  Calculator,
  Users,
  Settings,
  ChevronUp,
  ChevronDown,
  User2,
  LogOut,
  BookOpen,
  Bot,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { useAccountingTools } from '@/app/home/accounting/hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '@/hooks/useNavigation';
import { useUser } from '@/hooks/useUser';
import { useLoadingStore } from '@/stores/loading-store';

// Menu items pour la navigation principale
const data = {
  navMain: [
    {
      title: 'Accueil',
      url: '/home',
      icon: Home,
    },
  ],
  tools: [
    {
      title: 'Accounting Tool',
      url: '/home/accounting',
      icon: Calculator,
    },
    {
      title: 'Exploitation Information',
      url: '/home/exploitation',
      icon: BookOpen,
    },
    {
      title: 'Greg',
      url: '/home/greg',
      icon: Bot,
    },
    {
      title: 'RM Tool',
      url: '/home/rm',
      icon: Users,
    },
  ],
  navSecondary: [] as Array<{
    title: string;
    url: string;
    icon: React.ComponentType;
  }>,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { logout } = useAuth();
  const router = useRouter();
  const { navigateWithLoading } = useNavigation();
  const { showLoading: _showLoading } = useLoadingStore();
  const { accountingTools, isLoading: isLoadingAccountingTools } =
    useAccountingTools();
  const [expandedAccountingTool, setExpandedAccountingTool] =
    React.useState(false);
  const [expandedExploitationTool, setExpandedExploitationTool] =
    React.useState(false);
  const [expandedGregTool, setExpandedGregTool] = React.useState(false);
  const [clickTimeout, setClickTimeout] = React.useState<NodeJS.Timeout | null>(
    null
  );
  const [exploitationClickTimeout, setExploitationClickTimeout] =
    React.useState<NodeJS.Timeout | null>(null);
  const [gregClickTimeout, setGregClickTimeout] =
    React.useState<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleSettings = () => {
    router.push('/home/settings');
  };

  const handleAccountingToolClick = () => {
    // Si un timeout existe déjà, c'est un double clic
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      // Double clic : rediriger vers la page principale
      router.push('/home/accounting');
      return;
    }

    // Premier clic : démarrer le timeout pour détecter un éventuel double clic
    const timeout = setTimeout(() => {
      // Simple clic : toggle le dropdown
      setExpandedAccountingTool(prev => !prev);
      setClickTimeout(null);
    }, 250); // Délai de 250ms pour détecter le double clic

    setClickTimeout(timeout);
  };

  const handleExploitationToolClick = () => {
    // Si un timeout existe déjà, c'est un double clic
    if (exploitationClickTimeout) {
      clearTimeout(exploitationClickTimeout);
      setExploitationClickTimeout(null);
      // Double clic : rediriger vers la page principale
      router.push('/home/exploitation');
      return;
    }

    // Premier clic : démarrer le timeout pour détecter un éventuel double clic
    const timeout = setTimeout(() => {
      // Simple clic : toggle le dropdown
      setExpandedExploitationTool(prev => !prev);
      setExploitationClickTimeout(null);
    }, 250); // Délai de 250ms pour détecter le double clic

    setExploitationClickTimeout(timeout);
  };

  const handleGregToolClick = () => {
    // Si un timeout existe déjà, c'est un double clic
    if (gregClickTimeout) {
      clearTimeout(gregClickTimeout);
      setGregClickTimeout(null);
      // Double clic : rediriger vers la page principale
      router.push('/home/greg');
      return;
    }

    // Premier clic : démarrer le timeout pour détecter un éventuel double clic
    const timeout = setTimeout(() => {
      // Simple clic : toggle le dropdown
      setExpandedGregTool(prev => !prev);
      setGregClickTimeout(null);
    }, 250); // Délai de 250ms pour détecter le double clic

    setGregClickTimeout(timeout);
  };

  const handleGregSubPageClick = async (path: string, title: string) => {
    await navigateWithLoading(path, {
      loadingTitle: `Chargement de ${title}...`,
      loadingDescription:
        'Veuillez patienter pendant le chargement des données.',
      delay: 0,
    });
  };

  const handleReservationsClick = async () => {
    await navigateWithLoading('/home/exploitation/reservations', {
      loadingTitle: 'Chargement de Réservations...',
      loadingDescription:
        'Veuillez patienter pendant le chargement des données.',
      delay: 0,
    });
  };

  const handleActifsClick = async () => {
    await navigateWithLoading('/home/exploitation/actifs', {
      loadingTitle: 'Chargement des Actifs...',
      loadingDescription:
        'Veuillez patienter pendant le chargement des données.',
      delay: 0,
    });
  };

  const handleGuestsClick = async () => {
    await navigateWithLoading('/home/exploitation/guests', {
      loadingTitle: 'Chargement des Guests...',
      loadingDescription:
        'Veuillez patienter pendant le chargement des données.',
      delay: 0,
    });
  };

  // Nettoyer les timeouts au démontage du composant
  React.useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
      if (exploitationClickTimeout) {
        clearTimeout(exploitationClickTimeout);
      }
      if (gregClickTimeout) {
        clearTimeout(gregClickTimeout);
      }
    };
  }, [clickTimeout, exploitationClickTimeout, gregClickTimeout]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/home" className="flex items-center justify-center">
                <Image
                  src="/images/logo.webp"
                  alt="Logo JHMH"
                  width={100}
                  height={100}
                  style={{ width: 'auto', height: 'auto' }}
                  className="rounded"
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold text-black">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} asChild>
                    <a
                      href={item.url}
                      className="cursor-pointer text-black hover:text-black/80"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold text-black">
            Outils internes
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Accounting Tool avec sous-menus */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Accounting Tool"
                  onClick={handleAccountingToolClick}
                  className="cursor-pointer text-black hover:text-black/80"
                >
                  <Calculator />
                  <span>Accounting Tool</span>
                  {expandedAccountingTool ? (
                    <ChevronDown className="ml-auto h-4 w-4" />
                  ) : (
                    <ChevronUp className="ml-auto h-4 w-4" />
                  )}
                </SidebarMenuButton>

                {expandedAccountingTool && !isLoadingAccountingTools && (
                  <SidebarMenuSub>
                    {accountingTools.map(tool => (
                      <SidebarMenuSubItem key={tool.id}>
                        <SidebarMenuSubButton
                          asChild
                          className="hover:bg-muted/50 cursor-pointer text-black/70 transition-colors hover:text-black"
                        >
                          <a href={tool.href}>
                            <span>{tool.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Exploitation Information Tool avec sous-menus */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Exploitation Information"
                  onClick={handleExploitationToolClick}
                  className="cursor-pointer text-black hover:text-black/80"
                >
                  <BookOpen />
                  <span>Exploitation Information</span>
                  {expandedExploitationTool ? (
                    <ChevronDown className="ml-auto h-4 w-4" />
                  ) : (
                    <ChevronUp className="ml-auto h-4 w-4" />
                  )}
                </SidebarMenuButton>

                {expandedExploitationTool && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={handleReservationsClick}
                        className="hover:bg-muted/50 cursor-pointer text-black/70 transition-colors hover:text-black"
                      >
                        <span>Réservations</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={handleActifsClick}
                        className="hover:bg-muted/50 cursor-pointer text-black/70 transition-colors hover:text-black"
                      >
                        <span>Actifs</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={handleGuestsClick}
                        className="hover:bg-muted/50 cursor-pointer text-black/70 transition-colors hover:text-black"
                      >
                        <span>Guests</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Greg Tool avec sous-menus */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Greg"
                  onClick={handleGregToolClick}
                  className="cursor-pointer text-black hover:text-black/80"
                >
                  <Bot />
                  <span>Greg</span>
                  {expandedGregTool ? (
                    <ChevronDown className="ml-auto h-4 w-4" />
                  ) : (
                    <ChevronUp className="ml-auto h-4 w-4" />
                  )}
                </SidebarMenuButton>

                {expandedGregTool && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() =>
                          handleGregSubPageClick('/home/greg/spaces', 'Espaces')
                        }
                        className="hover:bg-muted/50 cursor-pointer text-black/70 transition-colors hover:text-black"
                      >
                        <span>Espaces</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() =>
                          handleGregSubPageClick(
                            '/home/greg/documents',
                            'Documents'
                          )
                        }
                        className="hover:bg-muted/50 cursor-pointer text-black/70 transition-colors hover:text-black"
                      >
                        <span>Documents</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() =>
                          handleGregSubPageClick(
                            '/home/greg/access',
                            'Gestion des accès'
                          )
                        }
                        className="hover:bg-muted/50 cursor-pointer text-black/70 transition-colors hover:text-black"
                      >
                        <span>Gestion des accès</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() =>
                          handleGregSubPageClick(
                            '/home/greg/users',
                            'Utilisateurs'
                          )
                        }
                        className="hover:bg-muted/50 cursor-pointer text-black/70 transition-colors hover:text-black"
                      >
                        <span>Utilisateurs</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() =>
                          handleGregSubPageClick('/home/greg/shifts', 'Shifts')
                        }
                        className="hover:bg-muted/50 cursor-pointer text-black/70 transition-colors hover:text-black"
                      >
                        <span>Shifts</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() =>
                          handleGregSubPageClick(
                            '/home/greg/reminders',
                            'Rappels'
                          )
                        }
                        className="hover:bg-muted/50 cursor-pointer text-black/70 transition-colors hover:text-black"
                      >
                        <span>Rappels</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Autres outils restent statiques */}
              {data.tools
                .filter(
                  tool =>
                    tool.title !== 'Accounting Tool' &&
                    tool.title !== 'Exploitation Information' &&
                    tool.title !== 'Greg'
                )
                .map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton tooltip={item.title} asChild>
                      <a
                        href={item.url}
                        className="cursor-pointer text-black hover:text-black/80"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSecondary.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} asChild>
                    <a
                      href={item.url}
                      className="cursor-pointer text-black hover:text-black/80"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  disabled={isLoadingUser}
                >
                  {isLoadingUser ? (
                    <>
                      <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <div className="mb-1 h-4 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
                      </div>
                      <ChevronUp className="ml-auto size-4" />
                    </>
                  ) : (
                    <>
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={user?.photoURL ?? undefined}
                          alt={user?.displayName ?? 'User'}
                        />
                        <AvatarFallback className="rounded-lg">
                          {user?.displayName
                            ?.split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold text-black">
                          {user?.displayName ?? 'Utilisateur'}
                        </span>
                        <span className="text-muted-foreground truncate text-xs">
                          {user?.email}
                        </span>
                      </div>
                      <ChevronUp className="ml-auto size-4" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              {!isLoadingUser && (
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem className="cursor-pointer">
                    <User2 className="mr-2 h-4 w-4" />
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSettings}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
