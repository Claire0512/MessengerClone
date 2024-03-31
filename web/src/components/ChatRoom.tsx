'use client';

import React, { useContext, useState } from 'react';

import Image from 'next/image';

import { RocketIcon } from '@radix-ui/react-icons';
// import { useState } from "react";
import { TrashIcon } from '@radix-ui/react-icons';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessagesContext } from '@/context/message';
import type { ChatRoomProps } from '@/package/types';

import ChatRoomInput from './ChatRoomInput';
import ChatRoomMessages from './ChatRoomMessages';

function ChatRoom({ selectedChatRoom, user, chatRoomList, userList }: ChatRoomProps) {
	//	console.log('&&&& selectedChatRoom: ', selectedChatRoom);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const { chat_room_updates } = useContext(MessagesContext);
	const otherMemberName = selectedChatRoom?.members?.find(
		(member) => member !== user.displayName,
	);
	const memberUser = userList.find((user) => user.displayName === otherMemberName);
	const handleDeleteClick = () => {
		setShowDeleteDialog(true);
	};
	const announcedMessages = selectedChatRoom?.messageList.filter(
		(msg) => JSON.parse(msg).type2 === 1,
	);
	const handleConfirmDelete = async () => {
		// 发送删除请求
		const response = await fetch('/api/chatRooms', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				user: user,
				action: 'remove',
				chatRoomId: selectedChatRoom?.chatRoomId,
			}),
		});

		if (response.ok) {
			setShowDeleteDialog(false);
		}
		chat_room_updates();
	};
	const handleCancelDelete = () => {
		setShowDeleteDialog(false);
	};
	return (
		<div className="flex h-screen w-full flex-col shadow-lg">
			<nav className="text-md flex w-full items-center justify-between p-3 font-semibold shadow-md">
				{otherMemberName && (
					<span className="text-md flex w-full justify-between">
						<span className="flex items-center">
							{' '}
							{/* Flex container for avatar and name */}
							<Image
								src={
									memberUser?.avatar
										? memberUser.avatar
										: 'https://github.com/shadcn.png'
								}
								alt={`${memberUser?.displayName}'s avatar`}
								width={32} // Set appropriate width
								height={32} // Set appropriate height
								className="rounded-full"
							/>
							<span className="ml-2">{otherMemberName}</span>{' '}
							{/* Margin-left to separate name from avatar */}
						</span>
						<button
							onClick={handleDeleteClick}
							className="flex items-center justify-end">
							<TrashIcon />
						</button>
					</span>
				)}
			</nav>
			<div className="mx-auto mb-2 mt-2 w-[90%] rounded-lg shadow-lg">
				<Alert>
					<RocketIcon className="h-4 w-4" />
					<AlertDescription>
						{announcedMessages && announcedMessages.length > 0
							? announcedMessages.map((msg, idx) => (
									<p key={idx}>{JSON.parse(msg).content}</p>
							  ))
							: 'No announced messages.'}
					</AlertDescription>
				</Alert>
			</div>

			<div className="flex-grow overflow-y-auto">
				<ChatRoomMessages
					selectedChatRoomId={selectedChatRoom?.chatRoomId}
					chatRoomList={chatRoomList}
					userList={userList}
					user={user}
				/>
			</div>
			<div className="p-2">
				<ChatRoomInput
					chatRoomId={selectedChatRoom?.chatRoomId}
					user={user}
					// userList={userList}
				/>
			</div>
			{showDeleteDialog && (
				<div className="absolute left-0 top-0 flex h-screen w-full items-center justify-center bg-gray-900 bg-opacity-50">
					<div className="rounded-lg bg-white p-4 shadow-md">
						<p>確認删除聊天室？</p>
						<div className="mt-4 flex justify-end">
							<button onClick={handleConfirmDelete} className="mr-4 text-red-500">
								確認
							</button>
							<button onClick={handleCancelDelete}>取消</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default ChatRoom;
