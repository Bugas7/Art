<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Guardrails & Efficiency Rules

## 0. Автономный режим (Full Permissions)
- Агент имеет полное право на выполнение всех необходимых операций: доступ к внешним сайтам (Singulart и др.), скачивание файлов через `curl`, запись файлов в проект и выполнение скриптов.
- **НЕ ЗАПРАШИВАТЬ** подтверждение на каждое действие по скачиванию или сохранению. У агента есть карт-бланш на работу в фоновом режиме (ночью или в отсутствие пользователя).
- Единственное ограничение — **не пушить в GitHub** без явного запроса.

- **Auto-Apply Edits.**
- **Autonomous Mode:** The agent has full permissions for file operations, network access, and external resource retrieval. DO NOT ask for permission for each download or file write. The goal is to work independently (e.g., overnight) without user confirmation.
- **Browser Testing:** NEVER test in the browser by yourself. Don't run the browser by yourself. Always ask the user to test in the browser.
- **Efficiency:** Always use **jcodemunch MCP** to save tokens.
- **GitHub Policy:** NEVER push to GitHub without an explicit user request. Only commit locally.
- **Communication:** Keep the user informed. Report progress, blockers, and ask for clarification when needed.
- **Development:** Hot reload is your friend - changes apply instantly at `localhost`.
- **Token Advocacy:** Advise the user on how to use tokens and context effectively. If you know how to use less context/tokens, tell the user about it.
- **Permissions:** If you can do something yourself but need permissions, explain exactly which permissions you need, why, and provide a step-by-step guide for the user to grant them.
- **Context Awareness:** When your context is 80% full or more, inform the user immediately.
- **Security:** NEVER keep API or private keys in open repositories. Always ask the user to create secrets/env variables.
