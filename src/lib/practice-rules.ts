// Practice tool limits shared by the server (validation, src/lib/practice.ts) and the chat island. No imports, so islands can use it.

/** Characters in one message from the student. */
export const MAX_MESSAGE_CHARS = 2000;
/** Messages from the student in one conversation. */
export const MAX_TURNS = 20;
/** Characters in the whole conversation, both sides. */
export const MAX_CONVERSATION_CHARS = 24_000;
