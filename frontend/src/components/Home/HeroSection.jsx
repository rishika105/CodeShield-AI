import SplitText from "../SplitText";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const token = localStorage.getItem("token"); // Check if token exists in local storage
  return (
    <section className="relative bg-indigoDark-900 pt-32 pb-20 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] bg-[length:64px_64px]"></div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-gradient-radial from-neonPurple-500/30 to-transparent rounded-full filter blur-3xl opacity-20"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold  text-gradient-to-r from-neonCyan-400 to-neonBlue-400 leading-tight mb-6">

              <SplitText
                text="AI-Powered"
                className="bg-clip-text text-transparent bg-gradient-to-r from-neonCyan-400 to-neonBlue-400"
                delay={150}
                animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
                animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                easing="easeOutCubic"
                threshold={0.2}
                rootMargin="-50px"
              />

         <span className="bg-clip-text text-transparent bg-gradient-to-r from-neonCyan-400 to-neonBlue-400">
         Code Security
         </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300  mb-10 max-w-2xl mx-auto lg:mx-0">
              Detect vulnerabilities in your codebase instantly with our cutting-edge generative AI.
              Get actionable fixes and security enhancements tailored to your tech stack.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
           {
            token ? 
            (   <Link
              to="/security-scanner"
              className="rounded-md bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:opacity-90 transition-opacity duration-200"
            >
              Start Free Scan
            </Link>) : ( <Link
              to="/auth"
              className="rounded-md bg-gradient-to-r from-neonPurple-500 to-neonBlue-500 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:opacity-90 transition-opacity duration-200"
            >
              Start Free Scan
            </Link>)
           }
              <a
                href="#"
                className="rounded-md bg-indigoDark-700 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-indigoDark-600 transition-colors duration-200 border border-indigoDark-500"
              >
                See How It Works
              </a>
            </div>
          </div>

          <div className="lg:w-1/2 mt-16 lg:mt-0 relative">
            <div className="relative bg-indigoDark-800 rounded-2xl p-1 shadow-2xl border border-indigoDark-600">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-neonPurple-500/30 to-neonBlue-500/30 blur opacity-75"></div>
              <div className="relative bg-indigoDark-800 rounded-xl overflow-hidden">
                <div className="bg-indigoDark-700 px-4 py-3 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono ml-4">vulnerability-scanner.js</div>
                </div>
                <div className="p-4 font-mono text-sm">
                  <div className="text-gray-400">// AI detecting SQL injection vulnerability</div>
                  <div className="text-red-400 mt-2">⚠️ Vulnerability found: SQL Injection</div>
                  <div className="text-white mt-1">const query = `SELECT * FROM users WHERE id = userId`;</div>
                  <div className="text-green-400 mt-2">✅ AI Suggestion: Use parameterized queries</div>
                  <div className="text-white mt-1">const query = 'SELECT * FROM users WHERE id = ?';</div>
                  <div className="text-gray-400 mt-4">// AI-enhanced secure version</div>
                  <div className="text-white mt-1">db.query(query, [userId], (err, results) = {'{'}</div>
                  <div className="text-white ml-4">// handle results</div>
                  <div className="text-white">{'}'});</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-neonCyan-500 rounded-full filter blur-3xl opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;