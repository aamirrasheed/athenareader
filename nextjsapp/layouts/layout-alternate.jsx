import { Head } from "./head";
import {Footer} from "./footer";
import { Navbar } from "@/components/navbar";
export default function LayoutAlternate ({ children }) {
    return (
        <>
            {/* <div className="bg-orange-800 text-white p-4 text-center">
                Athenareader has been sunsetted - contact <a href="https://twitter.com/aamir1rasheed" className="underline">Aamir</a> if you're interested in this product
            </div> */}
            <Head />
            <Navbar />
            <main>{children}</main>
            <Footer />
        </>
    );
}
