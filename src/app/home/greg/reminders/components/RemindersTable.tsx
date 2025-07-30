'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Bell,
  User,
  MapPin,
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

interface Reminder {
  id: string;
  message: string;
  user_id: string;
  source_space_id?: string;
  target_space_id: string;
  status: string;
  remind_at: string;
  created_at: string;
  updated_at: string;
}

interface Space {
  space_id: string;
  space_name: string;
  type: string;
}

interface Props {
  reminders: Reminder[];
  spaces: Space[];
  onRowClick: (reminder: Reminder) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (reminder: Reminder) => void;
}

export function RemindersTable({
  reminders,
  spaces,
  onRowClick,
  onEdit,
  onDelete,
}: Props) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: fr });
  };

  const getSpaceName = (spaceId: string) => {
    const space = spaces.find(s => s.space_id === spaceId);
    return space?.space_name ?? 'Inconnu';
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            En attente
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Terminé
          </Badge>
        );
      case 'CANCELLED':
        return <Badge variant="secondary">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Message</TableHead>
            <TableHead>Espace cible</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Date de rappel</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reminders.map(reminder => (
            <TableRow
              key={reminder.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(reminder)}
            >
              <TableCell>
                <div className="flex items-start gap-2 max-w-xs">
                  <Bell className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="font-medium line-clamp-2">{reminder.message}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {getSpaceName(reminder.target_space_id)}
                    </p>
                    {reminder.source_space_id && (
                      <p className="text-xs text-muted-foreground">
                        depuis {getSpaceName(reminder.source_space_id)}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-xs">{reminder.user_id}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm">{formatDate(reminder.remind_at)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(reminder.remind_at)}
                  </p>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(reminder.status)}</TableCell>
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
                        onRowClick(reminder);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir les détails
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        onEdit(reminder);
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
                        onDelete(reminder);
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
