import { SessionEntity } from '../domain/session-entity.js';

export type SessionRow = {
  id: string;
  user_id: string;
  family_id: string;
  parent_id: string | null;
  refresh_token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  device_info: string | null;
  last_used_at: Date;
  revoked_at: Date | null;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
};

export class SessionModel {
  public static toEntity(row: SessionRow): SessionEntity {
    return new SessionEntity(
      {
        userId: BigInt(row.user_id),
        familyId: BigInt(row.family_id),
        parentId: row.parent_id === null ? null : BigInt(row.parent_id),
        refreshTokenHash: row.refresh_token_hash,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        deviceInfo: row.device_info,
        lastUsedAt: row.last_used_at,
        revokedAt: row.revoked_at,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      BigInt(row.id),
    );
  }
}
