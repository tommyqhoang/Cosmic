package server;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SmegaServiceTest {

    @Test
    void buildContentFormatsTheLine() {
        String content = SmegaService.buildContent("DarkLord", "super", 3, "Selling CHTP 200m!");
        assertEquals("📢 **DarkLord** (Super · CH3): \"Selling CHTP 200m!\"", content);
    }

    @Test
    void buildContentMapsKnownTypeLabels() {
        assertTrue(SmegaService.buildContent("P", "mega", 1, "x").contains("(Mega · CH1)"));
        assertTrue(SmegaService.buildContent("P", "super", 2, "x").contains("(Super · CH2)"));
        assertTrue(SmegaService.buildContent("P", "item", 3, "x").contains("(Item · CH3)"));
        assertTrue(SmegaService.buildContent("P", "triple", 4, "x").contains("(Triple · CH4)"));
        assertTrue(SmegaService.buildContent("P", "tv", 5, "x").contains("(MapleTV · CH5)"));
    }

    @Test
    void buildContentFallsBackToRawType() {
        assertTrue(SmegaService.buildContent("P", "weird", 1, "x").contains("(weird · CH1)"));
    }

    @Test
    void buildContentTruncatesToDiscordLimit() {
        String content = SmegaService.buildContent("P", "super", 1, "a".repeat(5000));
        assertTrue(content.length() <= 2000, "content must fit Discord's 2000-char limit");
        assertTrue(content.endsWith("…"), "truncated content should end with an ellipsis");
    }

    @Test
    void buildJsonBodyEscapesContentAndDisablesMentions() {
        String body = SmegaService.buildJsonBody("say \"hi\"\tto\n@everyone");
        assertTrue(body.contains("\\\"hi\\\""), "double quotes must be escaped");
        assertTrue(body.contains("\\t"), "tabs must be escaped");
        assertTrue(body.contains("\\n"), "newlines must be escaped");
        assertTrue(body.contains("\"allowed_mentions\":{\"parse\":[]}"), "mentions must be disabled");
        assertTrue(body.startsWith("{\"content\":\""), "body must be a content payload");
    }

    @Test
    void buildJsonBodyEscapesBackslashes() {
        assertTrue(SmegaService.buildJsonBody("path\\to").contains("path\\\\to"));
    }
}
