import { index, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

// Users Table
export const usersTable = pgTable(
	'users',
	{
		id: serial('id').primaryKey(),
		displayName: varchar('display_name', { length: 50 }).notNull(),
		chatRoomIdList: text('chat_room_id_list').array(),
		avatar: text('avatar'),
	},
	(table) => ({
		displayNameIndex: index('display_name_index').on(table.displayName),
	}),
);

// ChatRooms Table
export const chatRoomsTable = pgTable(
	'chatRooms',
	{
		members: text('members').array().notNull(), // Array of member names
		chatRoomId: serial('chat_room_id').primaryKey(), // Unique chat room ID
		createdAt: timestamp('created_at'), // Timestamp of creation
		lastModified: timestamp('last_modified'),
		messageList: text('message_list').array(),
	},
	(table) => ({
		chatRoomIdIndex: index('chat_room_id_index').on(table.chatRoomId),
	}),
);

// Messages Table
// export const messagesTable = pgTable(
//   "messages",
//   {
//     id: serial("id").primaryKey(),
//     content: varchar("content", { length: 500 }).notNull(),
//     senderName: varchar("sender_name", { length: 50 }).notNull(),
//     timestamp: timestamp("timestamp").default(sql`now()`),
//     chatRoomId: integer("chat_room_id")
//       .notNull()
//       .references(() => chatRoomsTable.chatRoomId, {
//         onDelete: "cascade",
//         onUpdate: "cascade",
//       }), // Linking messages to chat rooms via foreign key
//   },
//   (table) => ({
//     senderNameIndex: index("sender_name_index").on(table.senderName),
//     chatRoomIdIndex: index("chat_room_id_index").on(table.chatRoomId),
//     timestampIndex: index("timestamp_index").on(table.timestamp),
//   }),
// );
