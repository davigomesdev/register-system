import type { SearchUserDto } from '../dtos/search-user-dto.js';
import type { UserRepository, UserSearchResult } from '../../domain/user-repository.js';

import { UserSearchParams } from '../../domain/user-repository.js';

export class SearchUserUsecase {
  private readonly userRepository: UserRepository;

  public constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(input: SearchUserDto): Promise<UserSearchResult> {
    return this.userRepository.search(new UserSearchParams(input));
  }
}
