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
  userNames?: Record<string, string>;
  onRowClick: (reminder: Reminder) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (reminder: Reminder) => void;
}

export function RemindersTable({
  reminders,
  spaces,
  userNames,
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
          <Badge className="border-amber-200 bg-amber-100 text-amber-800">
            En attente
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge className="border-green-200 bg-green-100 text-green-800">
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
            <TableHead>Espace du rappel</TableHead>
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
              className="hover:bg-muted/50 hover:shadow-primary/15 hover:border-primary/30 relative cursor-pointer transition-all duration-200 hover:z-10 hover:shadow-lg"
              onClick={() => onRowClick(reminder)}
            >
              <TableCell>
                <div className="flex max-w-xs items-start gap-2">
                  <Bell className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p className="line-clamp-2 font-medium">{reminder.message}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="text-muted-foreground h-3 w-3" />
                  <div>
                    <p className="font-medium">
                      {getSpaceName(reminder.target_space_id)}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <User className="text-muted-foreground h-3 w-3" />
                  <span className="text-sm">
                    {userNames?.[reminder.user_id] ?? 'Utilisateur'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm">{formatDate(reminder.remind_at)}</p>
                  <p className="text-muted-foreground text-xs">
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
                      <Eye className="mr-2 h-4 w-4" />
                      Voir les détails
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        onEdit(reminder);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
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
                      <Trash2 className="mr-2 h-4 w-4" />
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
