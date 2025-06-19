import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import { UserService } from "../../services/UserService";

const MOD_ROLE_ID = "1383935828425969794";
const userService = new UserService();

export const deleteCommand = {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete a member from the system")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("Member to delete")
        .setRequired(true)
    ),

  async execute(interaction: CommandInteraction) {
    // @ts-ignore
    const member = interaction.options.getUser("member");
    const guildMember = interaction.guild?.members.cache.get(
      interaction.user.id
    );

    if (!guildMember?.roles.cache.has(MOD_ROLE_ID)) {
      const embed = new EmbedBuilder().setDescription(
        "You do not have permission to use this command."
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    try {
      await userService.deleteUserByDiscordId(member.id);
      const embed = new EmbedBuilder().setDescription(
        `<@${member.id}> was deleted from the system.`
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      const embed = new EmbedBuilder().setDescription("Error deleting member.");
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
