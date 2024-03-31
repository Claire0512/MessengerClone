import { NextResponse } from 'next/server';

import { db } from '@/db';
import { usersTable } from '@/db/schema';

export async function GET() {
	try {
		const userList = await db.select().from(usersTable).execute();

		if (!userList) {
			return NextResponse.json({ error: 'No userList found' }, { status: 404 });
		}

		return NextResponse.json({ userList: userList }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
