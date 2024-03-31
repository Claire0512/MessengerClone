import React from 'react';

import { UserProvider } from '@/context/user';

type Props = {
	children: React.ReactNode;
};

function Providers({ children }: Props) {
	return (
		<>
			<UserProvider>{children}</UserProvider>
		</>
	);
}

export default Providers;
