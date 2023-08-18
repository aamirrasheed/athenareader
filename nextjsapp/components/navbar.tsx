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

export const Navbar = () => {
    const router = useRouter()
    const handleClick = () => {
        router.push('/app')
    }
	return (
		<NextUINavbar maxWidth="xl" position="sticky">
			<NavbarContent className="basis-1/5 sm:basis-full" justify="start">
				<NavbarBrand className="gap-3 max-w-fit">
					<NextLink className="flex justify-start items-center gap-1" href="/">
						<Logo />
						<p className="font-bold text-inherit">SITME</p>
					</NextLink>
				</NavbarBrand>
				<div className="hidden lg:flex gap-4 justify-start ml-2">
					{siteConfig.navItems.map((item) => (
						<NavbarItem key={item.href}>
							<NextLink
								className={clsx(
									linkStyles({ color: "foreground" }),
									"data-[active=true]:text-primary data-[active=true]:font-medium"
								)}
								color="foreground"
								href={item.href}
							>
								{item.label}
							</NextLink>
						</NavbarItem>
					))}
				</div>
                <div className="justify-end gap-4 ml-2">
                    <Button
                        href="/app"
                        as={Link}
                        color="primary"
                        showAnchorIcon
                        variant="solid"
                    >
                        Open App
                    </Button>
                </div>
			</NavbarContent>
		</NextUINavbar>
	);
};
