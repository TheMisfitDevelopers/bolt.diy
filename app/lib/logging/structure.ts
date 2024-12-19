export interface AuditLogEntry {
  id: string;
  timestamp: string;
  type: 'FIX' | 'ENHANCEMENT' | 'REVERT' | 'UPDATE' | 'LINTER' | 'CLEANUP';
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  user: string;
  fallout?: string;
  changes: string[];
  impact: string;
  rootCause?: {
    description: string;
    relatedChanges: string[]; // IDs of related changes
  };
}
