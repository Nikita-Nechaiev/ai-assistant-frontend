import { IconType } from 'react-icons';

import { AppRolesEnum, NotificationStatusEnum } from './enums';
import { InvitationStatusEnum } from './enums';
import { PermissionEnum } from './enums';

export interface IUser {
  id: number;
  name: string;
  email: string;
  oauthProvider: string | null;
  oauthId: string | null;
  roles: AppRolesEnum[];
  createdAt: Date;
  avatar: string;
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

export interface IDocument {
  id: number;
  title: string;
  richContent: string;
  lastUpdated: Date;
  createdAt: Date;
}

export interface IInvitation {
  id: number;
  role: PermissionEnum;
  invitationStatus: InvitationStatusEnum;
  notificationStatus: NotificationStatusEnum;
  date: string;
  expiresAt: string;
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
  richContent: string;
  createdAt: Date;
  userEmail: string;
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
  Icon?: IconType;
}
