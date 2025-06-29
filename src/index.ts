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

const commands = [addCommand, deleteCommand];

async function deployCommands() {
  const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);

  const slashCommands = commands.map((cmd) => cmd.data.toJSON());

  try {
    await rest.put(Routes.applicationCommands(client.user!.id), {
      body: slashCommands,
    });
  } catch (error) {
    console.error("Error registering commands:", error);
  }
}

client.once("ready", async () => {
  console.log(`Bot connected as ${client.user?.tag}.`);

  client.user?.setPresence({
    activities: [
      {
        name: "users",
        type: ActivityType.Watching,
      },
    ],
    status: "idle",
  });

  await deployCommands();
});

client.on("guildMemberAdd", async (member) => {
  if (member.user.bot) return;
  try {
    const exists = await userService.getUserByDiscordId(member.user.id);
    console.log(
      `User ${member.user.tag} (${member.user.id}) was added to the system.`
    );
    if (!exists) {
      await userService.registerUser(member.user.id);
    }
  } catch (err) {
    console.error("Error registering member:", err);
  }
});

client.on("guildMemberRemove", async (member) => {
  if (member.user.bot) return;
  try {
    await userService.deleteUserByDiscordId(member.user.id);
    console.log(
      `User ${member.user.tag} (${member.user.id}) was removed from the system.`
    );
  } catch (err) {
    console.error(`Error deleting user ${member.user.id}:`, err);
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
