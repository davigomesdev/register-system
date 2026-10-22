import type { SessionEntity } from '../../domain/session-entity.js';

export type SessionOutput = {
  id: string;
  userId: string;
  familyId: string;
  parentId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  deviceInfo: string | null;
  lastUsedAt: Date;
  revokedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class SessionOutputMapper {
  public static toOutput(session: SessionEntity): SessionOutput {
    return {
      id: session.id.toString(),
      userId: session.userId.toString(),
      familyId: session.familyId.toString(),
      parentId: session.parentId?.toString() ?? null,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceInfo: session.deviceInfo,
      lastUsedAt: session.lastUsedAt,
      revokedAt: session.revokedAt,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
