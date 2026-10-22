import type { Context } from '#src/adapters/contexts/context.js';
import type { UserOutput } from '../outputs/user-output.js';
import type { UserRepository } from '../../domain/user-repository.js';

import { ContextFactory } from '#src/adapters/contexts/context.js';
import { UserOutputMapper } from '../outputs/user-output.js';

export class GetMeUserUsecase {
  private readonly userRepository: UserRepository;

  public constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(ctx: Context): Promise<UserOutput> {
    const actorId = ContextFactory.getActorId(ctx);
    const user = await this.userRepository.get(actorId);
    return UserOutputMapper.toOutput(user);
  }
}
