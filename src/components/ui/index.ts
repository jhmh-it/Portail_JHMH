/**
 * UI Components Barrel Export
 * Centralized exports for all UI components including the new skeleton system
 */

// Enhanced Skeleton System
export * from './enhanced-skeleton';
export * from './skeleton-templates';

// Base UI Components (add more as needed)
export { Skeleton } from './skeleton';
export {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from './card';
export { Button } from './button';
export { Badge } from './badge';
export { Avatar, AvatarImage, AvatarFallback } from './avatar';
export { Input } from './input';
export { Label } from './label';
export { Separator } from './separator';
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

// Loading Modal
export { LoadingModal } from './loading-modal';
