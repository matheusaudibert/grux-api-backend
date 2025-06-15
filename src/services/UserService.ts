import User, { IUser, IBadge, INameplate, IClan } from "../models/User";
import { DiscordApiService } from "./DiscordApiService";

export class UserService {
  private discordApi = DiscordApiService.getInstance();

  public async registerUser(discordId: string): Promise<IUser> {
    try {
      let user = await User.findById(discordId);

      if (user) {
        console.log(`User ${discordId} already registered, updating...`);
        return await this.updateUserProfile(user);
      }

      user = new User({ _id: discordId });
      await this.updateUserProfile(user);

      console.log(`User ${discordId} registered successfully`);
      return user;
    } catch (error) {
      console.error(`Error registering user ${discordId}:`, error);
      throw error;
    }
  }

  public async updateUserProfile(user: IUser): Promise<IUser> {
    try {
      // Buscar apenas dados do perfil (funciona com user tokens)
      const profileData = await this.discordApi.getUserProfile(user._id);

      // Extrair badges
      const badges: IBadge[] = (profileData.badges || []).map((badge: any) => ({
        id: badge.id,
        description: badge.description,
        icon: badge.icon,
        link: badge.link || null,
      }));

      // Extrair nameplate do user (dentro do profileData)
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

      // Extrair clan do user
      let clan: IClan | null = null;
      if (profileData.user?.clan) {
        clan = {
          identity_guild_id: profileData.user.clan.identity_guild_id,
          identity_enabled: profileData.user.clan.identity_enabled,
          tag: profileData.user.clan.tag,
          badge: profileData.user.clan.badge,
        };
      }

      // Extrair contas conectadas
      const connectedAccounts = profileData.connected_accounts || [];

      // Atualizar usuário
      user.badges = badges;
      user.nameplate = nameplate;
      user.clan = clan;
      user.connectedAccounts = connectedAccounts; // Adicionando contas conectadas
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
    const users = await User.find();
    console.log(`Starting update for ${users.length} users...`);

    for (const user of users) {
      try {
        await this.updateUserProfile(user);

        // Delay between requests to avoid rate limit
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error updating ${user._id}:`, error);
      }
    }

    console.log("Update completed!");
  }

  public async getUserByDiscordId(discordId: string): Promise<IUser | null> {
    return await User.findById(discordId);
  }
}
