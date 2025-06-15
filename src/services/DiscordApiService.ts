import axios, { AxiosResponse } from "axios";

export class DiscordApiService {
  private static instance: DiscordApiService;
  private currentTokenIndex = 0;
  private tokens: string[] = [];
  private botToken: string;

  private constructor() {
    this.loadTokens();
    this.botToken = process.env.DISCORD_BOT_TOKEN || "";
  }

  public static getInstance(): DiscordApiService {
    if (!DiscordApiService.instance) {
      DiscordApiService.instance = new DiscordApiService();
    }
    return DiscordApiService.instance;
  }

  private loadTokens(): void {
    const tokenString = process.env.DISCORD_USER_TOKENS || "";
    this.tokens = tokenString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  private getNextToken(): string {
    if (this.tokens.length === 0) {
      throw new Error("No tokens available");
    }

    const token = this.tokens[this.currentTokenIndex];
    this.currentTokenIndex = (this.currentTokenIndex + 1) % this.tokens.length;

    return token;
  }

  // Busca perfil com tokens de usuário (OAuth2)
  public async getUserProfile(userId: string): Promise<any> {
    const maxRetries = this.tokens.length;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        const token = this.getNextToken();

        const response: AxiosResponse = await axios.get(
          `https://discord.com/api/v10/users/${userId}/profile`,
          {
            headers: {
              Authorization: token, // token de usuário OAuth2 (ex: "Bearer xyz...")
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          }
        );

        return response.data;
      } catch (error: any) {
        attempts++;

        if (error.response?.status === 429) {
          console.log(`Rate limit reached, trying next token...`);
          continue;
        }

        if (error.response?.status === 401) {
          console.log(`Invalid token, trying next...`);
          continue;
        }

        if (attempts >= maxRetries) {
          throw new Error(
            `Error fetching profile after ${maxRetries} attempts: ${error.message}`
          );
        }
      }
    }
  }

  // Busca informações básicas do usuário via token do bot
  public async getUserBasicInfo(userId: string): Promise<any> {
    if (!this.botToken) {
      throw new Error("Bot token is not configured");
    }

    try {
      const response: AxiosResponse = await axios.get(
        `https://discord.com/api/v10/users/${userId}`,
        {
          headers: {
            Authorization: `Bot ${this.botToken}`,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Error fetching basic user info: ${error.message}`);
    }
  }
}
