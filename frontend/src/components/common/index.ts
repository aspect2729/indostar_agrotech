/**
 * Common components exports
 */

export { default as ProtectedRoute } from './ProtectedRoute';
export { default as ErrorMessage } from './ErrorMessage';
export type { ErrorMessageProps } from './ErrorMessage';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as RetryButton } from './RetryButton';
export type { RetryButtonProps } from './RetryButton';
export { default as EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';
export { default as FormField } from './FormField';
export { default as OfflineIndicator } from './OfflineIndicator';
export { ResponsiveImage } from './ResponsiveImage';

// Skeleton components
export {
  Skeleton,
  ProductCardSkeleton,
  OrderCardSkeleton,
  ProductListSkeleton,
  OrderListSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  TextBlockSkeleton,
} from './Skeleton';
export type { SkeletonProps } from './Skeleton';

// Loading indicators
export {
  Spinner,
  LoadingOverlay,
  ProgressBar,
  InlineLoader,
  DotsLoader,
  ButtonLoader,
} from './LoadingIndicator';
export type {
  SpinnerProps,
  LoadingOverlayProps,
  ProgressBarProps,
  InlineLoaderProps,
  DotsLoaderProps,
  ButtonLoaderProps,
} from './LoadingIndicator';
