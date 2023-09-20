import DefaultLayout from "@/layouts/default";
import LayoutAlternate from "@/layouts/layout-alternate";
import HeroOriginal from "@/components/hero-original";
import HeroAlternate from "@/components/hero-alternate";
import Testimonials from '@/components/testimonials';
import Feature from '@/components/feature';
import HowItWorks from '@/components/howItWorks';
import YoutubeEmbed from '@/components/youtubeEmbed';

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

import mixpanel from "@/utils/mixpanel"

// Mixpanel analytics
export async function getServerSideProps({ context }) {
    mixpanel.track('Homepage Visited', {
        page: context.req.url
    });
    return {
        props: {}
    }
}
