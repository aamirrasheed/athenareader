const TestimonialImage1 = '/images/testimonial-1.jpg';
const TestimonialImage2 = '/images/testimonial-2.jpg';
const TestimonialImage3 = '/images/testimonial-3.jpg';

function Testimonials() {
    return ( <section className="">
    <div className="container px-5 py-10 mx-auto">
      <div className="flex flex-col text-center w-full mb-10">
        <h1 className="text-4xl font-medium title-font mb-4">Still Not Convinced?</h1>
        <p className="lg:w-2/3 mx-auto leading-relaxed text-base">Hear from people enjoying sendittomy.email!</p>
      </div>
      <div className="flex flex-wrap -m-4">
        <div className="lg:w-1/3 sm:w-1/2 p-4">
          <div className="flex relative h-64">
            <img alt="gallery" className="absolute inset-0 w-full h-full object-contain object-center" src={TestimonialImage1}/>
          </div>
        </div>
        <div className="lg:w-1/3 sm:w-1/2 p-4">
          <div className="flex relative h-64">
            <img alt="gallery" className="absolute inset-0 w-full h-full object-contain object-center" src={TestimonialImage2}/>
          </div>
        </div>
        <div className="lg:w-1/3 sm:w-1/2 p-4">
          <div className="flex relative h-64">
            <img alt="gallery" className="absolute inset-0 w-full h-full object-contain object-center" src={TestimonialImage3}/>
          </div>
        </div>
        
      </div>
    </div>
  </section> );
}

export default Testimonials;