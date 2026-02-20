# claude-test
To investigate connecting angular project with Claude Code and allow Claude code to access project structure etc

---

## 1. Claude Code `/help` Output

```
Usage: claude [options] [command] [prompt]

Claude Code - starts an interactive session by default, use -p/--print for
non-interactive output

Arguments:
  prompt                                            Your prompt

Options:
  --add-dir <directories...>                        Additional directories to allow tool access to
  --agent <agent>                                   Agent for the current session. Overrides the 'agent' setting.
  --agents <json>                                   JSON object defining custom agents (e.g. '{"reviewer": {"description": "Reviews code", "prompt": "You are a code reviewer"}}')
  --allow-dangerously-skip-permissions              Enable bypassing all permission checks as an option, without it being enabled by default. Recommended only for sandboxes with no internet access.
  --allowedTools, --allowed-tools <tools...>        Comma or space-separated list of tool names to allow (e.g. "Bash(git:*) Edit")
  --append-system-prompt <prompt>                   Append a system prompt to the default system prompt
  --betas <betas...>                                Beta headers to include in API requests (API key users only)
  --chrome                                          Enable Claude in Chrome integration
  -c, --continue                                    Continue the most recent conversation in the current directory
  --dangerously-skip-permissions                    Bypass all permission checks. Recommended only for sandboxes with no internet access.
  -d, --debug [filter]                              Enable debug mode with optional category filtering (e.g., "api,hooks" or "!1p,!file")
  --debug-file <path>                               Write debug logs to a specific file path (implicitly enables debug mode)
  --disable-slash-commands                          Disable all skills
  --disallowedTools, --disallowed-tools <tools...>  Comma or space-separated list of tool names to deny (e.g. "Bash(git:*) Edit")
  --effort <level>                                  Effort level for the current session (low, medium, high)
  --fallback-model <model>                          Enable automatic fallback to specified model when default model is overloaded (only works with --print)
  --file <specs...>                                 File resources to download at startup. Format: file_id:relative_path (e.g., --file file_abc:doc.txt file_def:img.png)
  --fork-session                                    When resuming, create a new session ID instead of reusing the original (use with --resume or --continue)
  --from-pr [value]                                 Resume a session linked to a PR by PR number/URL, or open interactive picker with optional search term
  -h, --help                                        Display help for command
  --ide                                             Automatically connect to IDE on startup if exactly one valid IDE is available
  --include-partial-messages                        Include partial message chunks as they arrive (only works with --print and --output-format=stream-json)
  --input-format <format>                           Input format (only works with --print): "text" (default), or "stream-json" (realtime streaming input) (choices: "text", "stream-json")
  --json-schema <schema>                            JSON Schema for structured output validation. Example: {"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}
  --max-budget-usd <amount>                         Maximum dollar amount to spend on API calls (only works with --print)
  --mcp-config <configs...>                         Load MCP servers from JSON files or strings (space-separated)
  --mcp-debug                                       [DEPRECATED. Use --debug instead] Enable MCP debug mode (shows MCP server errors)
  --model <model>                                   Model for the current session. Provide an alias for the latest model (e.g. 'sonnet' or 'opus') or a model's full name (e.g. 'claude-sonnet-4-6').
  --no-chrome                                       Disable Claude in Chrome integration
  --no-session-persistence                          Disable session persistence - sessions will not be saved to disk and cannot be resumed (only works with --print)
  --output-format <format>                          Output format (only works with --print): "text" (default), "json" (single result), or "stream-json" (realtime streaming) (choices: "text", "json", "stream-json")
  --permission-mode <mode>                          Permission mode to use for the session (choices: "acceptEdits", "bypassPermissions", "default", "dontAsk", "plan")
  --plugin-dir <paths...>                           Load plugins from directories for this session only (repeatable)
  -p, --print                                       Print response and exit (useful for pipes). Note: The workspace trust dialog is skipped when Claude is run with the -p mode. Only use this flag in directories you trust.
  --replay-user-messages                            Re-emit user messages from stdin back on stdout for acknowledgment (only works with --input-format=stream-json and --output-format=stream-json)
  -r, --resume [value]                              Resume a conversation by session ID, or open interactive picker with optional search term
  --session-id <uuid>                               Use a specific session ID for the conversation (must be a valid UUID)
  --setting-sources <sources>                       Comma-separated list of setting sources to load (user, project, local).
  --settings <file-or-json>                         Path to a settings JSON file or a JSON string to load additional settings from
  --strict-mcp-config                               Only use MCP servers from --mcp-config, ignoring all other MCP configurations
  --system-prompt <prompt>                          System prompt to use for the session
  --tmux                                            Create a tmux session for the worktree (requires --worktree). Uses iTerm2 native panes when available; use --tmux=classic for traditional tmux.
  --tools <tools...>                                Specify the list of available tools from the built-in set. Use "" to disable all tools, "default" to use all tools, or specify tool names (e.g. "Bash,Edit,Read").
  --verbose                                         Override verbose mode setting from config
  -v, --version                                     Output the version number
  -w, --worktree [name]                             Create a new git worktree for this session (optionally specify a name)

Commands:
  auth                                              Manage authentication
  doctor                                            Check the health of your Claude Code auto-updater
  install [options] [target]                        Install Claude Code native build. Use [target] to specify version (stable, latest, or specific version)
  mcp                                               Configure and manage MCP servers
  plugin                                            Manage Claude Code plugins
  setup-token                                       Set up a long-lived authentication token (requires Claude subscription)
  update|upgrade                                    Check for updates and install if available
```

---

## 2. How to Create Custom Skills in Claude Code

Skills are custom slash commands created by writing a `SKILL.md` file in a specific directory.

### Where to store them

| Scope | Path |
|-------|------|
| Personal (all projects) | `~/.claude/skills/<skill-name>/SKILL.md` |
| Project-only | `.claude/skills/<skill-name>/SKILL.md` |

### Basic structure

Every `SKILL.md` has YAML frontmatter + markdown instructions:

```yaml
---
name: explain-code
description: Explains code with analogies and diagrams. Use when the user asks "how does this work?"
---

When explaining code:
1. Start with a real-world analogy
2. Use ASCII diagrams to show structure/flow
3. Walk through it step-by-step
```

### Key frontmatter fields

| Field | Description |
|-------|-------------|
| `name` | Slash command name (lowercase, hyphens) |
| `description` | What it does — Claude uses this to auto-invoke it |
| `argument-hint` | Autocomplete hint, e.g. `[file]` |
| `disable-model-invocation` | `true` = only you can invoke it (good for deploys) |
| `user-invocable` | `false` = Claude auto-uses it, hidden from `/` menu |
| `allowed-tools` | Restrict which tools are available |
| `context: fork` | Run in an isolated subagent |

### Arguments

Use `$ARGUMENTS` (all args) or `$0`, `$1` (specific args):

```yaml
---
name: migrate
---
Migrate the $0 component from $1 to $2.
```

Invoke with: `/migrate SearchBar React Vue`

### Invocation

- **Manual:** type `/skill-name` in the chat
- **Automatic:** Claude reads the `description` and loads the skill when relevant

### Example — a safe read-only audit skill

```yaml
---
name: audit
description: Audit code for security issues
allowed-tools: Read, Grep, Glob
disable-model-invocation: true
---
Audit $ARGUMENTS for OWASP Top 10 vulnerabilities.
Report findings with file:line references.
```

### Tips

- Use `disable-model-invocation: true` for anything with side effects (deploys, messages, production changes)
- Commit `.claude/skills/` to version control to share skills with your team
- Keep `SKILL.md` focused; move reference material to supporting files in the same directory

---

## 3. What Claude Code Can Do

Here's a summary of what Claude Code can do:
  Code Editing & Development

  - Read and understand your entire codebase
  - Edit multiple files simultaneously from plain language descriptions
  - Build features, fix bugs, and refactor code

  Version Control

  - Stage files, write commit messages, create branches and PRs
  - Resolve merge conflicts
  - Integrate with GitHub Actions / GitLab CI/CD

  Testing & Debugging

  - Write and run tests, fix failing ones
  - Trace issues through the codebase and implement fixes
  - Debug live web apps via Chrome integration

  Automation

  - Run lint/format checks automatically after edits
  - Execute shell commands via hooks before/after actions
  - Automate repetitive tasks headlessly via CLI scripting

  Customization & Extension

  - CLAUDE.md — set project-specific coding standards and instructions that persist across sessions
  - Custom slash commands — create reusable workflows (e.g. /review-pr)
  - MCP (Model Context Protocol) — connect external tools like Jira, Slack, databases, and custom APIs

  Multi-Agent & Team Features

  - Spawn multiple agents working on different parts of a codebase simultaneously
  - Build custom AI agents using the Agent SDK

  IDE & Platform Integration

  - VS Code extension, JetBrains plugin, desktop app, web interface, iOS app
  - Works in CI/CD pipelines, terminal, or browser

  In short — it can handle most day-to-day software engineering tasks from the terminal, with deep awareness of your project's context
