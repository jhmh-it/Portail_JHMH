'use client';

import {
  AlertCircle,
  Check,
  Copy,
  FileText,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import type { GregDocument } from '@/types/greg';

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
          className="font-medium text-foreground group-hover:text-primary transition-colors cursor-pointer flex items-center gap-2"
          onClick={handleCopy}
        >
          <span>{document.spreadsheet_name}</span>
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
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
    <div className="flex gap-1 flex-wrap">
      {categoryList.slice(0, 3).map((category, index) => (
        <Badge key={index} variant="secondary" className="text-xs">
          {category}
        </Badge>
      ))}
      {categoryList.length > 3 && (
        <Badge variant="outline" className="text-xs">
          +{categoryList.length - 3}
        </Badge>
      )}
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
      loadingDescription: `Récupération des détails pour ${document.spreadsheet_name}...`,
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
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
        <p className="text-muted-foreground text-center">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton pour la table */}
        <div className="border rounded-lg overflow-hidden">
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
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucun document trouvé</h3>
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
          'border rounded-lg overflow-hidden transition-opacity',
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
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="relative">
            {data.data.map((document: GregDocument) => (
              <TableRow
                key={document.id}
                className="cursor-pointer relative transition-all duration-200 hover:bg-muted/50 hover:shadow-lg hover:shadow-primary/15 hover:border-primary/30 hover:z-10"
                onClick={() => handleDocumentClick(document)}
              >
                <TableCell>
                  <CopyableDocumentName document={document} />
                </TableCell>
                <TableCell className="text-sm">{document.sheet_name}</TableCell>
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
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        onEdit?.(document);
                      }}
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        onDelete?.(document);
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-4 items-center">
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

          <div className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages} ({data?.total ?? 0} document
            {(data?.total ?? 0) > 1 ? 's' : ''})
          </div>
        </div>
      )}
    </div>
  );
}
