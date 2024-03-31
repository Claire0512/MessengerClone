import { type NextRequest, NextResponse } from 'next/server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { usersTable } from '@/db/schema';

const createUserSchema = z.object({
	displayName: z.string().min(1).max(50),
	chatRoomIdList: z.array(z.number()).optional(),
	avatar: z.string().optional(),
});

export async function POST(request: NextRequest) {
	let data;
	try {
		data = await request.json();
		createUserSchema.parse(data); // 验证输入数据
	} catch (error) {
		return NextResponse.json({ error: 'Invalid request format or data' }, { status: 400 });
	}
	if (data.action === 'add') {
		const { displayName, chatRoomIdList } = data;

		try {
			const newUser = await db
				.insert(usersTable)
				.values({
					displayName,
					chatRoomIdList: chatRoomIdList || [],
				})
				.returning({ id: usersTable.id })
				.execute();
			////console.log("newUser: ", newUser);
			return NextResponse.json({ user: newUser }, { status: 201 });
		} catch (error) {
			return NextResponse.json({ error: 'Server error' }, { status: 500 });
		}
	} else if (data.action === 'updateAvatar') {
		//console.log('start updateAvatar');
		const { displayName, avatar } = data;
		//console.log('displayName: ', displayName);

		try {
			const updatedUser = await db
				.update(usersTable)
				.set({ avatar })
				.where(eq(usersTable.displayName, displayName))
				.returning({ id: usersTable.id })
				.execute();

			if (!updatedUser) {
				return NextResponse.json({ error: 'User not found' }, { status: 404 });
			}

			return NextResponse.json({ user: updatedUser }, { status: 200 });
		} catch (error) {
			//console.log('error: ', error);
			return NextResponse.json({ error: 'Server error' }, { status: 500 });
		}
	}
}

type GetParamsType = {
	params: {
		username: string;
	};
};
export async function GET(request: NextRequest, { params }: GetParamsType) {
	const displayName = params.username;
	////console.log("displayName: ", displayName);
	if (!displayName) {
		return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
	}

	try {
		const user = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.displayName, displayName))
			.execute();

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}
		////console.log("get user: ", user);
		return NextResponse.json({ user }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
