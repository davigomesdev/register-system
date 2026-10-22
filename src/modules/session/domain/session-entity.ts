import { Entity } from '#src/domain/entities/entity.js';

export const REFRESH_TOKEN_EXPIRY_DAYS: number = 7;

type CreateSessionProps = {
  userId: bigint;
  familyId?: bigint;
  parentId?: bigint | null;
  refreshTokenHash: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceInfo?: string | null;
  lastUsedAt?: Date;
  revokedAt?: Date | null;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export class SessionEntity extends Entity<CreateSessionProps> {
  public constructor(props: CreateSessionProps, id?: bigint) {
    super(props, id);
    const now: Date = new Date();

    this.props.familyId = this.props.familyId ?? this.id;
    this.props.parentId = this.props.parentId ?? null;
    this.props.ipAddress = this.props.ipAddress ?? null;
    this.props.userAgent = this.props.userAgent ?? null;
    this.props.deviceInfo = this.props.deviceInfo ?? null;
    this.props.lastUsedAt = this.props.lastUsedAt ?? now;
    this.props.revokedAt = this.props.revokedAt ?? null;
    this.props.expiresAt = this.props.expiresAt ?? new Date(now.getTime() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    this.props.createdAt = this.props.createdAt ?? now;
    this.props.updatedAt = this.props.updatedAt ?? now;
  }

  public get userId(): bigint {
    return this.props.userId;
  }

  public get familyId(): bigint {
    return this.props.familyId ?? this.id;
  }

  public get parentId(): bigint | null {
    return this.props.parentId ?? null;
  }

  public get refreshTokenHash(): string {
    return this.props.refreshTokenHash;
  }

  public get ipAddress(): string | null {
    return this.props.ipAddress ?? null;
  }

  public get userAgent(): string | null {
    return this.props.userAgent ?? null;
  }

  public get deviceInfo(): string | null {
    return this.props.deviceInfo ?? null;
  }

  public get lastUsedAt(): Date {
    return this.props.lastUsedAt ?? new Date();
  }

  public get revokedAt(): Date | null {
    return this.props.revokedAt ?? null;
  }

  public get expiresAt(): Date {
    return this.props.expiresAt ?? new Date();
  }

  public get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  public get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  public override toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      ...this.props,
      userId: this.userId.toString(),
      familyId: this.familyId.toString(),
      parentId: this.parentId?.toString() ?? null,
      refreshTokenHash: '********',
    };
  }

  public isActive(): boolean {
    return this.revokedAt === null && this.expiresAt.getTime() > Date.now();
  }

  public revoke(): SessionEntity {
    const now: Date = new Date();

    this.props.revokedAt = now;
    this.props.updatedAt = now;

    return this;
  }

  public static fromParent(parent: SessionEntity, refreshTokenHash: string): SessionEntity {
    return new SessionEntity({
      userId: parent.userId,
      familyId: parent.familyId,
      parentId: parent.id,
      refreshTokenHash,
      ipAddress: parent.ipAddress,
      userAgent: parent.userAgent,
      deviceInfo: parent.deviceInfo,
    });
  }
}
