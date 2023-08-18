import { useEffect } from "react";
import "@/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { fontSans, fontMono } from "@/config/fonts";

import { initializeApp } from "firebase/app";
import { firebaseConfig }  from '@/utils/firebase'
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

initializeApp(firebaseConfig)

function App({ Component, pageProps }) {
    useEffect(() => {
        // initialize firebase

        // make sure all auth actions persist state across browser windows
        const auth = getAuth()
        setPersistence(auth, browserLocalPersistence)
    })
	return (
        <NextUIProvider>
            <NextThemesProvider>
                <Component {...pageProps} />
            </NextThemesProvider>
        </NextUIProvider>
	);
}

export default App;

export const fonts = {
	sans: fontSans.style.fontFamily,
	mono: fontMono.style.fontFamily,
};
