'use client';

import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  User,
  Mail,
  Settings,
  Activity,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface GregUser {
  user_id: string;
  name: string;
  mail: string;
  custom_instruction?: string;
  frequence_utilisation?: number;
  rn?: number;
  source_prefere?: string;
  sources?: boolean;
  verbose?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Props {
  users: GregUser[];
  onRowClick: (user: GregUser) => void;
  onEdit: (user: GregUser) => void;
  onDelete: (user: GregUser) => void;
}

export function UsersTable({ users, onRowClick, onEdit, onDelete }: Props) {
  const getVerboseBadge = (verbose?: boolean) => {
    if (verbose === undefined)
      return <Badge variant="outline">Non défini</Badge>;
    return verbose ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        Activé
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
        Désactivé
      </Badge>
    );
  };

  const getSourceBadge = (source?: string) => {
    if (!source) return <Badge variant="outline">Non défini</Badge>;

    switch (source.toLowerCase()) {
      case 'web':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Web
          </Badge>
        );
      case 'mobile':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Mobile
          </Badge>
        );
      case 'api':
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            API
          </Badge>
        );
      default:
        return <Badge variant="outline">{source}</Badge>;
    }
  };

  const getActivityBadge = (frequency?: number) => {
    if (frequency === undefined)
      return <Badge variant="outline">Non défini</Badge>;

    if (frequency >= 80) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Très actif ({frequency}%)
        </Badge>
      );
    } else if (frequency >= 60) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Actif ({frequency}%)
        </Badge>
      );
    } else if (frequency >= 20) {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          Modéré ({frequency}%)
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          Faible ({frequency}%)
        </Badge>
      );
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Source préférée</TableHead>
            <TableHead>Fréquence</TableHead>
            <TableHead>Mode verbose</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow
              key={user.user_id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(user)}
            >
              <TableCell>
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {user.user_id}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{user.mail}</span>
                </div>
              </TableCell>
              <TableCell>{getSourceBadge(user.source_prefere)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-muted-foreground" />
                  {getActivityBadge(user.frequence_utilisation)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Settings className="h-3 w-3 text-muted-foreground" />
                  {getVerboseBadge(user.verbose)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer"
                      onClick={e => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        onRowClick(user);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir les détails
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        onEdit(user);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(user);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
