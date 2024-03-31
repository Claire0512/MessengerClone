'use client';

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

function validateUsername(username?: string | null) {
	if (!username) return false;
	return /^[a-zA-Z0-9 ]{1,50}$/.test(username);
}

function SignInForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	// const [dialogOpen, setDialogOpen] = useState(false);
	const [username, setUsername] = useState('');
	const [usernameError, setUsernameError] = useState(false);

	useEffect(() => {
		const initialUsername = searchParams.get('username');
		setUsername(initialUsername ?? '');
		// setDialogOpen(!validateUsername(initialUsername));
	}, [searchParams]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const isUsernameValid = validateUsername(username);
		setUsernameError(!isUsernameValid);

		if (!isUsernameValid) {
			// setDialogOpen(true);
			return;
		}

		const params = new URLSearchParams(searchParams);
		params.set('username', username);

		const response = await fetch(`/api/users/${username}`);

		if (!response.ok) {
			throw new Error('Failed to get user');
		}

		const data = await response.json();

		if (!data.user[0]) {
			//console.log("start register: ", username);
			const res = await fetch(`/api/users/${username}`, {
				method: 'POST',
				body: JSON.stringify({
					displayName: username,
					chatRoomList: [],
					action: 'add',
				}),
			});
			if (!res.ok) {
				throw new Error('Failed to register');
			}
		}
		// setDialogOpen(false);
		router.push(`/chat?${params.toString()}`);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex w-2/3 flex-col gap-4 rounded-xl border p-6 shadow-lg md:w-1/2 lg:w-1/3">
			<div className="flex">
				<h1 className="text-xl font-normal">User Name</h1>
			</div>
			<div className="flex flex-col items-start">
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="Enter your username..."
					className="w-full rounded-md border-[1.5px] p-1 outline-none transition duration-200 ease-in-out focus:border-gray-600"
				/>
				{usernameError && (
					<p className="ml-[0.5px mt-4">
						Invalid username. Please enter a valid username.
					</p>
				)}
			</div>
			<div>
				<p className="text-clip text-sm font-light text-gray-400">
					This is your public display name.
				</p>
			</div>
			<div className="flex w-full justify-end">
				<button
					type="submit"
					className="rounded-lg bg-black px-4 py-2 text-sm text-white transition duration-200 ease-in-out hover:bg-gray-700">
					Sign In
				</button>
			</div>
		</form>
	);
}

export default SignInForm;
