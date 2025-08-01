import Question from "../../../assets/Icon_fill/Question_fill.svg";

const helpCenterData = [
  {
    id: "tutorial",
    icon: Question,
    title: "Tutorial Guide",
    subtitle: "Learn how to use the app step by step.",
    steps: [
      {
        step: 1,
        image: "https://ik.imagekit.io/youraccount/tutorial1.png",
        description: "Click the start button to begin."
      },
      {
        step: 2,
        image: "https://ik.imagekit.io/youraccount/tutorial2.png",
        description: "Fill in your profile details."
      }
    ]
  },
  {
    id: "onboarding",
    icon: Question,
    title: "Onboarding Guide",
    subtitle: "Get started quickly with our onboarding process.",
    steps: [
      {
        step: 1,
        image: "https://ik.imagekit.io/youraccount/onboarding1.png",
        description: "Welcome to the app!"
      },
      {
        step: 2,
        image: "https://ik.imagekit.io/youraccount/onboarding2.png",
        description: "Setup your preferences."
      },
      {
        step: 3,
        image: "https://ik.imagekit.io/youraccount/onboarding3.png",
        description: "You are ready to go!"
      }
    ]
  }
];

export default helpCenterData;
