import DefaultLayout from "@/layouts/default";
import LayoutAlternate from "@/layouts/layout-alternate";
import HeroOriginal from "@/components/hero-original";
import HeroAlternate from "@/components/hero-alternate";
import Testimonials from '@/components/testimonials';
import Feature from '@/components/feature';
import HowItWorks from '@/components/howItWorks';
import YoutubeEmbed from '@/components/youtubeEmbed';

import {parse} from 'url';

export default function IndexPage() {

	return (
		<LayoutAlternate>
            <HeroAlternate />
            <HowItWorks />
            <YoutubeEmbed />
            <Feature />
            <Testimonials />
		</LayoutAlternate>
	);
}

// import mixpanel from "@/utils/mixpanel"

// // Mixpanel analytics
// export async function getServerSideProps({ req }) {
//     console.log(
//         "getServerSideProps called with req.url: ",
//         req.url
//     )
//     const {query} = parse(req.url, true)
//     const source = query.source || req.headers.referer || 'direct';
//     mixpanel.track('Homepage Visited', {
//         page: req.url,
//         source: source
//     });
//     return {
//         props: {}
//     }
// }
