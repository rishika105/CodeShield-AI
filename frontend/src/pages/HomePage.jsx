import React from 'react'
import HeroSection from '../components/Home/HeroSection'
import FeaturesSection from '../components/Home/Features'
import HowItWorks from '../components/Home/HowItWorks'
import Testimonials from '../components/Home/TestimonialSection'
import CTA from '../components/Home/CTASection'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const HomePage = () => {
    return (
        <div className='flex flex-col'>
            <Navbar />
         <div className='flex flex-col space-y-16'>
         <HeroSection />
            <FeaturesSection />
            <HowItWorks />
            <Testimonials />
            <CTA />
         </div>
            <Footer />
        </div>
    )
}

export default HomePage
