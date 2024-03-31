'use client';

import React, { useContext, useState, useEffect } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { PlusIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { MessagesContext } from '@/context/message';
import type { ChatRoomListProps, Message } from '@/package/types';

function ChatRoomList({
	user,
	userList,
	chatRoomList,

	selectedChatRoom,
	setSelectedChatRoom,
}: ChatRoomListProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredRooms, setFilteredRooms] = useState(chatRoomList);
	const [newChatUsername, setNewChatUsername] = useState('');
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const router = useRouter();
	const { toast } = useToast();
	const { chat_room_updates } = useContext(MessagesContext);
	//	console.log('@@@@ user: ', user);
	// //console.log("@@@@ userfilteredRooms: ", filteredRooms);
	// //console.log(`UserList-start: ${JSON.stringify(userList, null, 2)}`);
	useEffect(() => {
		setFilteredRooms(chatRoomList);
	}, [chatRoomList]);

	//console.log("ChatRoomList user: ", user);
	const addChatRoom = async () => {
		//console.log("addChatRoom user1: ", user, " user2: ", newChatUsername);
		const chatRoomExists = chatRoomList.some(
			(chatRoom) => chatRoom.members?.includes(newChatUsername),
		);

		if (chatRoomExists) {
			toast({
				title: 'Chatroom already exists',
				description: 'The chatroom you are trying to create already exists.',
				variant: 'destructive',
			});
		} else {
			if (!chatRoomExists && user) {
				// console.log('??????');
				// console.log(
				// 	'add chat room start!',
				// 	'user.displayName: ',
				// 	user.displayName,
				// 	' newChatUsername: ',
				// 	newChatUsername,
				// );
				try {
					const response = await fetch('/api/chatRooms', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							// user: user,
							action: 'add',
							members: [user.displayName, newChatUsername],
						}),
					});

					if (!response.ok) {
						throw new Error('Failed to add chat room');
					}

					toast({
						title: 'Chatroom added',
						description: 'A new chatroom has been created successfully.',
						variant: 'default',
					});
				} catch (error) {
					//	console.error('Error adding chat room:', error);
				}
			}
			toast({
				title: 'Chatroom added',
				description: 'A new chatroom has been created successfully.',
				variant: 'default',
			});
		}
		//console.log("chat_room_list_updates!");
		chat_room_updates();
		setIsDialogOpen(false);
		router.refresh();
	};

	const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			const foundRooms = chatRoomList.filter((room) => room.members.includes(searchTerm));
			setFilteredRooms(foundRooms);

			if (foundRooms.length === 0) {
				const createRoom = window.confirm(
					'No chat room found. Do you want to create a new chat room?',
				);
				if (createRoom) {
					setNewChatUsername(searchTerm);
					setIsDialogOpen(true);
					// addChatRoom();
				} else {
					setFilteredRooms(chatRoomList);
				}
			}
		}
	};

	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between p-4">
				<h1 className="text-xl font-bold">Chat</h1>

				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button onClick={() => setIsDialogOpen(true)}>
							<PlusIcon />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add New Chat Room</DialogTitle>
							<DialogDescription>
								Enter the username to create a new chat room.
							</DialogDescription>
						</DialogHeader>
						<Input
							placeholder="Enter username..."
							value={newChatUsername}
							onChange={(e) => setNewChatUsername(e.target.value)}
						/>
						<DialogFooter>
							<Button onClick={addChatRoom}>Add Chat Room</Button>
						</DialogFooter>
						{/* <DialogClose asChild>
            <Button aria-label="Close" onClick={handleCloseDialog}>Close</Button>
          </DialogClose> */}
					</DialogContent>
				</Dialog>
			</div>
			<div className="px-4 pb-4">
				<Input
					placeholder="Search user..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					onKeyDown={handleSearch}
				/>
			</div>
			<div className="flex flex-col">
				{filteredRooms
					// .sort((a, b) => b.last_modified?.getTime() - a.last_modified?.getTime())
					.map((chatRoom) => {
						const lastMessage =
							chatRoom.messageList && chatRoom.messageList.length > 0
								? chatRoom.messageList[chatRoom.messageList.length - 1]
								: '';
						let lastMessage2: Message;

						try {
							if (lastMessage && lastMessage.trim() !== '') {
								lastMessage2 = JSON.parse(lastMessage);
							}
						} catch (error) {
							//console.error('Error parsing JSON:', error);
							// Handle the error or set a default value for lastMessage2
						}

						const isSelected = selectedChatRoom?.chatRoomId === chatRoom.chatRoomId;

						return (
							<Button
								key={chatRoom.chatRoomId}
								// Apply conditional styling based on whether the chatRoom is selected
								className={`my-1 flex items-center justify-between p-3 ${
									isSelected ? 'bg-gray-200' : '' // Apply a light gray background if selected
								}`}
								onClick={() => setSelectedChatRoom(chatRoom)}>
								<div className="flex items-center">
									{' '}
									{/* Flex container for avatar and texts */}
									{chatRoom.members
										?.filter((member) => member !== user?.displayName)
										.map((member) => {
											const memberUser = userList.find(
												(user) => user.displayName === member,
											);
											const avatarURL =
												memberUser?.avatar ??
												'https://github.com/shadcn.png';

											return (
												<div
													key={member}
													className="mr-2 flex items-center">
													{' '}
													{/* Flex container for each member */}
													<Image
														src={avatarURL}
														alt={`${member}'s avatar`}
														className="cursor-pointer rounded-full"
														width={32} // Set the width in pixels
														height={32} // Set the height in pixels
													/>
													<div className="ml-2">
														<div
															style={{
																fontWeight: 'bold',
																color: 'black',
															}}>
															{member}
														</div>
														<div style={{ color: 'darkgrey' }}>
															{lastMessage2?.content}
														</div>
													</div>
												</div>
											);
										})}
								</div>
							</Button>
						);
					})}
			</div>
		</div>
	);
}

export default ChatRoomList;
