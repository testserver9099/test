import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useNotification } from '@/lib/notification-provider';
import { useAuth } from '@/lib/auth-context';
import { IconMailFilled, IconMessageCircle, IconChevronDown, IconUser } from '@tabler/icons-react';

interface FAQ {
  question: string;
  answer: string;
  id: string; // Added id field to FAQ interface
}

const faqItems: FAQ[] = [
  {
    question: "How do I earn points and badges?",
    answer: "You can earn points by completing profile steps, participating in challenges, and engaging with the community. Badges are awarded for specific achievements, like completing your profile or finishing your first challenge.",
    id: "faq-points-badges"
  },
  {
    question: "How do I track my progress?",
    answer: "Your progress is displayed in your dashboard. You can see your profile completion percentage, earned badges, and points. The dashboard also shows your current level and available challenges.",
    id: "faq-track-progress"
  },
  {
    question: "I found a bug in the platform. What should I do?",
    answer: "Please report any bugs or issues using our Support form. Include as much detail as possible, including steps to reproduce the issue, what you expected to happen, and what actually happened.",
    id: "faq-bug-report"
  },
  {
    question: "How do I change my profile information?",
    answer: "You can update your profile information in the Settings section of your dashboard. This includes your name, email, profile picture, and bio.",
    id: "faq-profile-update"
  },
  {
    question: "Can I delete my account?",
    answer: "Yes, you can delete your account from the Settings page. This will permanently remove all your data from our system, including points, badges, and progress.",
    id: "faq-account-deletion"
  }
];

export function SupportPage() {
  const { user } = useAuth();
  const { success, error, notifySupportMessage } = useNotification();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!formData.name.trim()) {
      error("Please enter your name");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      error("Please enter a valid email address");
      return;
    }

    if (!formData.subject.trim()) {
      error("Please enter a subject");
      return;
    }

    if (!formData.message.trim() || formData.message.length < 10) {
      error("Please enter a message with at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      success("Your support request has been submitted", {
        description: "We'll get back to you as soon as possible."
      });

      // Simulate a support team response after 3 seconds (for demo purposes)
      setTimeout(() => {
        notifySupportMessage(
          "Thank you for contacting us! We've received your request and will respond within 24 hours.",
          "Support Team"
        );
      }, 3000);

      // Reset form
      setFormData(prev => ({
        ...prev,
        subject: '',
        message: ''
      }));
    } catch (err) {
      error("Failed to submit your request", {
        description: "Please try again later or contact us directly."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-12 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Support Center</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get help with your ArcadeVerse experience. Browse our FAQ or contact our support team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IconMessageCircle className="mr-2 h-5 w-5" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Have a question or facing an issue? Let us know and we'll help you out.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Describe your issue or question in detail"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </CardFooter>
          </Card>

          {/* FAQ section */}
          <div className="space-y-6">
            <div className="flex items-center mb-2">
              <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-3">
              {faqItems.map((faq) => (
                <div key={faq.id} className="border rounded-lg overflow-hidden">
                  <button
                    className="w-full px-4 py-3 flex justify-between items-center bg-card hover:bg-muted/50 transition-colors"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <span className="font-medium text-left">{faq.question}</span>
                    <IconChevronDown
                      className={`h-5 w-5 transition-transform ${
                        expandedFaq === faq.id ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFaq === faq.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-4 py-3 bg-muted/30 border-t"
                    >
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-primary/10 rounded-lg mt-6">
              <div className="flex items-center mb-2">
                <IconMailFilled className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-medium">Direct Contact</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                For urgent matters, you can reach us at:
              </p>
              <a
                href="mailto:support@arcadeverse.example"
                className="text-sm text-primary hover:underline block mt-1"
              >
                support@arcadeverse.example
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
