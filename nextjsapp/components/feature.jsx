import {Button, Link} from "@nextui-org/react";

function Feature() {
    return (
        <section className="body-font">
          <div className="container px-5 py-24 mx-auto">
            <h1 className="text-4xl mb-10 font-bold text-center">Why use sendittomy.email?</h1>
            
            <div className="flex items-center lg:w-3/5 mx-auto border-b pb-10 mb-10 border-gray-200 sm:flex-row flex-col">
              <div className="sm:w-32 sm:h-32 h-20 w-20 sm:mr-10 inline-flex items-center justify-center rounded-full bg-purple-100 text-purple-500 flex-shrink-0">
                <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="sm:w-16 sm:h-16 w-10 h-10" viewBox="0 0 24 24">
                  <circle cx="6" cy="6" r="3"></circle>
                  <circle cx="6" cy="18" r="3"></circle>
                  <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"></path>
                </svg>
              </div>
              <div className="flex-grow sm:text-left text-center mt-6 sm:mt-0">
                <h2 className="text-xl title-font font-medium mb-2">Cut out the never-ending now.</h2>
                <p className="leading-relaxed text-base">Most people consume content produced in the last 24 hours.</p>
                <p className="leading-relaxed text-base"> Forget about the latest viral tweet.</p>
                <p className="leading-relaxed text-base">Read writing that's stood the test of time.</p>
                <a className="mt-3 text-purple-500 inline-flex items-center" href="https://perell.com/essay/never-ending-now/">Read "The Never-Ending Now"
                </a>
              </div>
            </div>
            <div className="flex items-center lg:w-3/5 mx-auto border-b pb-10 mb-10 border-gray-200 sm:flex-row flex-col">
              <div className="sm:w-32 sm:h-32 h-20 w-20 sm:mr-10 inline-flex items-center justify-center rounded-full bg-purple-100 text-purple-500 flex-shrink-0">
                <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="sm:w-16 sm:h-16 w-10 h-10" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="flex-grow sm:text-left text-center mt-6 sm:mt-0">
                <h2 className="text-xl title-font font-medium mb-2">Learn from the best minds on the internet.</h2>
                <ul>
                    <li>- <a href="http://paulgraham.com" className="text-purple-500 underline">Paul Graham</a>, founder of Y-Combinator</li>
                    <li>- <a href="https://tim.blog" className="text-purple-500 underline">Tim Ferriss</a>, world-class meta-learner and author of 4 Hour Workweek</li>
                    <li>- <a href="https://seths.blog/" className="text-purple-500 underline">Seth Godin</a>, master marketer</li>
                </ul>
                <p className="leading-relaxed text-base mt-3">Don't miss out...</p>
                <a className="mt-3 text-purple-500 inline-flex items-center" href="/login">Get their posts, old and new, in your inbox today
                  <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-4 h-4 ml-2" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div className="flex items-center lg:w-3/5 mx-auto  sm:flex-row flex-col">
              <div className="sm:w-32 sm:h-32 h-20 w-20 sm:mr-10 inline-flex items-center justify-center rounded-full bg-purple-100 text-purple-500 flex-shrink-0">
                <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="sm:w-16 sm:h-16 w-10 h-10" viewBox="0 0 24 24">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <div className="flex-grow sm:text-left text-center mt-6 sm:mt-0">
                <h2 className="text-xl title-font font-medium mb-2">Take control of your information diet.</h2>
                <p className="leading-relaxed text-base">On social media, recommendation algorithms feed you junk food. Your email is different - you control what you see. By bringing the right content to your inbox, you optimize for knowledge over engagement.</p>
              </div>
            </div>
            <Button
                className="flex mx-auto mt-10 py-2 px-10 w-1/3 text-lg bg-purple-500 text-white hover:bg-purple-1000"
                size="lg"
                href="/login"
                as={Link}
            >
                I want a better information diet
            </Button>
          </div>
        </section>
     );
}

export default Feature;