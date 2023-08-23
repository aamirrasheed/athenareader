import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Button, Link } from "@nextui-org/react";

export default function IndexPage() {

	return (
		<DefaultLayout>
			<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 mt-8">
			<div className="inline-block max-w-lg text-center justify-center">
				<h1 className={title({ color: "violet" })}>Subscribe&nbsp;</h1>
				<h1 className={title()}>
					to anything on the internet.
				</h1>
				<h2 className={subtitle({ class: "mt-4" })}>
					Historical posts for any website, straight to your inbox.
				</h2>
			</div>

			<div className="flex flex-row mt-4 w-1/3 justify-center">
                <Button 
                    color="primary"
                    href="/login"
                    as={Link}
                >
                    Get Started
                </Button>
			</div>
		</section>
		</DefaultLayout>
	);
}
