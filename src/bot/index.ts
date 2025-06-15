import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import dotenv from "dotenv";
import { connectDatabase } from "../database/connection";
import { registerCommand } from "./commands/register";

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
    console.error("Commands registration error:", error);
  }
}

client.once("ready", async () => {
  console.log(`Lunar online as ${client.user?.tag}`);
  await deployCommands();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.channelId !== process.env.DISCORD_REGISTER_CHANNEL_ID) {
    await interaction.reply({
      content: "❌ Este comando só pode ser usado no canal de registro!",
      ephemeral: true,
    });
    return;
  }

  if (interaction.commandName === "register") {
    await registerCommand.execute(interaction);
  }
});

// Start
async function startBot() {
  try {
    await connectDatabase();
    await client.login(process.env.DISCORD_BOT_TOKEN);
  } catch (error) {
    console.error("Start bot error:", error);
    process.exit(1);
  }
}

startBot();
