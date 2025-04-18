import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import Navbar from '../components/Navbar';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
    <div className='absolute top-7 left-9'>
    <Navbar />
    </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-96 bg-gradient-radial from-neonPurple-500/30 to-transparent rounded-full filter blur-3xl opacity-20"></div>
      <div className="relative mx-auto px-0 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center">
          <div className="w-[320px] lg:w-[500px] mt-10">
            <div className="relative bg-indigoDark-800 rounded-2xl p-8 shadow-2xl border border-indigoDark-600">
              {/* Glow effect */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-neonPurple-500/30 to-neonBlue-500/30 blur opacity-75"></div>

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold  text-white mb-2">
                    {isLogin ? (
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-neonCyan-400 to-neonBlue-400">
                        Welcome Back
                      </span>
                    ) : (
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-neonPurple-400 to-neonBlue-400">
                        Join Our Community
                      </span>
                    )}
                  </h1>
                  <p className="text-gray-300 ">
                    {isLogin ? 'Secure your code with AI' : 'Start your security journey'}
                  </p>
                </div>

                {isLogin ? <LoginForm /> : <RegisterForm />}

                <div className="mt-6 text-center">
                  <p className="text-gray-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-neonPurple-400 hover:text-neonPurple-300 font-medium transition-colors duration-200"
                    >
                      {isLogin ? 'Register now' : 'Login here'}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;