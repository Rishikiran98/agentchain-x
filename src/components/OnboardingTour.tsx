import { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

interface OnboardingTourProps {
  runTour: boolean;
  onComplete: () => void;
}

const OnboardingTour = ({ runTour, onComplete }: OnboardingTourProps) => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (runTour) {
      setRun(true);
    }
  }, [runTour]);

  const steps: Step[] = [
    {
      target: '[data-tour="add-agent"]',
      content: "Click here to add your first AI agent. Each agent has a unique role in your workflow.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="canvas"]',
      content: "This is your workflow canvas. Drag agents around and connect them to define how they collaborate.",
      placement: "center",
    },
    {
      target: '[data-tour="connect-button"]',
      content: "Use this button to connect agents. Click it, then click two agents to create a connection arrow.",
    },
    {
      target: '[data-tour="templates"]',
      content: "Not sure where to start? Load a pre-built template workflow and customize it!",
    },
    {
      target: '[data-tour="run-workflow"]',
      content: "When ready, click here to execute your workflow. Watch agents collaborate in real-time!",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      onComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "hsl(263 70% 60%)",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "8px",
        },
        buttonNext: {
          backgroundColor: "hsl(263 70% 60%)",
          borderRadius: "6px",
        },
        buttonBack: {
          color: "hsl(263 70% 60%)",
        },
      }}
    />
  );
};

export default OnboardingTour;