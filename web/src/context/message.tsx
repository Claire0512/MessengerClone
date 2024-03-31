'use client';

import { createContext, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type { ChatRoomList, UserList } from '@/package/types';
import { env } from '@/utils/env';

export type MessagesContext = {
	socket: Socket | null;

	chat_room_updates: () => Promise<void>;
	chatRoomList: ChatRoomList;
	setChatRoomList: React.Dispatch<React.SetStateAction<ChatRoomList>>;
	user_list_updates: () => Promise<void>;
	userList: UserList;
	setUserList: React.Dispatch<React.SetStateAction<UserList>>;
};

export const MessagesContext = createContext<MessagesContext>({
	socket: null,
	chat_room_updates: async () => {},
	chatRoomList: [],
	setChatRoomList: () => {},
	user_list_updates: async () => {},
	userList: [],
	setUserList: () => {},
});

type Props = {
	children: React.ReactNode;
};

export function MessagesProvider({ children }: Props) {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [chatRoomList, setChatRoomList] = useState<ChatRoomList>([]);
	const [userList, setUserList] = useState<UserList>([]);
	// const router = useRouter();
	useEffect(() => {
		const initSocket = () => {
			const socket = io(env.NEXT_PUBLIC_SOCKET_URL);
			socket.on('chat_room_updates', () => {
				////console.log("new chat_room_updates");
				fetchChatRooms();
			});
			socket.on('user_list_updates', () => {
				//console.log('new user_list_updates');
				fetchUserList();
			});
			setSocket(socket);
		};

		const fetchChatRooms = async () => {
			try {
				const response = await fetch('/api/chatRooms');
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				////console.log("fetchChatRooms");
				////console.log("fetch result data", data);
				////console.log("fetch result data.chatRooms", data.chatRooms);
				setChatRoomList(data.chatRooms);
				////console.log("fetch result chatRoomList", chatRoomList);
			} catch (error) {
				//console.error('Failed to fetch chat rooms:', error);
			}
			// router.refresh();
		};
		const fetchUserList = async () => {
			try {
				const response = await fetch('/api/userList');
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				setUserList(data.userList);
				//console.log('fetch result userList', userList);
			} catch (error) {
				//console.error('Failed to fetch chat rooms:', error);
			}
			// router.refresh();
		};
		fetchChatRooms();
		fetchUserList();
		initSocket();
	}, []);

	const chat_room_updates = async () => {
		if (!socket) {
			alert('No socket! Please retry later.');
			return;
		}

		socket.emit('chat_room_updates');
	};
	const user_list_updates = async () => {
		if (!socket) {
			alert('No socket! Please retry later.');
			return;
		}
		//console.log('!!!');
		socket.emit('user_list_updates');
	};

	return (
		<MessagesContext.Provider
			value={{
				chatRoomList,
				setChatRoomList,
				chat_room_updates,
				userList,
				setUserList,
				user_list_updates,
				socket,
			}}>
			{children}
		</MessagesContext.Provider>
	);
}
