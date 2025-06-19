import UserModel, { IUser, IBadge, INameplate, IClan } from "../models/User";
import { DiscordApiService } from "./DiscordApiService";

export class UserService {
  private discordApi = DiscordApiService.getInstance();

  public async registerUser(discordId: string): Promise<IUser> {
    try {
      const profileData = await this.discordApi.getUserProfile(discordId);

      const badges: IBadge[] = (profileData.badges || []).map((badge: any) => ({
        id: badge.id,
        description: badge.description,
        icon: badge.icon,
        link: badge.link || null,
      }));

      let nameplate: INameplate | null = null;
      if (profileData.user?.collectibles?.nameplate) {
        const np = profileData.user.collectibles.nameplate;
        nameplate = {
          sku_id: np.sku_id,
          asset: np.asset,
          label: np.label,
          palette: np.palette,
        };
      }

      let clan: IClan | null = null;
      if (profileData.user?.clan) {
        clan = {
          identity_guild_id: profileData.user.clan.identity_guild_id,
          identity_enabled: profileData.user.clan.identity_enabled,
          tag: profileData.user.clan.tag,
          badge: profileData.user.clan.badge,
        };
      }

      const connectedAccounts = profileData.connected_accounts || [];

      const user = new UserModel({
        _id: discordId,
        badges,
        nameplate,
        clan,
        connectedAccounts,
        lastUpdated: new Date(),
      });

      await user.save();

      return user;
    } catch (error) {
      await UserModel.findByIdAndUpdate(
        discordId,
        {
          lastUpdated: new Date(),
        },
        { upsert: true }
      );

      throw error;
    }
  }

  public async updateUserProfile(user: IUser): Promise<IUser> {
    try {
      const profileData = await this.discordApi.getUserProfile(user._id);

      const badges: IBadge[] = (profileData.badges || []).map((badge: any) => ({
        id: badge.id,
        description: badge.description,
        icon: badge.icon,
        link: badge.link || null,
      }));

      let nameplate: INameplate | null = null;
      if (profileData.user?.collectibles?.nameplate) {
        const np = profileData.user.collectibles.nameplate;
        nameplate = {
          sku_id: np.sku_id,
          asset: np.asset,
          label: np.label,
          palette: np.palette,
        };
      }

      let clan: IClan | null = null;
      if (profileData.user?.clan) {
        clan = {
          identity_guild_id: profileData.user.clan.identity_guild_id,
          identity_enabled: profileData.user.clan.identity_enabled,
          tag: profileData.user.clan.tag,
          badge: profileData.user.clan.badge,
        };
      }

      const connectedAccounts = profileData.connected_accounts || [];

      user.badges = badges;
      user.nameplate = nameplate;
      user.clan = clan;
      user.connectedAccounts = connectedAccounts;
      user.lastUpdated = new Date();

      await user.save();

      return user;
    } catch (error) {
      user.lastUpdated = new Date();
      await user.save();
      throw error;
    }
  }

  public async updateAllUsers(): Promise<void> {
    const users = await UserModel.find();
    for (const user of users) {
      try {
        await this.updateUserProfile(user);
        console.log(`Updated user ${user._id}`);

        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error updating ${user._id}:`, error);
      }
    }
  }

  public async getUserByDiscordId(discordId: string): Promise<IUser | null> {
    return UserModel.findById(discordId).exec();
  }

  public async deleteUserByDiscordId(discordId: string): Promise<void> {
    await UserModel.findByIdAndDelete(discordId).exec();
  }
}
