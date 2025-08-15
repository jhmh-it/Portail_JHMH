/**
 * Unified Types for Tool Cards across all dashboard pages
 * Used by: Home, Exploitation, Accounting, Greg pages
 */

import type { LucideIcon } from 'lucide-react';

/**
 * Base Tool Definition - Used across all tool pages
 */
export interface Tool {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Description of the tool */
  description: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Navigation href */
  href: string;
  /** Whether the tool is available */
  available: boolean;
  /** Optional badge (e.g., "New", "Beta") */
  badge?: string;
  /** Optional gradient for special styling */
  gradient?: string;
  /** Optional color theme */
  color?: 'default' | 'primary' | 'secondary';
}

/**
 * Tool Grid Props - Shared across all pages
 */
export interface ToolGridProps {
  tools: readonly Tool[];
  onToolClick?: (tool: Tool) => void;
  isLoading?: boolean;
  className?: string;
  /** Optional title for the grid section */
  title?: string;
  /** Per-card loading state function */
  isToolLoading?: (toolId: string) => boolean;
}

/**
 * Tool Card Props
 */
export interface ToolCardProps {
  tool: Tool;
  onToolClick?: (tool: Tool) => void;
  /** Loading state for this specific card/button */
  isLoading?: boolean;
  /** Enable click on entire card */
  cardClickable?: boolean;
}
