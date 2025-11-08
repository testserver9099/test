import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-google-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-google-green/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-60 h-60 bg-google-yellow/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-60 h-60 bg-google-red/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 py-20 md:py-32">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <motion.div
            className="flex flex-col space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div>
              <motion.span
                className="inline-block px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary rounded-full mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                Your Arcade Partner
              </motion.span>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Elevate Your
                <br />
                <span className="text-gradient">Google Cloud</span>
                <br />
                Arcade Journey
              </motion.h1>

              <motion.p
                className="text-xl text-muted-foreground mb-8 max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Track progress, analyze achievements, and stay ahead in the Google Cloud Arcade with our powerful companion tool.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Button 
                className="google-button bg-primary text-white hover:bg-primary/90 h-12 px-8 text-base"
                onClick={() => {
                  const calculatorSection = document.getElementById('calculator-section');
                  calculatorSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                className="google-button h-12 px-8 text-base"
                onClick={() => {
                  const howToJoinSection = document.getElementById('how-to-join-section');
                  howToJoinSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-google-blue/20 rounded-lg rotate-12" />
              <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-google-yellow/20 rounded-full" />

              {/* Main image/graphic container */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-2 transform rotate-1">
                <div className="google-gradient p-1 rounded-xl">
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-google-red rounded-full" />
                      <div className="w-3 h-3 bg-google-yellow rounded-full" />
                      <div className="w-3 h-3 bg-google-green rounded-full" />
                    </div>

                    <div className="space-y-3">
                      <div className="h-8 bg-blue-50 dark:bg-slate-700 rounded-md w-3/4" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-100 dark:bg-slate-600 rounded w-full" />
                        <div className="h-4 bg-gray-100 dark:bg-slate-600 rounded w-5/6" />
                        <div className="h-4 bg-gray-100 dark:bg-slate-600 rounded w-4/6" />
                      </div>

                      <div className="mt-4 bg-blue-50 dark:bg-slate-700 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <div className="h-4 bg-blue-100 dark:bg-slate-600 rounded w-1/3" />
                          <div className="h-4 bg-blue-200 rounded w-1/6" />
                        </div>
                        <div className="h-6 bg-primary rounded-full w-3/4" />
                      </div>

                      <div className="flex justify-between mt-6">
                        <div className="h-8 bg-primary/20 rounded-full px-4 flex items-center justify-center w-28">
                          <div className="h-3 bg-primary rounded w-16" />
                        </div>
                        <div className="h-8 bg-google-green/20 rounded-full px-4 flex items-center justify-center w-20">
                          <div className="h-3 bg-google-green rounded w-10" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <div className="h-5 w-16 bg-google-blue/20 rounded-full mb-1" />
                <div className="h-3 w-10 bg-google-blue/10 rounded-full" />
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-google-green/20 rounded-full" />
                  <div className="h-4 w-10 bg-google-green/10 rounded-full" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
