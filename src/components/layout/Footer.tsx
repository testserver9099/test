import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { IconBrandDiscord, IconBrandTelegram, IconBrandGithub } from '@tabler/icons-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t py-8 mt-12">
      <div className="container space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">
              <span className="text-google-blue">Arcade</span>
              <span className="text-google-red">Verse</span>
            </h3>
            <p className="text-muted-foreground">
              Your ultimate companion for Google Cloud Arcade. Track your progress, analyze achievements, and stay ahead.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
                  <a href="/dashboard">Dashboard</a>
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
                  <a href="/dashboard/leaderboard">Leaderboard</a>
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
                  <a href="/resources">Resources</a>
                </Button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Community</h3>
            <ul className="space-y-2">
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
                  <a href="https://discord.gg/arcadeverse" target="_blank" rel="noreferrer">Discord Community</a>
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
                  <a href="https://t.me/arcadeverse" target="_blank" rel="noreferrer">Telegram Group</a>
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
                  <a href="https://github.com/arcadeverse" target="_blank" rel="noreferrer">GitHub</a>
                </Button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Connect With Us</h3>
            <div className="flex space-x-4">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button size="icon" variant="outline" className="rounded-full" asChild>
                  <a href="https://discord.gg/arcadeverse" target="_blank" rel="noreferrer">
                    <IconBrandDiscord className="h-4 w-4" />
                    <span className="sr-only">Discord</span>
                  </a>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button size="icon" variant="outline" className="rounded-full" asChild>
                  <a href="https://t.me/arcadeverse" target="_blank" rel="noreferrer">
                    <IconBrandTelegram className="h-4 w-4" />
                    <span className="sr-only">Telegram</span>
                  </a>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button size="icon" variant="outline" className="rounded-full" asChild>
                  <a href="https://github.com/arcadeverse" target="_blank" rel="noreferrer">
                    <IconBrandGithub className="h-4 w-4" />
                    <span className="sr-only">GitHub</span>
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} ArcadeVerse. All rights reserved.
          </p>
          <div className="flex text-sm text-muted-foreground">
            <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
              <a href="/privacy">Privacy Policy</a>
            </Button>
            <span className="mx-2">·</span>
            <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" asChild>
              <a href="/terms">Terms of Service</a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
