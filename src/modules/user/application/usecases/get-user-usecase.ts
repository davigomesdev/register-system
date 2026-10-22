import type { UserOutput } from '../outputs/user-output.js';
import type { UserRepository } from '../../domain/user-repository.js';
import type { GetUserParamsDto } from '../dtos/get-user-dto.js';

import { UserOutputMapper } from '../outputs/user-output.js';

export class GetUserUsecase {
  private readonly userRepository: UserRepository;

  public constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(input: GetUserParamsDto): Promise<UserOutput> {
    const user = await this.userRepository.get(input.id);
    return UserOutputMapper.toOutput(user);
  }
}
