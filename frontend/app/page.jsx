import { title, subtitle } from "@/components/primitives";
import { EnterURLForm } from "@/components/form"

export default function Home() {
	return (
		<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
			<div className="inline-block max-w-lg text-center justify-center">
				<h1 className={title()}>Your&nbsp;</h1>
				<h1 className={title({ color: "violet" })}>subscribe&nbsp;</h1>
				<h1 className={title()}>
					button for the internet.
				</h1>
				<h2 className={subtitle({ class: "mt-4" })}>
					Deliver historical posts for any blog to your inbox.
				</h2>
			</div>

			<div className="flex flex-row mt-4 w-1/3">
                <EnterURLForm/>
			</div>
		</section>
	);
}
