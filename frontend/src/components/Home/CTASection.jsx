const CTA = () => {
    return (
      <section className="py-20 bg-gradient-to-r from-indigoDark-700 to-indigoDark-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] bg-[length:64px_64px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-indigoDark-900 rounded-2xl p-8 md:p-12 border border-indigoDark-600 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-neonPurple-500 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-neonBlue-500 rounded-full filter blur-3xl opacity-20"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-satoshi text-white mb-6">
                Ready to <span className="bg-clip-text text-transparent bg-gradient-to-r from-neonCyan-400 to-neonBlue-400">Secure Your Code</span> with AI?
              </h2>
              <p className="text-lg text-gray-300 font-inter max-w-3xl mx-auto mb-8">
                Join thousands of developers who trust CodeShield to find and fix vulnerabilities before they reach production.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#"
                  className="rounded-md bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 px-8 py-3 text-lg font-semibold text-white shadow-lg hover:opacity-90 transition-opacity duration-200"
                >
                  Start Free Trial
                </a>
                <a
                  href="#"
                  className="rounded-md bg-indigoDark-700 px-8 py-3 text-lg font-semibold text-white shadow-lg hover:bg-indigoDark-600 transition-colors duration-200 border border-indigoDark-500"
                >
                  Schedule Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default CTA;