'use client';

import { AlertCircle, Edit, Trash2, MoreVertical, Eye } from 'lucide-react';

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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigation } from '@/hooks/useNavigation';
import { cn } from '@/lib/utils';

import type { GregSpace, GregSpacesFilters } from '../../types';

// Fonction pour formater le type d'espace
const formatSpaceType = (type: string): string => {
  switch (type) {
    case 'ROOM':
      return 'Groupe';
    case 'DM':
      return 'DM';
    default:
      return type;
  }
};

interface SpacesTableProps {
  data:
    | {
        data: GregSpace[];
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
      }
    | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  _filters: GregSpacesFilters;
  onPageChange: (page: number) => void;
  _onPageSizeChange: (pageSize: string) => void;
  onEdit?: (space: GregSpace) => void;
  onDelete?: (space: GregSpace) => void;
}

export function SpacesTable({
  data,
  isLoading,
  isFetching,
  error,
  _filters,
  onPageChange,
  _onPageSizeChange,
  onEdit,
  onDelete,
}: SpacesTableProps) {
  const { navigateWithLoading } = useNavigation();

  const handleSpaceClick = async (space: GregSpace) => {
    // Extraire l'ID sans le préfixe "spaces/"
    const id = (space.space_id ?? '').replace('spaces/', '');
    await navigateWithLoading(`/home/greg/spaces/${id}`, {
      loadingTitle: "Chargement de l'espace",
      loadingDescription: `Récupération des détails pour ${space.space_name}...`,
    });
  };

  // Logique de pagination similaire aux autres tables
  const currentPage = data?.page ?? 1;
  const totalPages = data?.total_pages ?? 1;

  // Générer les éléments de pagination
  const generatePaginationItems = () => {
    const items: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Si peu de pages, afficher toutes
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Logique plus complexe pour beaucoup de pages
      if (currentPage <= 3) {
        items.push(1, 2, 3, 4, 'ellipsis', totalPages);
      } else if (currentPage >= totalPages - 2) {
        items.push(
          1,
          'ellipsis',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        items.push(
          1,
          'ellipsis',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          'ellipsis',
          totalPages
        );
      }
    }

    return items;
  };

  const paginationItems = generatePaginationItems();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="text-destructive mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">Erreur de chargement</h3>
        <p className="text-muted-foreground text-center">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton pour la table */}
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Espace</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">Aucun espace trouvé</h3>
        <p className="text-muted-foreground text-center">
          Aucun espace ne correspond aux critères de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div
        className={cn(
          'overflow-hidden rounded-lg border transition-opacity',
          isFetching && 'opacity-50'
        )}
      >
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead className="w-[30%]">Nom</TableHead>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead className="w-[15%]">Notes</TableHead>
              <TableHead className="w-[120px] -translate-x-4 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="relative">
            {data.data.map(space => {
              return (
                <TableRow
                  key={space.space_id}
                  className="hover:bg-muted/50 hover:shadow-primary/15 hover:border-primary/30 relative cursor-pointer transition-all duration-200 hover:z-10 hover:shadow-lg"
                  onClick={() => handleSpaceClick(space)}
                >
                  <TableCell className="pr-2 font-mono text-xs">
                    {space.space_id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {space.space_name}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatSpaceType(space.type ?? 'UNKNOWN')}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <span
                      title={space.description ?? 'Aucune description'}
                      className="block break-words"
                    >
                      {space.description ?? '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
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
                            handleSpaceClick(space);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Voir les détails
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={e => {
                            e.stopPropagation();
                            onEdit?.(space);
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
                            onDelete?.(space);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    currentPage > 1 && onPageChange(currentPage - 1)
                  }
                  className={
                    currentPage === 1 || isFetching
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>

              {paginationItems.map((item, index) => (
                <PaginationItem key={index}>
                  {typeof item === 'number' ? (
                    <PaginationLink
                      onClick={() => onPageChange(item)}
                      isActive={currentPage === item}
                      className="cursor-pointer"
                    >
                      {item}
                    </PaginationLink>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    currentPage < totalPages && onPageChange(currentPage + 1)
                  }
                  className={
                    currentPage === totalPages || isFetching
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <div className="text-muted-foreground text-sm">
            Page {currentPage} sur {totalPages} ({data?.total ?? 0} espace
            {(data?.total ?? 0) > 1 ? 's' : ''})
          </div>
        </div>
      )}
    </div>
  );
}
