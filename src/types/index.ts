import type { ReactNode } from 'react';

/**
 * Shared, app-wide TypeScript types.
 *
 * Domain models (menu items, user profile, etc.) will be added here in later
 * phases as the application grows. For now this holds only cross-cutting helpers
 * used by the foundational components.
 */

/** Props for components that render arbitrary children. */
export interface WithChildren {
  children: ReactNode;
}

/** Common optional test identifier used across reusable components. */
export interface Testable {
  testID?: string;
}

export * from './cart';
export * from './menu';
export * from './profile';
