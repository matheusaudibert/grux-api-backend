import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { UserService } from "../../services/UserService";

const userService = new UserService();

export const registerCommand = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register your profile"),

  async execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const user = interaction.user;

      // Check if user already exists
      const existingUser = await userService.getUserByDiscordId(user.id);

      if (existingUser) {
        const embed = new EmbedBuilder()
          .setTitle("User Already Registered")
          .setDescription(`<@${user.id}> is already registered in the system.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const registeredUser = await userService.registerUser(user.id);

      const embed = new EmbedBuilder()
        .setTitle("User Registered")
        .setDescription(
          `<@${user.id}> has been successfully registered in the system.\n\nYou can now use the [**Lunar API**](https://newsletterbot.audibert.dev).`
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Register commando error:", error);

      const errorEmbed = new EmbedBuilder()
        .setTitle("Registration Error")
        .setDescription(
          "An error occurred while registering your profile. Please try again later."
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
