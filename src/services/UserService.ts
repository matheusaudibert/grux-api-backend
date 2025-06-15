import User, {
  IUser,
  IBadge,
  INameplate,
  IClan,
  IConnectedAccount,
} from "../models/User";
import { DiscordApiService } from "./DiscordApiService";

export class UserService {
  private static instance: UserService;
  private discordApi: DiscordApiService;

  private constructor() {
    this.discordApi = DiscordApiService.getInstance();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async getUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }

  public async createOrUpdateUser(userId: string): Promise<IUser> {
    try {
      const profileData = await this.discordApi.getUserProfile(userId);

      const userData = {
        _id: userId,
        nameplate: this.extractNameplate(profileData),
        badges: this.extractBadges(profileData),
        clan: this.extractClan(profileData),
        connected_accounts: this.extractConnectedAccounts(profileData),
        lastUpdated: new Date(),
      };

      const user = await User.findByIdAndUpdate(userId, userData, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      });

      return user!;
    } catch (error) {
      throw new Error(`Failed to create or update user: ${error}`);
    }
  }

  private extractNameplate(profileData: any): INameplate | null {
    const nameplate = profileData?.user?.collectibles?.nameplate;
    if (!nameplate) return null;

    return {
      sku_id: nameplate.sku_id || "",
      asset: nameplate.asset || "",
      label: nameplate.label || "",
      palette: nameplate.palette || "",
    };
  }

  private extractBadges(profileData: any): IBadge[] {
    const badges = profileData?.badges || [];
    return badges.map((badge: any) => ({
      id: badge.id,
      description: badge.description,
      icon: badge.icon,
      link: badge.link || null,
    }));
  }

  private extractClan(profileData: any): IClan | null {
    const clan = profileData?.user?.clan;
    if (!clan) return null;

    return {
      identity_guild_id: clan.identity_guild_id || null,
      identity_enabled: clan.identity_enabled || false,
      tag: clan.tag || null,
      badge: clan.badge || null,
    };
  }

  private extractConnectedAccounts(profileData: any): IConnectedAccount[] {
    const connectedAccounts = profileData?.connected_accounts || [];
    return connectedAccounts.map((account: any) => ({
      type: account.type,
      id: account.id,
      name: account.name,
      verified: account.verified,
    }));
  }

  public async getAllUsers(): Promise<IUser[]> {
    return await User.find();
  }

  public async deleteUser(userId: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(userId);
    return !!result;
  }
}
