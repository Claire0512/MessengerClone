import React from 'react';

import { Toaster } from '@/components/ui/toaster';
import { MessagesProvider } from '@/context/message';

type Props = {
	children: React.ReactNode;
};

const layout = ({ children }: Props) => {
	return (
		<div className="flex flex-col">
			{/* <SideBar /> */}
			<MessagesProvider>{children}</MessagesProvider>
			<Toaster />
		</div>
	);
};

export default layout;
