const FeaturesSection = () => {
    const features = [
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" clipRule="evenodd" />
            <path d="M5.26 17.242a.75.75 0 10-.897-1.203 5.243 5.243 0 00-2.05 5.022.75.75 0 00.625.627 5.243 5.243 0 005.022-2.051.75.75 0 10-1.202-.897 3.744 3.744 0 01-3.008 1.51c0-1.23.592-2.323 1.51-3.008z" />
          </svg>
        ),
        title: "AI-Powered Analysis",
        description: "Our generative AI models understand code context to detect vulnerabilities traditional scanners miss."
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
          </svg>
        ),
        title: "Real-Time Protection",
        description: "Get instant alerts when new vulnerabilities are detected in your running applications."
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
          </svg>
        ),
        title: "Comprehensive Reports",
        description: "Detailed vulnerability reports with risk assessment and prioritized remediation steps."
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M14.447 3.027a.75.75 0 01.527.92l-4.5 16.5a.75.75 0 01-1.448-.394l4.5-16.5a.75.75 0 01.921-.526zM16.72 6.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 010-1.06zm-9.44 0a.75.75 0 010 1.06L2.56 12l4.72 4.72a.75.75 0 11-1.06 1.06L.97 12.53a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
        ),
        title: "Multi-Language Support",
        description: "Works with JavaScript, Python, Java, C#, Go, and more with specialized detection rules for each."
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
          </svg>
        ),
        title: "Developer Friendly",
        description: "Integrates with your workflow via CLI, IDE plugins, CI/CD pipelines, and chat platforms."
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M5.566 4.657A4.505 4.505 0 016.75 4.5h10.5c.41 0 .806.055 1.183.157a3 3 0 00-1.85-1.153L16.5 2.25H7.5l-.543.21A3 3 0 005.566 4.657zM2.25 7.5a3 3 0 013-3h13.5a3 3 0 013 3v9a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-9zM5.25 6a1.5 1.5 0 00-1.5 1.5v.75c0 .028.004.055.012.082a1.5 1.5 0 001.488 1.418h.75a1.5 1.5 0 001.5-1.5V7.5a1.5 1.5 0 00-1.5-1.5H5.25zm10.5 0a1.5 1.5 0 00-1.5 1.5v.75a1.5 1.5 0 001.5 1.5h.75a1.5 1.5 0 001.5-1.5V7.5a1.5 1.5 0 00-1.5-1.5h-.75zM5.25 12a1.5 1.5 0 00-1.5 1.5v.75a1.5 1.5 0 001.5 1.5h.75a1.5 1.5 0 001.5-1.5v-.75a1.5 1.5 0 00-1.5-1.5H5.25zm10.5 0a1.5 1.5 0 00-1.5 1.5v.75a1.5 1.5 0 001.5 1.5h.75a1.5 1.5 0 001.5-1.5v-.75a1.5 1.5 0 00-1.5-1.5h-.75z" />
          </svg>
        ),
        title: "Compliance Ready",
        description: "Pre-configured rules for OWASP Top 10, CWE, PCI DSS, HIPAA, and GDPR requirements."
      },
    ];
  
    return (
      <section className="py-20 bg-indigoDark-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] bg-[length:64px_64px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-satoshi text-white mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-neonCyan-400 to-neonBlue-400">
                Next-Gen
              </span>{' '}
              Security Features
            </h2>
            <p className="text-lg text-gray-300 font-inter max-w-3xl mx-auto">
              Our AI-driven platform goes beyond traditional scanners to provide comprehensive protection 
              throughout your development lifecycle.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-indigoDark-700/50 rounded-xl p-6 border border-indigoDark-600 hover:border-neonPurple-400 transition-all duration-300 hover:shadow-lg hover:shadow-neonPurple-500/10"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 flex items-center justify-center mb-4">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold font-satoshi text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300 font-inter">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default FeaturesSection;