import SignInForm from '@/components/SignInForm';

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between">
			<div className="flex h-screen w-full items-center justify-center">
				<SignInForm />
			</div>
		</main>
	);
}
