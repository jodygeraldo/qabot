export const QUESTION_COMMAND = {
  name: "question",
  description: "Quick search answer of available questions.",
};

export const QUESTION_SHORT_COMMAND = {
  name: "q",
  description: "Quick search answer of available questions.",
};

export const ASK_AI_COMMAND = {
  name: "ask",
  description: "Ask AI a question!",
  options: [{
    type: 3,
    name: "question",
    description: "Provide question you want AI to answer!",
    required: true,
  }],
};
