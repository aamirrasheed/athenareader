import {title} from "@/components/primitives";
function HowItWorks() {
    return ( 
    <section className="body-font">
        <div className="text-center">
        <h1 className={title({ size: "sm"})}>It's dead simple. Here's how it works:</h1>
        </div>
    <div className="container px-5 py-12 mx-auto flex flex-col items-center">
        <div className="flex flex-col w-3/4 md:w-1/2 mb-12 items-left">
            <div className="flex relative pt-10 pb-20 sm:items-center">
                <div className="h-full w-8 absolute inset-0 flex items-center justify-center">
                <div className="h-full w-1 bg-gray-200 pointer-events-none"></div>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full mt-10 sm:mt-0 inline-flex items-center justify-center bg-purple-500 text-white relative z-10 title-font font-medium text-sm">1</div>
                <div className="flex-grow pl-6 flex sm:items-center items-start flex-col sm:flex-row">
                
                <div className="flex-grow sm:pl-6 mt-6 sm:mt-0">
                    <h2 className="font-medium title-font mb-1 text-xl">Enter the URLs of your favorite blogs.</h2>
                </div>
                </div>
            </div>
            <div className="flex relative pb-20 sm:items-center">
                <div className="h-full w-8 absolute inset-0 flex items-center justify-center">
                <div className="h-full w-1 bg-gray-200 pointer-events-none"></div>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full mt-10 sm:mt-0 inline-flex items-center justify-center bg-purple-500 text-white relative z-10 title-font font-medium text-sm">2</div>
                <div className="flex-grow pl-6 flex sm:items-center items-start flex-col sm:flex-row">
                
                <div className="flex-grow sm:pl-6 mt-6 sm:mt-0">
                    <h2 className="font-medium title-font mb-1 text-xl">sendittomy.email indexes all existing posts.</h2>
                </div>
                </div>
            </div>
            <div className="flex relative pb-20 sm:items-center ">
                <div className="h-20 w-8 absolute inset-0 flex items-center justify-center">
                <div className="h-full w-1 bg-gray-200 pointer-events-none"></div>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full mt-10 sm:mt-0 inline-flex items-center justify-center bg-purple-500 text-white relative z-10 title-font font-medium text-sm">3</div>
                <div className="flex-grow pl-6 flex sm:items-center items-start flex-col sm:flex-row">
                <div className="flex-grow sm:pl-6 mt-6 sm:mt-0">
                    <h2 className="font-medium title-font  mb-1 text-xl">You receive posts in your inbox.</h2>
                </div>
                </div>
            </div>
        </div>
    </div>
  </section> );
}

export default HowItWorks;