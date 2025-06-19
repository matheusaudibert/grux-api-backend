import dotenv from "dotenv";
import {
  Client,
  GatewayIntentBits,
  ActivityType,
  REST,
  Routes,
  EmbedBuilder,
} from "discord.js";
import { connectDatabase } from "./database/connection";
import { startUpdateScheduler } from "./scheduler/updateScheduler";
import { addCommand } from "./bot/commands/add";
import { deleteCommand } from "./bot/commands/delete";
import { UserService } from "./services/UserService";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
  ],
});

const userService = new UserService();

async function deployCommands() {
  const commands = [addCommand.data.toJSON(), deleteCommand.data.toJSON()];

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

client.on("guildMemberAdd", async (member) => {
  if (member.user.bot) return;
  try {
    const exists = await userService.getUserByDiscordId(member.user.id);
    if (!exists) {
      await userService.registerUser(member.user.id);
    }
  } catch (err) {
    console.error("Error registering member:", err);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "add") {
    await addCommand.execute(interaction);
    return;
  }
  if (interaction.commandName === "delete") {
    await deleteCommand.execute(interaction);
    return;
  }
});

async function main() {
  try {
    await connectDatabase();

    await client.login(process.env.DISCORD_BOT_TOKEN);

    startUpdateScheduler();
  } catch (error) {
    console.error("Error starting system:", error);
    process.exit(1);
  }
}

main();
