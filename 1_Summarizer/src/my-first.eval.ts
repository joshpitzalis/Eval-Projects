import { evalite } from "evalite";
import { summarize } from "./index";
import { faithfulness } from "evalite/scorers";
import { google } from "@ai-sdk/google";
import dataset from "./dataset.json";
import { containsActionItems, clarity, coverage } from "./scorers";

evalite("My Eval", {
  // An array of test data
  // - TODO: Replace with your test data

  data: dataset,

  // data: [
  //   {
  //     input:
  //       "Artificial intelligence is transforming the way we work and live. Machine learning algorithms can now process vast amounts of data and identify patterns that humans might miss. This technology is being applied in healthcare, finance, transportation, and many other industries.",
  //     expected: "Hello World!",
  //   },
  // ],

  // The task to perform
  // - TODO: Replace with your LLM call
  task: async (input) => {
    return summarize(input);
  },
  // The scoring methods for the eval
  scorers: [
    {
      name: "Faithfulness",
      description: "No new facts, names, numbers, or events not in the source",
      scorer: ({ input, output }) =>
        faithfulness({
          question: input,
          answer: output,
          groundTruth: [input],
          model: google("gemini-2.5-flash-lite"),
        }),
    },
    {
      name: "Conciseness",
      description: "Output <= 120 words",
      scorer: ({ output }) => {
        return output.split(" ").length <= 120 ? 1 : 0;
      },
    },
    // containsActionItems,
    clarity,
    coverage,
  ],
});
