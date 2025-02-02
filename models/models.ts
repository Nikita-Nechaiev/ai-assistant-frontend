import { IconType } from 'react-icons';
import { AppRolesEnum, NotificationStatusEnum } from './enums';
import { InvitationStatusEnum } from './enums';
import { PermissionEnum } from './enums';
import { ThemeEnum } from './enums';

export interface IUser {
  id: number;
  name: string;
  email: string;
  oauthProvider: string | null;
  oauthId: string | null;
  roles: AppRolesEnum[];
  createdAt: Date;
  avatar: string;
  userCollaborationSessions?: IUserCollaborationSession[];
  aiToolUsages?: IAiToolUsage[];
  settings?: ISettings;
  analyticsSummary?: IAnalyticsSummary;
  invitations?: IInvitation[];
}

export interface IUserCollaborationSession {
  id: number;
  user: ICollaborator;
  session: ICollaborationSession;
  permissions: PermissionEnum[];
  timeSpent: number;
  lastInteracted: number;
}

export interface ICollaborationSession {
  id: number;
  name: string;
  createdAt: Date;

  documents: IDocument[];
  messages: IMessage[];
  userCollaborationSessions: IUserCollaborationSession[];
  invitations: IInvitation[];
}

export interface ICollaborator {
  id: number;
  name: string;
  email: string;
  avatar: string;
  permissions: PermissionEnum[];
}

export interface ISessionItem {
  id: number;
  name: string;
  lastInteracted: Date;
  createdAt: Date;
  collaborators: ICollaborator[];
}

export interface ISettings {
  id: number;
  autoSave: boolean;
  soundNotifications: boolean;
  theme: ThemeEnum;
  animatedInput: boolean;
  preferredFont: string;
  fontSize: number;
  fontWeight: number;
}

export interface IDocument {
  id: number;
  title: string;
  content: string | null;
  richContent: Record<string, any> | null;
  readabilityScore: number | null;
  toneAnalysis: number | null;
  lastUpdated: Date;
  createdAt: Date;

  collaborationSession?: ICollaborationSession;
  aiToolUsages?: IAiToolUsage[];
  versions?: IVersion[];
}

export interface IInvitation {
  id: number;
  role: PermissionEnum;
  invitationStatus: InvitationStatusEnum;
  notificationStatus: NotificationStatusEnum;
  date: Date;
  expiresAt: Date | null;
  inviterEmail: string;
  receiver: IUser;

  session: ICollaborationSession;
}

export interface IMessage {
  id: number;
  text: string;
  sender: ICollaborator;
  collaborationSession: ICollaborationSession;
  createdAt: Date;
}

export interface IVersion {
  id: number;
  content: string;
  richContent: object | null;
  createdAt: Date;
  metadata: object | null;

  document: IDocument;
}

export interface IAnalyticsSummary {
  id: number;
  totalWordCount: number;
  totalSessions: number;
  totalDocuments: number;
  mostUsedAiTool: string | null;
  activeHours: number;

  user?: IUser;
}

export interface IAiToolUsage {
  id: number;
  toolName: string;
  sentText: string;
  result: string;
  timestamp: Date;

  user?: IUser;
  document?: IDocument | null;
}

export interface INavItem {
  href: string;
  label: string;
}

export interface AITool {
  id: string;
  name: string;
  endpoint: string;
  bodyField: string;
  requiresTargetLanguage?: boolean;
  Icon?: IconType; // <-- New optional property
}

/* ============================================================================================================================= */
/* ============================================================================================================================= */


export interface DocumentData {
  title: string;
  createdAt: Date;
  lastUpdated: Date;
  elements: DocumentElement[];
}

// Base interface for all elements in the document
export interface BaseElement {
  id: string;
  position: {
    x: number;
    y: number;
  };
  rotation?: number;
  zIndex?: number;
}

// Text Element
export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  style: TextStyle;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontStyle: 'normal' | 'italic';
  fontWeight: 'normal' | 'bold';
  textDecoration: 'none' | 'underline';
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

// Image Element
export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  dimensions: {
    width: number;
    height: number;
  };
  style?: ImageStyle;
}

export interface ImageStyle {
  opacity?: number;
  borderRadius?: number;
  border?: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
}

// Shape Element
export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line' | 'arrow';
  dimensions: {
    width: number;
    height: number;
  };
  style: ShapeStyle;
}

export interface ShapeStyle {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity?: number;
}

// Table Element
export interface TableElement extends BaseElement {
  type: 'table';
  rows: number;
  columns: number;
  data: string[][];
  style: TableStyle;
}

export interface TableStyle {
  borderColor: string;
  borderWidth: number;
  headerBackgroundColor?: string;
  cellPadding?: number;
}

// Unified Type for Document Elements
export type DocumentElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | TableElement;
