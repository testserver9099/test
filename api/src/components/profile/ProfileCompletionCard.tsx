import { useAuth, type ProfileCompletionStep } from "@/lib/auth-context";
import { useNotification } from "@/lib/notification-provider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconX, IconCircleCheck } from "@tabler/icons-react";
import { motion } from "framer-motion";

interface ProfileCompletionCardProps {
  onStepClick?: (stepId: string) => void;
}

export function ProfileCompletionCard({ onStepClick }: ProfileCompletionCardProps) {
  const { user, updateProfileStep } = useAuth();
  const { success } = useNotification();

  if (!user) return null;

  const { percent, steps } = user.profileCompletion;
  const remainingSteps = steps.filter(step => !step.completed);

  const handleCompleteStep = (step: ProfileCompletionStep) => {
    if (step.id === 'first-challenge') {
      // For demo purposes, completing first challenge is just toggled
      updateProfileStep(step.id, !step.completed);
      if (!step.completed) {
        success(`You've completed your first challenge! +${step.points} points`, {
          description: "Keep going to earn more badges and points!"
        });
      }
    } else if (onStepClick) {
      onStepClick(step.id);
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span>Profile Completion</span>
          <Badge variant={percent === 100 ? "default" : "outline"} className="ml-2">
            {percent}%
          </Badge>
        </CardTitle>
        <CardDescription>Complete your profile to earn points and badges</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-secondary h-2.5 rounded-full mb-4">
          <motion.div
            className="bg-primary h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-2 rounded-md border cursor-pointer transition-colors ${
                step.completed
                  ? "bg-primary/10 border-primary/20"
                  : "hover:bg-secondary/50 border-border"
              }`}
              onClick={() => handleCompleteStep(step)}
            >
              <div className="flex items-center">
                <div className={`p-1 rounded-full mr-3 ${step.completed ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                  {step.completed ? (
                    <IconCircleCheck className="h-5 w-5" />
                  ) : (
                    <IconCircleCheck className="h-5 w-5 opacity-40" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">{step.name}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
              <Badge variant="outline" className="ml-2">
                {step.points} pts
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
      {remainingSteps.length > 0 && (
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            {remainingSteps.length} {remainingSteps.length === 1 ? 'task' : 'tasks'} remaining
          </div>
          <Button variant="outline" size="sm" onClick={() => onStepClick?.(remainingSteps[0].id)}>
            Complete Next Task
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
