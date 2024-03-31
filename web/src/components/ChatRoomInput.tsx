import React, { useContext, useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { PaperPlaneIcon } from '@radix-ui/react-icons';

import { MessagesContext } from '@/context/message';
import useUserInfo from '@/hooks/useUserInfo';
import type { User } from '@/package/types';

// Add a prop for the chatRoomId
function ChatRoomInput({
	chatRoomId,
	user, // userList,
}: {
	chatRoomId: number;
	user: User;
	// userList: UserList;
}) {
	const { chat_room_updates } = useContext(MessagesContext);
	const { username } = useUserInfo();
	const [content, setContent] = useState<string>('');
	const router = useRouter();

	useEffect(() => {
		if (!username) {
			router.push('/');
			return;
		}
	}, [username, router]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!content || !username) return;
		// const messageToSend = {
		//   content,
		//   senderName: username,
		//   // Add any other required fields here
		// };

		try {
			const response = await fetch('/api/chatRooms', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					// user: user,
					action: 'send',
					message: {
						content: content,
						senderName: user.displayName,
						chatRoomId: chatRoomId,
						timestamp: new Date(),
						type: 0,
						type2: 0,
					},
					chatRoomId: chatRoomId,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to add chat room');
			}
		} catch (error) {
			//console.error('Error adding chat room:', error);
		}
		chat_room_updates();
		setContent('');
	};
	// Include the chatRoomId in the sendMessage call
	// //console.log("chatRoomId =", chatRoomId, "messageToSend =", messageToSend);

	// //console.log(`chatRoomId = ${chatRoomId}, messageToSend = ${messageToSend}`);

	return (
		<form className="flex gap-2" onSubmit={handleSubmit}>
			<input
				type="text"
				placeholder="Type your message..."
				value={content}
				onChange={(e) => setContent(e.target.value)}
				className="text-md flex-1 rounded-md border-[1.5px] border-gray-300 p-1 outline-none transition duration-200 ease-in-out focus:border-gray-600"
			/>
			<button
				type="submit"
				disabled={!content}
				className={`rounded-lg px-2 py-1 text-sm transition duration-200 ease-in-out ${
					content ? 'bg-black text-white hover:bg-gray-700' : 'bg-gray-400 text-gray-500'
				}`}>
				<PaperPlaneIcon className="h-4 w-4" />
			</button>
		</form>
	);
}

export default ChatRoomInput;
