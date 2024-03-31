import React from 'react';

import type { User } from '@/package/types';

type Props = {
	displayName?: User['displayName'];
	classname?: string;
};

function Avatar({ displayName, classname }: Props) {
	return (
		<div className={`flex items-center justify-center rounded-full ${classname}`}>
			<span className="text-sm font-semibold">{displayName?.charAt(0).toUpperCase()}</span>
		</div>
	);
}

export default Avatar;
