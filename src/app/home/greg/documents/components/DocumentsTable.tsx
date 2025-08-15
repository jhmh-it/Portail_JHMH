'use client';

import {
  AlertCircle,
  Check,
  Copy,
  FileText,
  Pencil,
  Trash2,
  MoreVertical,
  Eye,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNavigation } from '@/hooks/useNavigation';
import { cn } from '@/lib/utils';

import type { GregDocument } from '../../types';

// Composant pour le nom du document avec tooltip et copie
function CopyableDocumentName({ document }: { document: GregDocument }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(document.id);
      setCopied(true);
      toast.success('ID copié dans le presse-papiers', {
        style: {
          color: '#16a34a', // text-green-600
          borderColor: '#16a34a',
        },
      });

      // Reset l'état après 2 secondes
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      toast.error('Erreur lors de la copie');
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="text-foreground group-hover:text-primary flex cursor-pointer items-center gap-2 font-medium transition-colors"
          onClick={handleCopy}
        >
          <span>{document.title ?? document.spreadsheet_name}</span>
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs">
          <div className="font-mono">{document.id}</div>
          <div className="text-muted-foreground mt-1">Cliquer pour copier</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Fonction pour parser et afficher les catégories
function DocumentCategories({ categories }: { categories?: string }) {
  if (!categories) return null;

  const categoryList = categories
    .split(',')
    .map(cat => cat.trim())
    .filter(Boolean);

  if (categoryList.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {categoryList.map((category, index) => (
        <Badge
          key={`${category}-${index}`}
          variant="outline"
          className="rounded-full px-2 py-0.5 text-[11px]"
        >
          {category}
        </Badge>
      ))}
    </div>
  );
}

interface DocumentsTableProps {
  data:
    | {
        data: GregDocument[];
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
      }
    | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  filters: { q: string; page: number; page_size: number };
  onPageChange: (page: number) => void;
  onEdit: (document: GregDocument) => void;
  onDelete: (document: GregDocument) => void;
}

export function DocumentsTable({
  data,
  isLoading,
  isFetching,
  error,
  filters,
  onPageChange,
  onEdit,
  onDelete,
}: DocumentsTableProps) {
  const { navigateWithLoading } = useNavigation();

  const handleDocumentClick = async (document: GregDocument) => {
    await navigateWithLoading(`/home/greg/documents/${document.id}`, {
      loadingTitle: 'Chargement du document',
      loadingDescription: `Récupération des détails pour ${document.title ?? document.spreadsheet_name}...`,
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
        <p className="text-muted-foreground text-center">{error}</p>
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
                <TableHead>Document</TableHead>
                <TableHead>Feuille</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Catégories</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
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

  if (!data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">Aucun document trouvé</h3>
        <p className="text-muted-foreground text-center">
          {filters.q
            ? 'Aucun document ne correspond à votre recherche.'
            : 'Aucun document disponible.'}
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Nom</TableHead>
              <TableHead className="w-[20%]">Feuille</TableHead>
              <TableHead className="w-[100px]">Statut</TableHead>
              <TableHead className="w-[20%]">Catégories</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="relative">
            {Array.isArray(data?.data)
              ? data.data.map((document: GregDocument) => (
                  <TableRow
                    key={document.id}
                    className="hover:bg-muted/50 hover:shadow-primary/15 hover:border-primary/30 relative cursor-pointer transition-all duration-200 hover:z-10 hover:shadow-lg"
                    onClick={() => handleDocumentClick(document)}
                  >
                    <TableCell>
                      <CopyableDocumentName document={document} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {document.sheet_name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          document.pending_for_review ? 'secondary' : 'default'
                        }
                        className={cn(
                          document.pending_for_review
                            ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        )}
                      >
                        {document.pending_for_review ? 'En attente' : 'Validé'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DocumentCategories categories={document.categories} />
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
                              handleDocumentClick(document);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={e => {
                              e.stopPropagation();
                              onEdit?.(document);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive cursor-pointer"
                            onClick={e => {
                              e.stopPropagation();
                              onDelete?.(document);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              : []}
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
            Page {currentPage} sur {totalPages} ({data?.total ?? 0} document
            {(data?.total ?? 0) > 1 ? 's' : ''})
          </div>
        </div>
      )}
    </div>
  );
}
