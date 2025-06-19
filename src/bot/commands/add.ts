import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { UserService } from "../../services/UserService";

const MOD_ROLE_ID = "1383935828425969794";
const userService = new UserService();

export const addCommand = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Add a member to the system")
    .addUserOption((option) =>
      option.setName("member").setDescription("Member to add").setRequired(true)
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

    if (member.bot) {
      const embed = new EmbedBuilder().setDescription(
        "Bots cannot be added to the system."
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    try {
      const exists = await userService.getUserByDiscordId(member.id);
      if (exists) {
        const embed = new EmbedBuilder().setDescription(
          `<@${member.id}> is already added to the system.`
        );
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      await userService.registerUser(member.id);
      const embed = new EmbedBuilder().setDescription(
        `<@${member.id}> was added to the system.`
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      const embed = new EmbedBuilder().setDescription("Error adding member.");
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
