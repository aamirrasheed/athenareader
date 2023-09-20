import {
	Navbar as NextUINavbar,
	NavbarContent,
	NavbarBrand,
	NavbarItem,
    Button,
    Link
} from "@nextui-org/react";

import { link as linkStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import NextLink from "next/link";
import clsx from "clsx";

import { Logo } from "@/components/icons";
import { useRouter } from "next/router";

import { ThemeSwitch } from "./theme-switch";

export const Navbar = () => {
    const router = useRouter()
    
	return (
		<NextUINavbar maxWidth="xl" position="sticky">
			<NavbarContent className="flex justify-between basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand className="gap-3 max-w-fit">
                    <NextLink className="flex justify-start items-center gap-1" href="/">
                        <Logo />
                        <p className="font-bold text-inherit">sendittomy.email</p>
                    </NextLink>
                </NavbarBrand>
                
			</NavbarContent>
            <div className="justify-end gap-4 ml-2">
                <Button
                    href="/app"
                    as={Link}
                    className="bg-purple-500 text-white"
                    showAnchorIcon
                    variant="solid"
                >
                    Open Dashboard
                </Button>
            </div>
		</NextUINavbar>
	);
};
