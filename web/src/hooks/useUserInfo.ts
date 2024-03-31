import { useMemo } from 'react';

import { useSearchParams } from 'next/navigation';

export default function useUserInfo() {
	const searchParams = useSearchParams();
	const username = useMemo(() => searchParams.get('username'), [searchParams]);

	return {
		username,
	};
}
