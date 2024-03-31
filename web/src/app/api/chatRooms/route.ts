// 在 /pages/api/users/manageChatRooms.ts
import { type NextRequest, NextResponse } from 'next/server';

import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { usersTable, chatRoomsTable } from '@/db/schema';
import type { Message } from '@/package/types';

const manageChatRoomsSchema = z.object({
	action: z.enum(['add', 'remove', 'send', 'unsend', 'delete', 'announce']),
	members: z.array(z.string()).min(2).max(2).optional(), // 仅在添加操作时使用
	chatRoomId: z.number().optional(), // 仅在删除操作时使用
	message: z
		.object({
			content: z.string(),
			senderName: z.string(),
			// timestamp: z.date(),
			chatRoomId: z.number(),
			type: z.number(),
			type2: z.number(),
			timestamp: z.date(),
		})
		.optional(),
});

type ManageChatRoomsRequest = z.infer<typeof manageChatRoomsSchema>;

export async function POST(request: NextRequest) {
	let data;

	try {
		data = await request.json();
		//console.log(data);
		if (data.message) {
			data.message.timestamp = new Date(data.message.timestamp);
		}
		//console.log('data: ', data);
		manageChatRoomsSchema.parse(data);
	} catch (error) {
		//console.log(error);
		return NextResponse.json({ error: 'Invalid request format or data' }, { status: 400 });
	}
	//console.log('@@');
	const { action, members, chatRoomId, message } = data as ManageChatRoomsRequest;
	//console.log(
	// 	'action: ',
	// 	action,
	// 	' members: ',
	// 	members,
	// 	' chatRoomId: ',
	// 	chatRoomId,
	// 	' message: ',
	// 	message,
	// );
	// await db.transaction(async (db) => {
	// 在添加操作中

	if (action === 'add' && members) {
		// 确保所有成员都存在于 usersTable 中
		for (const member of members) {
			const userExists = await db
				.select({ usersTable })
				.from(usersTable)
				.where(eq(usersTable.displayName, member))
				.execute();
			//console.log('userExists: ', userExists);
			if (!userExists) {
				await db
					.insert(usersTable)
					.values({ displayName: member, chatRoomIdList: [] })
					.execute();
			}
		}

		// 创建新的聊天室
		const newChatRoom = await db
			.insert(chatRoomsTable)
			.values({
				members: members,
				createdAt: new Date(),
				lastModified: new Date(),
				messageList: [],
			})
			.returning({ chatRoomId: chatRoomsTable.chatRoomId })
			.execute();
		//console.log('newChatRoom: ', newChatRoom);
		// 使用 newChatRoom.chatRoomId 来获取新创建的聊天室 ID
		const newChatRoomId = newChatRoom[0].chatRoomId;

		// 更新用户的聊天室列表
		for (const member of members) {
			await db
				.update(usersTable)
				.set({
					chatRoomIdList: sql`array_append(chat_room_id_list, ${newChatRoomId})`,
				})
				.where(eq(usersTable.displayName, member))
				.execute();
		}
	} else if (action === 'remove' && chatRoomId !== undefined) {
		const chatRoom = await db
			.select()
			.from(chatRoomsTable)
			.where(eq(chatRoomsTable.chatRoomId, chatRoomId))
			.execute();
		//console.log('chatRoom: ', chatRoom);
		if (!chatRoom) {
			throw new Error('Chat room not found');
		} else {
			for (const member of chatRoom[0].members) {
				//console.log('member: ', member);
				await db
					.update(usersTable)
					.set({
						chatRoomIdList: sql`array_remove(chat_room_id_list, ${chatRoomId})`,
					})
					.where(eq(usersTable.displayName, member))
					.execute();
			}
			await db
				.delete(chatRoomsTable)
				.where(eq(chatRoomsTable.chatRoomId, chatRoomId))
				.execute();
		}
	} else if (action === 'send' && message) {
		// Handle the "send" action to add a message to an existing chat room
		const chatRoom = await db
			.select()
			.from(chatRoomsTable)
			.where(eq(chatRoomsTable.chatRoomId, message.chatRoomId))
			.execute();

		if (!chatRoom || chatRoom.length === 0) {
			return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
		}

		// Create a new message
		const newMessage: Message = {
			content: message.content,
			senderName: message.senderName,
			timestamp: message.timestamp,
			chatRoomId: message.chatRoomId,
			type: message.type,
			type2: message.type2,
		};
		// Access the chat room object
		const chatRoomToUpdate = chatRoom[0];

		// Ensure that the messageList is an array before pushing
		if (!chatRoomToUpdate.messageList) {
			chatRoomToUpdate.messageList = [];
		}

		// Add the new message to the chat room's message list
		chatRoomToUpdate.messageList.push(JSON.stringify(newMessage));
		chatRoomToUpdate.lastModified = newMessage.timestamp;
		//console.log(chatRoomToUpdate.messageList);
		await db
			.update(chatRoomsTable)
			.set({
				messageList: chatRoomToUpdate.messageList,
				lastModified: chatRoomToUpdate.lastModified,
			})
			.where(eq(chatRoomsTable.chatRoomId, newMessage.chatRoomId))
			.execute();
	} else if (action === 'unsend' && message) {
		const chatRoom = await db
			.select()
			.from(chatRoomsTable)
			.where(eq(chatRoomsTable.chatRoomId, message.chatRoomId))
			.execute();

		if (!chatRoom || chatRoom.length === 0) {
			//console.log('Chat room not found');
			return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
		}

		const messageList = chatRoom[0].messageList;

		const messageIndex = messageList?.findIndex(
			(m) => new Date(JSON.parse(m).timestamp).getTime() === message.timestamp.getTime(),
		);
		//console.log(messageIndex);
		if (messageIndex === undefined || messageIndex === -1) {
			//console.log('Message not found');
			return NextResponse.json({ error: 'Message not found' }, { status: 404 });
		} else if (messageList) {
			const messageToUpdate = JSON.parse(messageList[messageIndex]);

			messageToUpdate.type = 1;
			messageList[messageIndex] = JSON.stringify(messageToUpdate);
			// }

			await db
				.update(chatRoomsTable)
				.set({ messageList: messageList })
				.where(eq(chatRoomsTable.chatRoomId, message.chatRoomId))
				.execute();
		}
	} else if (action === 'delete' && message) {
		const chatRoom = await db
			.select()
			.from(chatRoomsTable)
			.where(eq(chatRoomsTable.chatRoomId, message.chatRoomId))
			.execute();

		if (!chatRoom || chatRoom.length === 0) {
			return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
		}

		const messageList = chatRoom[0].messageList;
		const messageIndex = messageList?.findIndex(
			(m) => new Date(JSON.parse(m).timestamp).getTime() === message.timestamp.getTime(),
		);
		//console.log(messageIndex);

		if (messageIndex && messageIndex !== -1 && messageList) {
			messageList.splice(messageIndex, 1);
			await db
				.update(chatRoomsTable)
				.set({ messageList: messageList })
				.where(eq(chatRoomsTable.chatRoomId, message.chatRoomId))
				.execute();
		} else {
			return NextResponse.json({ error: 'Message not found' }, { status: 404 });
		}
	} else if (action === 'announce' && message) {
		// Retrieve the specified chat room
		const chatRoom = await db
			.select()
			.from(chatRoomsTable)
			.where(eq(chatRoomsTable.chatRoomId, message.chatRoomId))
			.execute();

		if (!chatRoom || chatRoom.length === 0) {
			//console.log('Chat room not found');
			return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
		}

		let messageList = chatRoom[0].messageList;

		// Reset type2 for all messages
		if (messageList) {
			messageList = messageList.map((m) => {
				const msg = JSON.parse(m);
				if (msg.type2 === 1) {
					msg.type2 = 0;
				}
				return JSON.stringify(msg);
			});

			// Find and update the specified message to be announced
			const messageIndex = messageList.findIndex(
				(m) => new Date(JSON.parse(m).timestamp).getTime() === message.timestamp.getTime(),
			);
			if (messageIndex !== undefined && messageIndex !== -1) {
				const messageToUpdate = JSON.parse(messageList[messageIndex]);
				messageToUpdate.type2 = 1; // Set type2 to 1 to indicate it's announced
				messageList[messageIndex] = JSON.stringify(messageToUpdate);
			} else {
				//console.log('Message to be announced not found');
				return NextResponse.json(
					{ error: 'Message to be announced not found' },
					{ status: 404 },
				);
			}

			// Save the updated message list back to the database
			await db
				.update(chatRoomsTable)
				.set({ messageList: messageList })
				.where(eq(chatRoomsTable.chatRoomId, message.chatRoomId))
				.execute();
		}
	} else {
		return NextResponse.json(
			{ error: 'Invalid action or missing parameters' },
			{ status: 400 },
		);
	}

	return NextResponse.json({ message: 'Operation successful' }, { status: 200 });
}

export async function GET() {
	try {
		const chatRooms = await db
			.select()
			.from(chatRoomsTable)
			.orderBy(chatRoomsTable.lastModified)
			.execute();
		////console.log("GET result chatRooms", chatRooms);
		return NextResponse.json({ chatRooms }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
