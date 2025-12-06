export interface MessageAction {
  type: 'BUTTON' | 'SELECT';
  options?: { label: string; value: string; style?: 'primary' | 'secondary' }[];
  placeholder?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  action?: MessageAction;
}

export interface AnalysisResult {
  sql: string;
  suggestions: string[];
}

export enum WorkflowStage {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  REVIEW = 'REVIEW',
  FORMAT_SELECT = 'FORMAT_SELECT',
  GENERATING = 'GENERATING',
  DONE = 'DONE',
}

export type DatabaseDialect = 'PostgreSQL' | 'MySQL' | 'SQLite' | 'SQL Server' | 'MongoDB' | 'Prisma';