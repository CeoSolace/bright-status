require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const STATUS_CHANNEL_ID = "1457548393663566017";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let statusMessage = null;

async function updateStatus(status, color) {
  try {
    const channel = await client.channels.fetch(STATUS_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle("Bright Bot Status")
      .setDescription(status)
      .setColor(color)
      .setTimestamp();

    if (statusMessage) {
      await statusMessage.edit({ embeds: [embed] });
    } else {
      statusMessage = await channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error("Failed to update status:", err);
  }
}

client.once("ready", async () => {
  await updateStatus("🟢 Operational", 0x2ecc71);
});

client.on("shardDisconnect", async () => {
  await updateStatus("🔴 Offline", 0xe74c3c);
});

client.on("shardReconnecting", async () => {
  await updateStatus("🟠 Reconnecting", 0xf39c12);
});

client.on("error", async () => {
  await updateStatus("🔴 Error", 0xe74c3c);
});

process.on("SIGINT", async () => {
  await updateStatus("🔴 Offline", 0xe74c3c);
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await updateStatus("🔴 Offline", 0xe74c3c);
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
