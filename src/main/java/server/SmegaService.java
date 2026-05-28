package server;

import client.Character;
import config.YamlConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tools.DatabaseConnection;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Types;
import java.time.Duration;
import java.util.Map;

/**
 * Records every world/channel megaphone a player fires: persists it to the
 * {@code cms_smega} table (mirrored by the website's community feed) and, when a
 * Discord webhook is configured, posts it to that channel. Both side effects are
 * isolated so a DB or network failure can never break the in-game megaphone.
 */
public class SmegaService {
    private static final Logger log = LoggerFactory.getLogger(SmegaService.class);

    // Discord caps message content at 2000 characters.
    private static final int DISCORD_CONTENT_LIMIT = 2000;

    private static final Map<String, String> TYPE_LABELS = Map.of(
            "mega", "Mega",
            "super", "Super",
            "item", "Item",
            "triple", "Triple",
            "tv", "MapleTV");

    private static final HttpClient HTTP = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private SmegaService() {
    }

    public static void record(Character player, int channel, String type, String message, Integer itemId) {
        if (player == null || message == null) {
            return;
        }
        String name = player.getName();
        persist(name, channel, type, message, itemId);
        postToDiscord(name, channel, type, message);
    }

    private static void persist(String player, int channel, String type, String message, Integer itemId) {
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     "INSERT INTO cms_smega (player, channel, type, message, item_id) VALUES (?, ?, ?, ?, ?)")) {
            ps.setString(1, player);
            ps.setInt(2, channel);
            ps.setString(3, type);
            ps.setString(4, message);
            if (itemId == null) {
                ps.setNull(5, Types.INTEGER);
            } else {
                ps.setInt(5, itemId);
            }
            ps.executeUpdate();
        } catch (Exception e) {
            log.warn("Failed to persist smega for {}", player, e);
        }
    }

    private static void postToDiscord(String player, int channel, String type, String message) {
        String webhook = YamlConfig.config.server.DISCORD_SMEGA_WEBHOOK;
        if (webhook == null || webhook.isBlank()) {
            return;
        }
        try {
            String body = buildJsonBody(buildContent(player, type, channel, message));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(webhook))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();
            HTTP.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(resp -> {
                        if (resp.statusCode() >= 300) {
                            log.warn("Discord smega webhook returned {}: {}", resp.statusCode(), resp.body());
                        }
                    })
                    .exceptionally(ex -> {
                        log.warn("Discord smega webhook request failed", ex);
                        return null;
                    });
        } catch (Exception e) {
            log.warn("Failed to dispatch smega to Discord", e);
        }
    }

    // Pure: the plain-text line shown in Discord. Visible for testing.
    static String buildContent(String player, String type, int channel, String message) {
        String label = TYPE_LABELS.getOrDefault(type, type);
        String line = "📢 **" + player + "** (" + label + " · CH" + channel + "): \"" + message + "\"";
        if (line.length() > DISCORD_CONTENT_LIMIT) {
            line = line.substring(0, DISCORD_CONTENT_LIMIT - 1) + "…";
        }
        return line;
    }

    // Pure: the webhook JSON body. allowed_mentions disables @everyone/@here/role/user
    // pings so a smega's text can never ping the Discord channel. Visible for testing.
    static String buildJsonBody(String content) {
        return "{\"content\":\"" + escapeJson(content) + "\",\"allowed_mentions\":{\"parse\":[]}}";
    }

    private static String escapeJson(String s) {
        StringBuilder sb = new StringBuilder(s.length() + 16);
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                case '\b' -> sb.append("\\b");
                case '\f' -> sb.append("\\f");
                default -> {
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
                }
            }
        }
        return sb.toString();
    }
}
