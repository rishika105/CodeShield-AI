const HowItWorks = () => {
    const steps = [
      {
        number: "01",
        title: "Upload or Connect",
        description: "Connect your repository or upload code directly. We support GitHub, GitLab, Bitbucket, and more.",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.353 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304zm-7.389 4.267a.75.75 0 011-.353 5.25 5.25 0 011.449 8.45l-4.5 4.5a5.25 5.25 0 11-7.424-7.424l1.757-1.757a.75.75 0 111.06 1.06l-1.757 1.757a3.75 3.75 0 105.304 5.304l4.5-4.5a3.75 3.75 0 00-1.035-6.037.75.75 0 01-.354-1z" clipRule="evenodd" />
          </svg>
        )
      },
      {
        number: "02",
        title: "AI Code Analysis",
        description: "Our AI scans your code, understanding context to find vulnerabilities static analysis misses.",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M11.644 1.59a.75.75 0 01.712 0l9.75 5.25a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.712 0l-9.75-5.25a.75.75 0 010-1.32l9.75-5.25z" />
            <path d="M3.265 10.602l7.668 4.129a2.25 2.25 0 002.134 0l7.668-4.13 1.37.739a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.71 0l-9.75-5.25a.75.75 0 010-1.32l1.37-.738z" />
            <path d="M10.933 19.231l-7.668-4.13-1.37.739a.75.75 0 000 1.32l9.75 5.25c.221.12.489.12.71 0l9.75-5.25a.75.75 0 000-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 01-2.134-.001z" />
          </svg>
        )
      },
      {
        number: "03",
        title: "Get Actionable Results",
        description: "Receive detailed reports with prioritized vulnerabilities and AI-generated fixes.",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M9 1.5H5.625c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5zm6.61 10.936a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 14.47a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
          </svg>
        )
      },
      {
        number: "04",
        title: "Continuous Monitoring",
        description: "We monitor your codebase for new vulnerabilities and alert you in real-time.",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
          </svg>
        )
      }
    ];
  
    return (
      <section className="py-20 bg-gradient-to-b from-indigoDark-800 to-indigoDark-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] bg-[length:64px_64px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-satoshi text-white mb-4">
              How <span className="bg-clip-text text-transparent bg-gradient-to-r from-neonCyan-400 to-neonBlue-400">CodeShield</span> Works
            </h2>
            <p className="text-lg text-gray-300 font-inter max-w-3xl mx-auto">
              Our AI-powered security platform integrates seamlessly into your development workflow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-indigoDark-600 hidden lg:block"></div>
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 hidden lg:block"></div>
            
            {steps.map((step, index) => (
              <div 
                key={index}
                className="relative bg-indigoDark-700/50 rounded-xl p-6 border border-indigoDark-600 hover:border-neonPurple-400 transition-all duration-300 group"
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 flex items-center justify-center text-white font-bold font-satoshi">
                  {step.number}
                </div>
                <div className="w-12 h-12 rounded-lg bg-indigoDark-600 group-hover:bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 flex items-center justify-center mb-4 transition-all duration-300 ml-6">
                  <div className="text-white group-hover:text-white">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold font-satoshi text-white mb-2">{step.title}</h3>
                <p className="text-gray-300 font-inter">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default HowItWorks;