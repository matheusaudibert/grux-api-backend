import dotenv from "dotenv";
import {
  Client,
  GatewayIntentBits,
  ActivityType,
  REST,
  Routes,
} from "discord.js";
import { connectDatabase } from "./database/connection";
import { startUpdateScheduler } from "./scheduler/updateScheduler";
import { registerCommand } from "./bot/commands/register";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Register slash commands
async function deployCommands() {
  const commands = [registerCommand.data.toJSON()];

  const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);

  try {
    await rest.put(
      Routes.applicationGuildCommands(
        client.user!.id,
        process.env.DISCORD_GUILD_ID!
      ),
      { body: commands }
    );
  } catch (error) {
    console.error("Error registering commands:", error);
  }
}

client.once("ready", async () => {
  console.log(`Bot connected as ${client.user?.tag}`);

  client.user?.setPresence({
    activities: [
      {
        name: "server updates",
        type: ActivityType.Watching,
      },
    ],
    status: "online",
  });

  await deployCommands();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Check if in correct channel
  if (interaction.channelId !== process.env.DISCORD_REGISTER_CHANNEL_ID) {
    await interaction.reply({
      content: `This command can only be used in <#${process.env.DISCORD_REGISTER_CHANNEL_ID}> channel!`,
      ephemeral: true,
    });
    return;
  }

  if (interaction.commandName === "register") {
    await registerCommand.execute(interaction);
  }
});

// Main function
async function main() {
  try {
    console.log("Starting system...");
    // Connect to database
    await connectDatabase();

    // Start Discord bot
    await client.login(process.env.DISCORD_BOT_TOKEN);

    // Start update scheduler
    startUpdateScheduler();
  } catch (error) {
    console.error("Error starting system:", error);
    process.exit(1);
  }
}

main();
