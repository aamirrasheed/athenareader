import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import {UrlForm} from "@/components/urlForm";
import { Button, Input } from "@nextui-org/react";
import { useState } from "react";
import { useRouter } from "next/router";

export default function IndexPage() {
    const [blogUrl, setBlogUrl] = useState("")
    
    const router = useRouter();

    const handleInputChange = (e) => {
        setBlogUrl(e.target.value)
    }

    let handleOnClick = () => {
        const queryParams = {
            url: blogUrl
        }
        router.push({
            pathname: "/onboarding",
            query: queryParams
        })
    }

    let handleKeyDown = (e) => {
        if (e.key == "Enter"){
            handleOnClick()
        }
    }

	return (
		<DefaultLayout>
			<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 mt-8">
			<div className="inline-block max-w-lg text-center justify-center">
				<h1 className={title({ color: "violet" })}>Subscribe&nbsp;</h1>
				<h1 className={title()}>
					to anything on the internet.
				</h1>
				<h2 className={subtitle({ class: "mt-4" })}>
					Historical posts for any blog, straight to your inbox.
				</h2>
			</div>

			<div className="flex flex-row mt-4 w-1/3">
                <Input
                    placeholder="Enter the URL of your favorite blog..."
                    className="w-full"
                    name="url"
                    id="url"
                    isClearable={false}
                    value={blogUrl}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
                <div className="w-5"/>
                <Button color="primary" onClick={handleOnClick}>
                    Get posts
                </Button>
			</div>
		</section>
		</DefaultLayout>
	);
}
