export interface AuditLogEntry {
  id: string;
  timestamp: string;
  type: 'FIX' | 'ENHANCEMENT' | 'REVERT' | 'UPDATE' | 'LINTER' | 'CLEANUP';
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  user: string;
  fallout?: string;
  changes: string[];
  impact: string;
  featureGroup?: string; // Links to FeatureGroup
}

export interface FeatureGroup {
  id: string;
  name: string;
  rootCause: string;
  relatedChanges: string[]; // Array of AuditLogEntry IDs
  status: 'in-progress' | 'completed' | 'reverted';
  startDate: string;
  endDate?: string;
}
