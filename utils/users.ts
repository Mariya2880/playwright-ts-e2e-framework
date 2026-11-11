/**
 * Sauce Demo ships with purpose-built accounts that simulate specific behaviours.
 * Centralising them keeps magic strings out of specs.
 */
export const users = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
  problem: 'problem_user',
  performanceGlitch: 'performance_glitch_user',
  error: 'error_user',
  visual: 'visual_user',
} as const;

export type UserKey = keyof typeof users;
