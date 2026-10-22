import type { Context } from '#src/adapters/contexts/context.js';
import type { SessionOutput } from '../outputs/session-output.js';
import type { SessionEntity } from '../../domain/session-entity.js';
import type { SessionRepository } from '../../domain/session-repository.js';
import type { GetMeSessionParamsDto } from '../dtos/get-me-session-dto.js';

import { ContextFactory } from '#src/adapters/contexts/context.js';
import { SessionOutputMapper } from '../outputs/session-output.js';

export class GetMeSessionUsecase {
  private readonly sessionRepository: SessionRepository;

  public constructor(sessionRepository: SessionRepository) {
    this.sessionRepository = sessionRepository;
  }

  public async execute(ctx: Context, input: GetMeSessionParamsDto): Promise<SessionOutput> {
    const actorId: bigint = ContextFactory.getActorId(ctx);
    const session: SessionEntity = await this.sessionRepository.getByIdAndUserId(input.id, actorId);
    return SessionOutputMapper.toOutput(session);
  }
}
