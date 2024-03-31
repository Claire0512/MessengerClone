import React from 'react';

export type User = {
	displayName: string;
	ChatRoomIdList: number[];
	avatar: string;
};
export type UserList = User[];
export type IncomingMessage = Message & {
	chatRoomId: number;
};

export type Message = {
	content: string;
	senderName: string;
	timestamp: Date;
	chatRoomId: number;
	type: number;
	type2: number;
};

export type ChatRoom = {
	members: string[];
	chatRoomId: number;
	messageList: string[];
	createAt: Date;
	lastModified: Date;
};
  
export type ChatRoomList = ChatRoom[];

export type ChatRoomListProps = {
	user?: User;
	userList: UserList;
	// userList: UserList;
	// setUserList: React.Dispatch<React.SetStateAction<UserList>>;
	chatRoomList: ChatRoomList;
	setChatRoomList: React.Dispatch<React.SetStateAction<ChatRoomList>>;
	selectedChatRoom: ChatRoom;
	setSelectedChatRoom: React.Dispatch<React.SetStateAction<ChatRoom>>;
};

export type ChatRoomProps = {
	user: User;
	userList: UserList;
	chatRoomList: ChatRoomList;
	selectedChatRoom: ChatRoom;
};

// const user : User = {
// 	displayName: "claire",
// 	ChatRoomIdList: [1],
// };

// const chatRoomList : ChatRoom[] = [
// 	{
// 		member: ["claire", "enip"],
// 		chatRoomId: 1,
// 		MessageList: [
// 			{
// 				content: "Hi",
// 				senderName: "enip",
// 				timestamp: new Date("2023-11-09"),
// 			},
// 			{
// 				content: "Hi",
// 				senderName: "claire",
// 				timestamp: new Date("2023-11-10"),
// 			}
// 		],
// 		timestamp: new Date("2023-11-10"),
// 		},
// 	];
	// const user : User = {
	// 	displayName: "claire",
	// 	ChatRoomList: [
		// 		{
			// 			member: ["claire", "enip"],
			// 			chatRoomId: 1,
	// 			MessageList: [
	// 				{
		// 					content: "Hi",
	// 					senderName: "enip",
	// 					timestamp: new Date("2023-11-09"),
	// 				},
	// 				{
		// 					content: "Hi",
	// 					senderName: "claire",
	// 					timestamp: new Date("2023-11-10"),
	// 				}
	// 			],
	// 			timestamp: new Date("2023-11-10"),
	// 		},
	// 	],
	// };
	// const UserList : UserList = [
		// 	{
			// 		displayName: "claire",
			// 		ChatRoomList: [
				// 			{
					// 				member: ["claire", "enip"],
	// 				chatRoomId: 1,
	// 				MessageList: [
	// 					{
	// 						content: "Hi",
	// 						senderName: "enip",
	// 						timestamp: new Date("2023-11-09"),
	// 					},
	// 					{
	// 						content: "Hi",
	// 						senderName: "claire",
	// 						timestamp: new Date("2023-11-10"),
	// 					}
	// 				],
	// 				timestamp: new Date("2023-11-10"),
	// 			},
	// 		],
	// 	},
	// 	{
	// 		displayName: "enip",
	// 		ChatRoomList: [
		// 			{
	// 				member: ["claire", "enip"],
	// 				chatRoomId: 1,
	// 				MessageList: [
		// 					{
	// 						content: "Hi",
	// 						senderName: "enip",
	// 						timestamp: new Date("2023-11-09"),
	// 					},
	// 					{
		// 						content: "Hi",
		// 						senderName: "claire",
		// 						timestamp: new Date("2023-11-10"),
	// 					}
	// 				],
	// 				timestamp: new Date("2023-11-10"),
	// 			},
	// 		],
	// 	},
	// ];\


	// const sampleUserList: UserList = [
//   {
//     displayName: "claire",
//     ChatRoomIdList: [1],
//   },
//   {
//     displayName: "enip",
//     ChatRoomIdList: [1],
//   },
// ];
// const sampleChatRoomList: ChatRoomList = [
//   {
//     member: ["claire", "enip"],
//     chatRoomId: 1,
//     MessageList: [
//       {
//         content: "Hi",
//         senderName: "enip",
//         timestamp: new Date("2023-11-09"),
//       },
//       {
//         content: "Hi",
//         senderName: "claire",
//         timestamp: new Date("2023-11-10"),
//       },
//     ],
//     timestamp: new Date("2023-11-10"),
//   },
// ];