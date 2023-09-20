import { Head } from "./head";
import {Footer} from "./footer";
import { Navbar } from "@/components/navbar";
export default function LayoutAlternate ({ children }) {
    return (
        <>
            <Head />
            <Navbar />
            <main>{children}</main>
            <Footer />
        </>
    );
}
