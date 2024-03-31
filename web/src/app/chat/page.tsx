'use client';

import { useState } from 'react';
import React, { useContext, useEffect } from 'react';

import ChatRoomPage from '@/components/ChatRoom';
import ChatRoomListPage from '@/components/ChatRoomList';
import SideBar from '@/components/SideBar';
import { MessagesContext } from '@/context/message';
import useUserInfo from '@/hooks/useUserInfo';
import type { User, ChatRoomList } from '@/package/types';

const defaultUser: User = {
	displayName: '',
	ChatRoomIdList: [],
	avatar: '',
};

function Chat() {
	const { chatRoomList, setChatRoomList, userList } = useContext(MessagesContext);
	const { username } = useUserInfo();
	const [currentUser, setCurrentUser] = useState<User>(defaultUser);
	const [userChatRoomList, setUserChatRoomList] = useState<ChatRoomList>([]);
	const [selectedChatRoom, setSelectedChatRoom] = useState(userChatRoomList[0]);
	useEffect(() => {
		if (userList) {
			const foundUser = userList.find((user) => user.displayName === username);
			if (foundUser) {
				setCurrentUser(foundUser);
			}
		}
	}, [username, userList]);

	useEffect(() => {
		const filteredRooms = chatRoomList.filter(
			(chatRoom) => chatRoom.members?.includes(currentUser.displayName),
		);
		// console.log("Chat() before filteredRooms: ", filteredRooms);

		filteredRooms.sort((a, b) => {
			const lastA = new Date(a.lastModified);
			const lastB = new Date(b.lastModified);
			return lastB.getTime() - lastA.getTime();
		});
		// console.log("Chat() after filteredRooms: ", filteredRooms);
		setUserChatRoomList(filteredRooms);
		setSelectedChatRoom(filteredRooms[0]);
	}, [chatRoomList, currentUser.displayName]);
	// console.log("Chat() userChatRoomList: ", userChatRoomList);
	// console.log("Chat() selectedChatRoom: ", selectedChatRoom);
	return (
		<div className="flex h-screen w-full flex-row">
			<div className="w-1/6 flex-none">
				{' '}
				<SideBar user={currentUser} />
			</div>
			<div className="w-1/3 flex-none">
				{' '}
				<ChatRoomListPage
					user={currentUser}
					userList={userList}
					chatRoomList={userChatRoomList}
					setChatRoomList={setChatRoomList}
					selectedChatRoom={selectedChatRoom}
					setSelectedChatRoom={setSelectedChatRoom}
				/>
			</div>
			<div className="w-1/2 flex-none">
				{' '}
				<ChatRoomPage
					user={currentUser}
					userList={userList}
					chatRoomList={userChatRoomList}
					selectedChatRoom={selectedChatRoom}
				/>
			</div>
		</div>
	);
}

export default Chat;
