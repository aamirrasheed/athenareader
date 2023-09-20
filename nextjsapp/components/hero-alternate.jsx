import { title, subtitle } from "@/components/primitives";
import { titles, subtitles } from "@/data/heroTexts";
import { Button, Link } from "@nextui-org/react";

function HeroAlternate() {
    return ( <section className="">
    <div className="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
      <div className="text-center lg:w-2/3 w-full">
        <h1 className={title({size : "lg"})}>{titles[1]}</h1>
        <p className={subtitle()}>{subtitles[1]}</p>
        <div className="flex justify-center mt-5">
            <Button
                className="text-lg bg-purple-500 text-white hover:bg-purple-1000"
                size="lg"
                href="/login"
                as={Link}
            >
                Sign Up
            </Button>
        </div>
      </div>
    </div>
  </section> );
}

export default HeroAlternate;