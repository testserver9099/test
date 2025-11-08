import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import {
  IconNumber1,
  IconNumber2,
  IconNumber3,
  IconNumber4,
  IconUserPlus,
  IconCloud,
  IconSchool,
  IconChartBar
} from '@tabler/icons-react';

interface StepItemProps {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  numberIcon: React.ReactNode;
  delay: number;
  inView: boolean;
  link?: string;
  showButton?: boolean;
}

function StepItem({ step, title, description, icon, numberIcon, delay, inView, link, showButton }: StepItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-start gap-4"
    >
      <div className="flex-shrink-0">
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
            style={{
              background: `linear-gradient(135deg, hsl(var(--chart-${step})) 0%, hsl(var(--chart-${step})/0.8) 100%)`,
              color: 'white'
            }}
          >
            {icon}
          </div>
          <div className="absolute -top-2 -left-2 bg-white dark:bg-gray-700 p-1 rounded-full shadow-sm">
            {numberIcon}
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        {showButton && (
          link ? (
            <Button
              variant="link"
              className="px-0 h-auto text-primary font-medium mt-1"
              asChild
            >
              <a href={link} target="_blank" rel="noopener noreferrer">
                Get Started →
              </a>
            </Button>
          ) : (
            <Button
              variant="link"
              className="px-0 h-auto text-primary font-medium mt-1"
            >
              Get Started →
            </Button>
          )
        )}
      </div>
    </motion.div>
  );
}

export function HowToJoinSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const steps = [
    {
      step: 1,
      title: "Create Account",
      description: "Sign up on Cloud Skills Boost with a public profile.",
      icon: <IconUserPlus size={20} />,
      numberIcon: <IconNumber1 size={14} />,
      link: "https://www.skills.google/users/sign_up",
      showButton: true
    },
    {
      step: 2,
      title: "Subscribe",
      description: "Subscribe to Google Cloud Arcade program.",
      icon: <IconCloud size={20} />,
      numberIcon: <IconNumber2 size={14} />,
      link: "https://docs.google.com/forms/d/e/1FAIpQLSd3lpkeM1LCUOm5sioRI2K8BpAENeynh-A2PBS_cI9Tyizq2w/viewform",
      showButton: true
    },
    {
      step: 3,
      title: "Start Learning",
      description: "Begin your journey on Google Cloud Arcade.",
      icon: <IconSchool size={20} />,
      numberIcon: <IconNumber3 size={14} />,
      link: "https://go.cloudskillsboost.google/arcade",
      showButton: true
    },
    {
      step: 4,
      title: "Track Progress",
      description: "Monitor your progress through Arcade Insider emails.",
      icon: <IconChartBar size={20} />,
      numberIcon: <IconNumber4 size={14} />,
      showButton: true
    }
  ];

  return (
    <section id="how-to-join-section" className="py-16">
      <div className="container">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                How to Join <span className="text-gradient">Google Cloud Arcade</span>
              </h2>

              <div className="relative">
                <div className="aspect-square max-w-md rounded-2xl overflow-hidden shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-google-blue/30 to-google-green/30 mix-blend-multiply" />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                  >
                    <div className="relative w-36 h-36">
                      <div className="absolute inset-0 rounded-full bg-google-blue/20 animate-ping" style={{ animationDuration: '3s' }} />
                      <div className="absolute inset-0 rounded-full bg-google-blue/30" />
                      <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="font-bold text-2xl text-google-blue">Begin</div>
                          <div className="text-xs text-muted-foreground">Your Adventure</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Decorative elements */}
                  <motion.div
                    className="absolute top-10 left-10"
                    animate={{
                      rotate: [0, 10, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  >
                    <div className="w-16 h-16 rounded-full bg-google-yellow/40 blur-md" />
                  </motion.div>

                  <motion.div
                    className="absolute bottom-16 right-20"
                    animate={{
                      rotate: [0, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  >
                    <div className="w-20 h-20 rounded-full bg-google-red/30 blur-md" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="md:col-span-7">
            <div className="space-y-8">
              {steps.map((item, index) => (
                <StepItem
                  key={item.step}
                  step={item.step}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  numberIcon={item.numberIcon}
                  delay={0.2 + (index * 0.1)}
                  inView={inView}
                  link={item.link}
                  showButton={item.showButton}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
