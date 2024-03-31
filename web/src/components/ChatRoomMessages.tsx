import React, { useEffect, useState, useContext, useRef } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { MessagesContext } from '@/context/message';
import useUserInfo from '@/hooks/useUserInfo';
import type { ChatRoom, ChatRoomList, UserList } from '@/package/types';
// import { Message } from "postcss";
import type { Message, User } from '@/package/types';

function ChatRoomMessages({
	chatRoomList,
	selectedChatRoomId,
	userList,
	user,
}: {
	selectedChatRoomId: number;
	chatRoomList: ChatRoomList;
	userList: UserList;
	user: User;
}) {
	const router = useRouter();
	const { username } = useUserInfo();
	const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
	const { chat_room_updates } = useContext(MessagesContext);
	useEffect(() => {
		const newSelectedChatRoom = chatRoomList.find(
			(room) => room.chatRoomId === selectedChatRoomId,
		);
		setSelectedChatRoom(newSelectedChatRoom || null);
	}, [chatRoomList, selectedChatRoomId]);

	useEffect(() => {
		if (!username) {
			router.push('/');
			return;
		}
	}, [username, router]);

	const messages = selectedChatRoom?.messageList;

	const handleMessageAction = async (
		action: 'delete' | 'unsend' | 'announce',
		message: string,
	) => {
		const response = await fetch('/api/chatRooms', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				// user: username,
				action: action,
				message: JSON.parse(message),
				chatRoomId: selectedChatRoomId,
			}),
		});

		if (response.ok) {
			chat_room_updates();
		} else {
			// console.log("@@");
		}
	};
	// const announcedMessages = selectedChatRoom?.messageList.filter(
	//   (msg) => JSON.parse(msg).type2 === 1,
	// );
	const memberUser: User | null =
		selectedChatRoom?.members
			?.filter((member) => member !== user?.displayName)
			.map((member) => userList.find((u) => u.displayName === member))
			.find((u): u is User => !!u) || null; // This will find the first defined user, or return null if none are found.
	// 创建一个 ref 并指定类型为 HTMLDivElement 或 null
	const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		// 检查 endOfMessagesRef.current 是否存在，并调用 scrollIntoView
		endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	return (
		<div className="flex h-full flex-col">
			{messages?.map((message, index) => {
				const messageData = JSON.parse(message);
				const isSender = messageData.senderName === username;

				return (
					<div key={index} className="w-full pt-1">
						<ContextMenu>
							<ContextMenuTrigger>
								<MessageBubble
									message={messageData}
									isSender={isSender}
									user={user}
									memberUser={memberUser}
								/>
							</ContextMenuTrigger>
							<ContextMenuContent>
								{isSender && messageData.type !== 1 && (
									<>
										<ContextMenuItem
											onSelect={() => handleMessageAction('delete', message)}>
											Recall for Everyone
										</ContextMenuItem>
										<ContextMenuItem
											onSelect={() => handleMessageAction('unsend', message)}>
											Recall for Self
										</ContextMenuItem>
									</>
								)}
								<ContextMenuItem
									onSelect={() => handleMessageAction('announce', message)}>
									Announce
								</ContextMenuItem>
							</ContextMenuContent>
						</ContextMenu>
					</div>
				);
			})}
			<div ref={endOfMessagesRef} />
		</div>
	);
}
function MessageBubble({
	message,
	isSender,
	user,
	memberUser,
}: {
	message: Message;
	isSender: boolean;
	user: User;
	memberUser: User | null;
}) {
	return (
		<div className={`flex flex-row items-end gap-2 ${isSender && 'justify-end'}`}>
			{!isSender && (
				<>
					<Image
						src={
							memberUser?.avatar ? memberUser.avatar : 'https://github.com/shadcn.png'
						}
						alt={`${memberUser?.displayName}'s avatar`}
						className="cursor-pointer rounded-full"
						width={32} // Set the width in pixels
						height={32} // Set the height in pixels
					/>
					<div
						className={`max-w-[60%] rounded-2xl px-3 py-1 leading-6 ${
							isSender ? 'bg-black text-white' : ' bg-gray-200 text-black'
						}`}>
						{message.content}
					</div>
				</>
			)}

			{isSender && message.type !== 1 && (
				<>
					<div
						className={`max-w-[60%] rounded-2xl px-3 py-1 leading-6 ${
							isSender ? 'bg-black text-white' : ' bg-gray-200 text-black'
						}`}>
						{message.content}
					</div>
					<Image
						src={user.avatar ? user.avatar : 'https://github.com/shadcn.png'}
						alt={`${user.displayName}'s avatar`}
						className="cursor-pointer rounded-full"
						width={32} // Set the width in pixels
						height={32} // Set the height in pixels
					/>
				</>
			)}
		</div>
	);
}

export default ChatRoomMessages;
