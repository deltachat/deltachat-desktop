// moved from shared/shared-types because only used by frontend.
// TODO: find a better place than this file for those types

export type msgStatus =
  | 'error'
  | 'sending'
  | 'draft'
  | 'delivered'
  | 'read'
  | 'in_fresh'
  | 'in_seen'
  | 'in_noticed'
  | ''
