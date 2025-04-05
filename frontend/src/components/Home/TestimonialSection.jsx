const Testimonials = () => {
    const testimonials = [
      {
        quote: "CodeShield found vulnerabilities in our codebase that three other scanners missed. The AI-generated fixes saved us weeks of work.",
        name: "Sarah Johnson",
        title: "CTO, FinTech Startup",
        avatar: "https://t4.ftcdn.net/jpg/03/83/25/83/360_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg"
      },
      {
        quote: "The contextual understanding of our code is remarkable. It's like having a senior security engineer reviewing every pull request.",
        name: "Michael Chen",
        title: "Lead Developer, SaaS Platform",
        avatar: "https://plus.unsplash.com/premium_photo-1690579805307-7ec030c75543?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGVyc29uJTIwaWNvbnxlbnwwfHwwfHx8MA%3D%3D"
      },
      {
        quote: "Our security posture improved dramatically within weeks of implementing CodeShield. The compliance reports made our audit.",
        name: "David Rodriguez",
        title: "Security Director, Healthcare Tech",
        avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDNOMwSZ4zInMObf5-mt9WKutGTM09q1ifXYyKVX5Xwz_VnGJVaz9Hrpw1S6eRzjc5yhc&usqp=CAU"
      }
    ];
  
    return (
      <section className="py-20 bg-indigoDark-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] bg-[length:64px_64px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold  text-white mb-4">
              Trusted by <span className="bg-clip-text text-transparent bg-gradient-to-r from-neonCyan-400 to-neonBlue-400">Developers</span> Worldwide
            </h2>
            <p className="text-lg text-gray-300  max-w-3xl mx-auto">
              Join thousands of teams who've made their codebases more secure with AI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-indigoDark-800 rounded-xl p-8 border border-indigoDark-600 hover:border-neonPurple-400 transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-200  italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-indigoDark-700 overflow-hidden mr-4">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-white  font-bold">{testimonial.name}</h4>
                    <p className="text-gray-400  text-sm">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default Testimonials;