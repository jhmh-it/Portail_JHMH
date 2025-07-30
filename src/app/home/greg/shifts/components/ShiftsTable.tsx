'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MoreVertical, Edit, Trash2, Eye, Clock, Calendar } from 'lucide-react';

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

interface Shift {
  id: string;
  space_id: string;
  content: string;
  start_time: string;
  end_time: string;
}

interface Space {
  space_id: string;
  space_name: string;
  type: string;
}

interface Props {
  shifts: Shift[];
  spaces: Space[];
  onRowClick: (shift: Shift) => void;
  onEdit: (shift: Shift) => void;
  onDelete: (shift: Shift) => void;
}

export function ShiftsTable({
  shifts,
  spaces,
  onRowClick,
  onEdit,
  onDelete,
}: Props) {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: fr });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
  };

  const getSpaceName = (spaceId: string) => {
    const space = spaces.find(s => s.space_id === spaceId);
    return space?.space_name ?? 'Inconnu';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Contenu</TableHead>
            <TableHead>Espace</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Horaires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.map(shift => (
            <TableRow
              key={shift.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(shift)}
            >
              <TableCell className="font-mono text-xs">{shift.id}</TableCell>
              <TableCell>
                <div className="font-medium">{shift.content}</div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{getSpaceName(shift.space_id)}</p>
                  <p className="text-xs text-muted-foreground">
                    {shift.space_id}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {formatDate(shift.start_time)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
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
                        onRowClick(shift);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir les détails
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        onEdit(shift);
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
                        onDelete(shift);
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
