import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { IconBrandDiscord, IconBrandTelegram, IconBrandGithub } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface ContactSectionProps {
  accountsAnalyzedCountFromHome: number;
}

const INITIAL_VISITOR_COUNT = 3000;
const INITIAL_ACCOUNTS_ANALYZED_DISPLAY = 2800; // Fallback for display if prop isn't ready, though prop should be safe

export function ContactSection({ accountsAnalyzedCountFromHome }: ContactSectionProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [visitorCount, setVisitorCount] = useState(INITIAL_VISITOR_COUNT);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Increment visitor count on every page load
    const incrementVisitor = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/stats/visitor', {
          method: 'POST',
        });
        const data = await response.json();
        setVisitorCount(data.visitors);
      } catch (error) {
        console.error('Error incrementing visitor count:', error);
        // Fetch current stats as fallback
        try {
          const response = await fetch('http://localhost:3001/api/stats');
          const data = await response.json();
          setVisitorCount(data.visitors);
        } catch (err) {
          console.error('Error fetching stats:', err);
          setVisitorCount(INITIAL_VISITOR_COUNT);
        }
      }
    };

    incrementVisitor();
  }, []);

  const socialLinks = [
    {
      icon: <IconBrandDiscord className="h-6 w-6" />,
      name: "Discord",
      href: "https://discord.gg/arcadeverse",
      color: "bg-[#5865F2] hover:bg-[#5865F2]/90",
    },
    {
      icon: <IconBrandTelegram className="h-6 w-6" />,
      name: "Telegram",
      href: "https://t.me/arcadeverse",
      color: "bg-[#0088cc] hover:bg-[#0088cc]/90",
    },
    {
      icon: <IconBrandGithub className="h-6 w-6" />,
      name: "GitHub",
      href: "https://github.com/arcadeverse",
      color: "bg-[#24292e] hover:bg-[#24292e]/90",
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50/50 dark:from-gray-900 dark:to-gray-800">
      <div className="container">
        <motion.div
          ref={ref}
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Let's <span className="text-gradient">Connect!</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions or just want to say hi? Reach out to us on any platform below!
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col md:flex-row gap-6 justify-center items-center max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {socialLinks.map((link, index) => (
            <motion.div
              key={link.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
              className="w-full"
            >
              <Button
                className={`w-full h-12 ${link.color} text-white rounded-xl shadow-lg flex items-center justify-center gap-2`}
                asChild
              >
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </a>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-16 grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/30 rounded-bl-full z-0" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-4 bg-google-blue rounded-full" />
                <h3 className="text-xl font-bold">Total Website Visitors</h3>
              </div>
              <div className="text-5xl font-bold text-google-blue">{isClient ? visitorCount.toLocaleString() : INITIAL_VISITOR_COUNT.toLocaleString()}</div>
              <div className="mt-2 text-sm text-muted-foreground">Unique visitors tracked (client-side)</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-green-50 dark:bg-green-900/30 rounded-br-full z-0" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-4 bg-google-green rounded-full" />
                <h3 className="text-xl font-bold">Accounts Analyzed</h3>
              </div>
              {/* accountsAnalyzedCountFromHome is already safe from HomePage's isClientForHome logic */}
              <div className="text-5xl font-bold text-google-green">{accountsAnalyzedCountFromHome.toLocaleString()}</div>
              <div className="mt-2 text-sm text-muted-foreground">Total profiles processed</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
