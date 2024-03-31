import React, { useState, useEffect, useContext } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { ExitIcon, DiscordLogoIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MessagesContext } from '@/context/message';
import useUserInfo from '@/hooks/useUserInfo';
import type { User } from '@/package/types';

function SideBar({ user }: { user: User }) {
	const router = useRouter();
	const { username } = useUserInfo();
	const [avatarUrl, setAvatarUrl] = useState('https://github.com/shadcn.png'); // 默认头像URL
	const [isOpen, setIsOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null); // Track selected file
	const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
	const { user_list_updates } = useContext(MessagesContext);
	useEffect(() => {
		// If userAvatar exists, set it as the avatar URL
		if (user.avatar) {
			setAvatarUrl(user.avatar);
		}
	}, [user.avatar]);

	const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			const file = event.target.files[0];
			setSelectedFile(file);

			// Read the selected file as base64
			const reader = new FileReader();
			reader.onload = (e) => {
				const base64String = e.target?.result as string;
				setAvatarBase64(base64String);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleUpload = async () => {
		if (!selectedFile || !avatarBase64) {
			return;
		}

		// Send the base64 string to your API
		try {
			const res = await fetch(`/api/users/${username}`, {
				method: 'POST',
				body: JSON.stringify({
					displayName: username,
					avatar: avatarBase64,
					action: 'updateAvatar',
				}),
			});

			if (res.ok) {
				//console.log('Success!');
				// router.push(`/chat?username=${username}`);
				// router.reload();
				// Handle the response here
				user_list_updates();
				window.location.reload();
			} else {
				//console.log('Fail QQ');
				// Handle error response
			}
		} catch (error) {
			//console.error('Error: ', error);
			// Handle network or other errors
		}
		//user_list_updates();
		setIsOpen(false);
	};

	const clearSelectedFile = () => {
		setSelectedFile(null); // Clear the selected file
		setAvatarBase64(null); // Clear the base64 string
	};

	return (
		<aside className="flex h-screen flex-col justify-between bg-gray-200 p-4">
			<div className="flex items-center justify-start">
				<DiscordLogoIcon className="mr-2 h-8" />
				<h1>Discord</h1>
			</div>

			<div className="flex items-center justify-between">
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogTrigger asChild>
						<div className="relative">
							<Image
								src={avatarUrl}
								alt="User avatar"
								width={56} // Width in pixels
								height={56} // Height in pixels
								className="cursor-pointer rounded-full" // Adjust the height and width here
								onClick={() => setIsOpen(true)}
							/>
						</div>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Change Avatar</DialogTitle>
							<DialogDescription>
								Would you like to change your avatar?
							</DialogDescription>
						</DialogHeader>
						<Input id="avatar" type="file" onChange={handleAvatarChange} />
						{selectedFile && (
							<DialogFooter className="sm:justify-start">
								<Button type="button" variant="secondary" onClick={handleUpload}>
									Upload
								</Button>
								<Button
									type="button"
									variant="secondary"
									onClick={clearSelectedFile}>
									Cancel
								</Button>
							</DialogFooter>
						)}
					</DialogContent>
				</Dialog>

				<div>{username}</div>
				<button onClick={() => router.push('/')}>
					<ExitIcon className="h-6 w-6" />
				</button>
			</div>
		</aside>
	);
}

export default SideBar;
