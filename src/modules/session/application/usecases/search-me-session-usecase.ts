import type { Context } from '#src/adapters/contexts/context.js';
import type { SearchMeSessionDto } from '../dtos/search-me-session-dto.js';
import type { SessionRepository, SessionSearchResult } from '../../domain/session-repository.js';

import { ContextFactory } from '#src/adapters/contexts/context.js';
import { SessionSearchParams } from '../../domain/session-repository.js';

export class SearchMeSessionUsecase {
  private readonly sessionRepository: SessionRepository;

  public constructor(sessionRepository: SessionRepository) {
    this.sessionRepository = sessionRepository;
  }

  public async execute(ctx: Context, input: SearchMeSessionDto): Promise<SessionSearchResult> {
    const actorId: bigint = ContextFactory.getActorId(ctx);

    const params: SessionSearchParams = new SessionSearchParams({
      ...input,
      filter: {
        ...input.filter,
        userId: actorId,
      },
    });

    return this.sessionRepository.search(params);
  }
}
