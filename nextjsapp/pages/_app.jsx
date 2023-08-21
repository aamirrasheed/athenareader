import { useEffect } from "react";
import "@/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { fontSans, fontMono } from "@/config/fonts";

// import { initializeApp } from "firebase/app";
// import { firebaseConfig }  from '@/utils/firebase'
// import { getAuth, setPersistence, browserLocalPersistence, signInWithEmailLink } from "firebase/auth";



function App({ Component, pageProps }) {
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
