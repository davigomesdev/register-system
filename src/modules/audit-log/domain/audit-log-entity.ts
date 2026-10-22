import type { UserEntity } from '#src/modules/user/domain/user-entity.js';
import type { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import type { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import type { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { Entity } from '#src/domain/entities/entity.js';

type CreateAuditLogProps = {
  actorId?: bigint | null;
  resourceId?: bigint | null;
  actorType: ActorTypeEnum;
  action: AuditLogActionEnum;
  resource: AuditLogResourceEnum;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: Date;
  actor?: UserEntity | null;
};

export class AuditLogEntity extends Entity<CreateAuditLogProps> {
  public constructor(props: CreateAuditLogProps, id?: bigint) {
    super(props, id);

    this.props.actorId = this.props.actorId ?? null;
    this.props.resourceId = this.props.resourceId ?? null;
    this.props.before = this.props.before ?? null;
    this.props.after = this.props.after ?? null;
    this.props.ipAddress = this.props.ipAddress || null;
    this.props.userAgent = this.props.userAgent || null;
    this.props.metadata = this.props.metadata ?? null;
    this.props.createdAt = this.props.createdAt ?? new Date();
    this.props.actor = this.props.actor ?? null;
  }

  public get actorId(): bigint | null {
    return this.props.actorId ?? null;
  }

  public get resourceId(): bigint | null {
    return this.props.resourceId ?? null;
  }

  public get actorType(): ActorTypeEnum {
    return this.props.actorType;
  }

  public get action(): AuditLogActionEnum {
    return this.props.action;
  }

  public get resource(): AuditLogResourceEnum {
    return this.props.resource;
  }

  public get before(): Record<string, unknown> | null {
    return this.props.before ?? null;
  }

  public get after(): Record<string, unknown> | null {
    return this.props.after ?? null;
  }

  public get ipAddress(): string | null {
    return this.props.ipAddress ?? null;
  }

  public get userAgent(): string | null {
    return this.props.userAgent ?? null;
  }

  public get metadata(): Record<string, unknown> | null {
    return this.props.metadata ?? null;
  }

  public get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  public get actor(): UserEntity | null {
    return this.props.actor ?? null;
  }
}
