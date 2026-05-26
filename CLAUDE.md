# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cosmic is a server emulator for Global MapleStory (GMS) version 83. It is a Java-based project with JavaScript scripting support, originally forked from OdinMS/HeavenMS lineage.

## Build and Development Commands

- **Build:** `./mvnw clean package` (produces a fat jar `target/Cosmic.jar` via maven-assembly-plugin)
- **Run tests:** `./mvnw test`
- **Run a single test:** `./mvnw test -Dtest=ClassName#methodName`
- **Run the server:** Main method is in `net.server.Server`. Requires `config.yaml` in the working directory and a MySQL database.
- **Run jar:** `java -Xmx2048m -Dwz-path=wz -jar target/Cosmic.jar`
- **Docker:** `docker compose up` (rebuild with `docker compose up --build`)

## Technology Stack

- **Java 21** (Amazon Corretto recommended)
- **Maven** (wrapper provided)
- **Netty 4** for networking (`net.netty` package)
- **MySQL 8+** with HikariCP connection pooling
- **JDBI** for database access, **Liquibase** for migrations
- **GraalVM JS** (`org.graalvm.js`) for NPC/quest/event/item/map/reactor scripts
- **JUnit 5** and **Mockito** for testing
- **SLF4J + Log4j2** for logging
- **YamlBeans** for configuration parsing

## Architecture

### Server Model
The server uses a **World/Channel** architecture typical of MapleStory private servers:
- `net.server.Server` is the singleton entry point and master server.
- A **World** (`net.server.world.World`) represents a game world containing multiple channels.
- A **Channel** (`net.server.channel.Channel`) is an instance of the game world that players can join.
- `net.netty.LoginServer` handles login/auth on a dedicated port.
- `net.netty.ChannelServer` handles game traffic for each channel.

### Networking and Packets
- Netty bootstrap setup is in `net.netty.LoginServer` and `net.netty.ChannelServer`.
- Packet dispatch is centralized in `net.PacketProcessor`, which maps `RecvOpcode` values to handler classes.
- All packet handlers implement `net.PacketHandler`.
- There are ~147 channel handlers in `net.server.channel.handlers` (e.g., `GeneralChatHandler`, `ChangeMapHandler`).
- Packet I/O uses custom `InPacket`/`OutPacket` implementations backed by Netty `ByteBuf`.
- Packet encryption/decryption lives in `net.encryption`.

### Game Data (WZ)
- The server reads game data from **WZ XML files** (not the binary `.wz` files used by the client).
- Data provider abstraction is in the `provider` package (`DataProvider`, `DataProviderFactory`, `DataTool`).
- WZ XML parsing implementation is in `provider.wz` (`XMLWZFile`, `XMLDomMapleData`).
- The `wz-path` system property points to the XML data directory.

### Scripting
- Game logic scripts are written in **JavaScript** and loaded at runtime via GraalVM JS.
- Script managers are in `scripting` subpackages:
  - `scripting.npc` — NPC conversations
  - `scripting.quest` — Quest logic
  - `scripting.event` — Event instances (bosses, minigames, etc.)
  - `scripting.item` — Item scripts
  - `scripting.map` — Map entry/exit scripts
  - `scripting.portal` — Portal scripts
  - `scripting.reactor` — Reactor (in-map object) scripts

### Database
- `tools.DatabaseConnection` initializes HikariCP and exposes `Connection` and JDBI `Handle`.
- Migrations are run automatically on startup via `database.DatabaseMigrations` using Liquibase.
- Migration changelogs are in `src/main/resources/db/`.
- JDBI RowMappers (e.g., `database.note.NoteRowMapper`) are used for query results mapping.

### Client and Character State
- `client.Client` represents a connected TCP session and player state machine.
- `client.Character` is the in-game character entity (stats, inventory, skills, buffs).
- `client.inventory` contains item/equip/pet classes.
- `client.command` contains GM/player chat commands (e.g., `@hide`).

### Game Systems
- `server` package contains core game systems: `ShopFactory`, `ItemInformationProvider`, `CashShop`, `TimerManager`, `ThreadManager`.
- `server.life` — monsters, NPCs, mob skills, drop tables.
- `server.quest` — quest definitions.
- `server.events` and `server.expeditions` — scheduled events and boss expedition logic.

### Configuration
- `config.yaml` in the project root is the primary config file, parsed by `config.YamlConfig` using YamlBeans.
- `config.ServerConfig` and `config.WorldConfig` define the structure of the YAML config.
- Key setting: `DB_PASS` must be set to the MySQL root password.

## Testing

- Unit tests are in `src/test/java` and mirror the `src/main/java` package structure.
- Test utilities are in `testutil`: `Mocks`, `Packets`, `Items`, `HandlerTest`, `AnyValues`.
- Tests run via Maven Surefire (`./mvnw test`).

## Important Conventions

- **Vanilla gameplay goal:** The project aims to stay close to the original GMS v83 experience. Custom features are generally avoided.
- **Semantic versioning:** Tags follow SemVer. PR merge commit subjects should end with `#patch`, `#minor`, or `#major` to dictate the bump type.
- **Automatic registration:** Enabled by default in `config.yaml`; entering a nonexistent username/password at the login screen creates a new account.
- **Admin account:** Default credentials are `admin`/`admin`, PIN `0000`, PIC `000000`.
- **Hide mode:** GM characters start in hide mode (invisible, mobs freeze). Toggle with `@hide`.
- **WZ editing workflow:** Edit client `.wz` files with HaRepacker-resurrected (encryption "GMS (old)"), then re-export to the server's `wz/` XML directory using "Private Server" export. Never edit server XML directly and copy back to the client.

## File Locations

- **Main class:** `src/main/java/net/server/Server.java`
- **Config:** `config.yaml` (project root)
- **Packet handlers:** `src/main/java/net/server/channel/handlers/`
- **Database migrations:** `src/main/resources/db/`
- **WZ data:** `wz/` directory (project root, XML format, not included in jar)
- **Scripts:** Typically loaded from `scripts/` directory at runtime (JS files, not compiled)
- **Launch script:** `launch.bat` (Windows convenience script)
