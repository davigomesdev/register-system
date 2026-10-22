export type TokenPairOutput = {
  accessToken: string;
  refreshToken: string;
};

export class TokenPairOutputMapper {
  public static toOutput(accessToken: string, refreshToken: string): TokenPairOutput {
    return {
      accessToken,
      refreshToken,
    };
  }
}
