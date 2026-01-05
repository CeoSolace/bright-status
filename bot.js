require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActivityType
} = require("discord.js");

const express = require("express");

/* =======================
   CONFIG
======================= */
const STATUS_CHANNEL_ID = "1457548393663566017";
const PORT = process.env.PORT || 3000;

/* =======================
   DISCORD CLIENT
======================= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let statusMessage = null;

/* =======================
   STATUS EMBED HANDLER
======================= */
async function updateStatus(title, description, color) {
  try {
    const channel = await client.channels.fetch(STATUS_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp();

    if (statusMessage) {
      await statusMessage.edit({ embeds: [embed] });
    } else {
      statusMessage = await channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error("Status update failed:", err);
  }
}

/* =======================
   DISCORD EVENTS
======================= */
client.once("ready", async () => {
  // Bot presence
  client.user.setPresence({
    activities: [
      {
        name: "Check Out Bright | brightbot.online",
        type: ActivityType.Playing
      }
    ],
    status: "online"
  });

  await updateStatus(
    "🟢 Bright is Online",
    "All core services are running normally.",
    0x2ecc71
  );
});

client.on("shardReconnecting", async () => {
  await updateStatus(
    "🟠 Reconnecting",
    "Temporary connection issue. Services may be briefly unavailable.",
    0xf39c12
  );
});

client.on("shardDisconnect", async () => {
  await updateStatus(
    "🔴 Service Disruption",
    "Bright is currently unavailable. Recovery in progress.",
    0xe74c3c
  );
});

client.on("error", async () => {
  await updateStatus(
    "🔴 Critical Error",
    "An unexpected issue occurred. Investigation underway.",
    0xe74c3c
  );
});

/* =======================
   PROCESS SIGNALS
======================= */
async function shutdown() {
  await updateStatus(
    "🔴 Service Disruption",
    "Bright has gone offline. Recovery in progress.",
    0xe74c3c
  );
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/* =======================
   EXPRESS KEEP-ALIVE
======================= */
const app = express();

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

app.get("/health", (req, res) => {
  const ready = client.isReady();
  res.status(ready ? 200 : 503).json({
    status: ready ? "ok" : "degraded"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Status server listening on port ${PORT}`);
});

/* =======================
   LOGIN
======================= */
client.login(process.env.DISCORD_TOKEN);
