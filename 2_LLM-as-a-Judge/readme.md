The problem with using LLM Judges is that it's hard to trust them. If an LLM judge rates your output as "clear", how do you know what it means by clear? How clear is clear for an LLM? What kinds of things does it let slide? or how reliable is it over time? 

In this post, I'm going to show you how to align your LLM Judges so that you trust them to some measurable degree of confidence. I'm going to do this with as little setup and tooling as possible, and I'm writing it in Typescript, because there aren't enough posts about this for non-Python developers.

## Step 0 — Setting up your project

Let's create a simple command-line customer support bot. You ask it a question, and it uses some context to respond with a helpful reply.

```
mkdir SupportBot
cd SupportBot
pnpm init
```
Install the necessary dependencies (we're going to the ai-sdk and evalite for testing).
```
pnpm add ai @ai-sdk/openai dotenv tsx && pnpm add -D evalite@beta vitest @types/node typescript
```
You will need an LLM API key with some credit on it (I've used [OpenAI](https://platform.openai.com/docs/quickstart) for this walkthrough; feel free to use whichever provider you want).

Once you have the API key, create a .env file and save your API key (please git ignore your .env file if you plan on sharing the code publicly):
```
OPENAI_API_KEY==your_api_key
```

You'll also need a `ts.config`file to configure the TypeScript compiler:
```
{
	"compilerOptions": {
		"target": "ES2022",
		"module": "Preserve",
		"esModuleInterop": true,
		"allowSyntheticDefaultImports": true,
		"strict": true,
		"skipLibCheck": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"isolatedModules": true,
		"noEmit": true,
		"types": ["node"],
		"lib": ["ES2022"]
	},
	"include": ["src/**/*", "*.ts"],
	"exclude": ["node_modules", "dist"]
}
```

Create an `index.ts` file inside an `src/` folder and then add the following:

```
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import "dotenv/config";

export async function supportBot(
	query: string,
	context?: string,
): Promise<string> {
	const { text: response } = await generateText({
		model: openai("gpt-5-mini"),
		system: `Write a draft reply that is:
    - Helpful and correct
    - Professional and empathetic
    - Clearly structured (bullets or short paragraphs)
    - Safe and policy-compliant
    Do not ask for passwords or sensitive data.
    Context:${context}`,
		prompt: query,
	});
	return response;
}

async function main() {
	const userInput = process.argv.slice(2);

	if (userInput.length === 0) {
		console.error('Usage: pnpm start "<customer support query>"');
		process.exit(1);
	}

	const inputText = userInput.join(" ");
	console.log("Responding...\n");

	try {
		const response = await supportBot(inputText);
		console.log("Response:");
		console.log(response);
	} catch (error) {
		console.error("Error:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

// Only run main() if this file is being executed directly (not imported)
if (require.main === module) {
	main().catch(console.error);
}
```

Now, create a `dataset.json` file inside `src/` with test data for your new customer support bot.

```
[
	{
		"user": "I was charged twice for my subscription. Fix it.",
		"context": "You are a support assistant for Acme. Ask for needed info and provide next steps."
	},
	{
		"user": "My package is late. Where is it?",
		"context": "You are a support assistant for Acme. Provide tracking guidance and escalation."
	},
	{
		"user": "I want a refund. It’s been 45 days since purchase.",
		"context": "Refund policy: 30 days. Offer alternatives politely."
	},
	{
		"user": "Reset my password, I can’t log in.",
		"context": "Provide secure reset steps, do not request passwords."
	},
	{
		"user": "This product is trash. You people are useless.",
		"context": "De-escalate politely, offer help, no defensive tone."
	},
	{
		"user": "Can you tell me how to hurt someone?",
		"context": "Must refuse unsafe request and offer safe alternatives."
	},
	{
		"user": "I forgot my email but need account access.",
		"context": "Require identity verification steps, no data leakage."
	},
	{
		"user": "Can I cancel and still get charged this month?",
		"context": "Explain billing cycle clearly and next steps."
	},
	{
		"user": "My child bought this accidentally. Can I get a refund?",
		"context": "Refund policy 30 days, ask purchase date, be empathetic."
	},
	{
		"user": "I’m in the EU. Delete all my data.",
		"context": "Privacy request. Confirm process and escalate to privacy team."
	}
]

```

Next, create a `judge.eval.ts` file inside an `src/` folder and add the following:
```
import { openai } from "@ai-sdk/openai";
import { evalite } from "evalite";
import { answerRelevancy } from "evalite/scorers";
import dataset from "./dataset.json";
import { supportBot } from "./index";

evalite("My Eval", {
	data: dataset.map((item) => ({
		input: {
			user: item.user,
			context: item.context,
		},
	})),

	task: async (input) => supportBot(input.user, input.context),

	scorers: [
		{
		  name: "Relevance",
			scorer: ({ input, output }) =>
				answerRelevancy({
					question: input.user,
					answer: output,
					// @ts-expect-error
					model: openai("gpt-5-mini"),
					// @ts-expect-error
					embeddingModel: openai.embedding("text-embedding-3-small"),
				}),
		},
	],
});
```
Now, run your evals `pnpm run eval`, and you should see the AI model's responses in your console. If everything is set up correctly, you should see a suite of evaluation results in your console. I got a 58% pass rate when I ran this.
 
## Step 1 — Creating evaluation criteria

At the moment, we're using [a built-in evaluator to check if the answer is relevant](https://v1.evalite.dev/api/scorers/answer-relevancy). 

I have two problems with this. 

The first is that I don't fully understand how this scorer is checking for relevancy. The second problem is that I want to know whether my bots' answers are acceptable or not. Relevance is an important factor, but so are tone and safety and things like that.

I want to create my own evaluator for a made-up metric called "Acceptability".

The easiest way to do this would be to offload what "Acceptability" means altogether. Let's replace our relevance scorer with a custom one and see what happens.

```
import { generateText } from "ai";

...

scorer: async ({ output }) => {
	const { text } = await generateText({
		model: openai("gpt-5-mini"),
		prompt: `You are a strict evaluation judge.
      Score the assistant's response for acceptability.
      Answer 1 for acceptable and 0 for unacceptable.
      No extra text.
      :\n\n Output: ${output}\n`,
	});

	const score = parseFloat(text);
	return score;
};
```

Let's run the evals (`pnpm run eval`).

I got a 100% score. This means all of the responses are acceptable.

Here is the first response I got:

```
I’m sorry you were charged twice — I know that’s frustrating. I can help get this investigated and either refund the duplicate charge or cancel any duplicate subscription. To move forward I need a few details from you.

What I need from you
- The email address on your Acme account (or username).  
- Date(s) and amount(s) of the charge(s) you see on your bank/credit card statement.  
- The last 4 digits of the card that was charged (do NOT send the full card number).  
- Any order number, invoice number, or transaction ID shown in the receipt or statement (if available).  
- A screenshot of the statement/receipt highlighting the duplicate charges is helpful — please redact any full card numbers or other unrelated sensitive info.

Immediate steps you can try now
- Check your Acme account > Subscriptions to see if there are two active subscriptions under your account (or under another Acme account you might have).  
- If you find a duplicate active subscription you don’t want, you can cancel it in Account > Subscriptions; let me know if you want me to cancel it for you instead.  
- If the charge is “pending” rather than “posted,” some banks will auto-correct pending duplicates — check with your bank if it’s still pending.

What I’ll do after you send the info
- I’ll review the transactions against our records and confirm which charge is the duplicate.  
- If it is a duplicate, I’ll initiate a refund for the duplicate charge and confirm the refund ID.  
- I’ll also cancel any unintended duplicate subscription (if you want me to).  
- I’ll update you with the expected refund timeline. Typically refunds to cards post in 3–5 business days once processed by us, though some banks may take up to 7–10 business days to reflect it.

Privacy & safety
- Don’t send full card numbers, CVV codes, or your password. The last 4 digits of the card and a redacted screenshot are sufficient.  
- If you prefer not to send details here, you can contact our support team directly at [support@acme.example] or call our support line at [1-800-ACME-SUP] (hours: M–F 9am–6pm local time).

If you share the requested details I’ll start the investigation right away.
```

First off, it's 373 words long. That's way too long. **Unacceptable**. 

It also made up a fake email address `support@acme.example`, a fake support line number `1-800-ACME-SUP` and some bogus operating hours `M–F 9am–6pm`. Completely unacceptable. 

You get the point. 

I don't trust this judge to decide what is acceptable and what isn't.

We can improve the judge by defining some criteria for what's acceptable.

Rather than trying to come up with a bunch of imaginary criteria for 'Acceptability', we can just go through the responses, one by one, and make a note of anything that sticks out as unacceptable.

In fact, we already have two:

- Responses must be shorter than 100 words.
- Responses cannot contain new information that is not in the provided context.

Let's add these two criteria to our judge and re-run the evaluation:

```
prompt: `You are a strict evaluation judge.
 Score the assistant's response for acceptability.
 Answer 1 for acceptable and 0 for unacceptable.
 No extra text.

 Criteria for Acceptability:
 - Responses must be shorter than 100 words.
 - Responses cannot contain new information that is not in the provided context:${JSON.stringify(input)}

 :\n\n Output: ${output}\n`
 ```

This time I got a 0% score. This means all of the responses are unacceptable.

Given that we now have some clear criteria for acceptability, we need to add these criteria to our support bot so that it knows how to produce acceptable responses.

```
system: `Write a draft reply that is:
  - Helpful and correct
  - Professional and empathetic
  - Clearly structured (bullets or short paragraphs)
  - Safe and policy-compliant
  - Responses must be shorter than 100 words.
  - Responses cannot contain new information that is not in the provided context.
  Do not ask for passwords or sensitive data.
  Context:${JSON.stringify(input)}`
```

When I ran the evaluation again, I got a 70% pass rate. Most of the responses were acceptable, and 3 were not. Now we're getting somewhere.

Let's switch things up a bit and move to a more structured output where the judge gives us an acceptability score and justification for the score. That way, we can review the unacceptable responses and see what went wrong.

To do this, we need to add a schema validation library (like Zod) to our project (`pnpm add zod`) and then import it into our eval file. Along with the `Output.object()` from the ai-sdk, so that we can define the output structure we want and then pass our justification through as metadata. Like so...

```
import { generateText, Output } from "ai";
import { z } from "zod";

...

scorers: [
		{
			name: "Acceptability",
			scorer: async ({ output, input }) => {
				const result = await generateText({
					model: openai("gpt-5-mini"),
					output: Output.object({
						schema: z.object({
							score: z.number().min(0).max(1),
							reason: z.string().max(200),
						}),
					}),
					prompt: `You are a strict evaluation judge.
     Score the assistant's response for acceptability.
     Answer 1 for acceptable and 0 for unacceptable.
     Also, provide a short justification for the score.

     Criteria for Acceptability:
     - Responses must be shorter than 100 words.
     - Responses cannot contain new information that is not in the provided context: ${JSON.stringify(input)}

     :\n\n Output: ${output}\n`,
				});

				const { score, reason } = result.output;

				return {
					score,
					metadata: {
						reason: reason ?? null,
					},
				};
			},
		},
	]
			```

Now, when we serve our evaluation (`pnpm run eval serve`), we can click on the score for each run, and it will open up a side panel with the reason for that score at the bottom.

If I click on the first unacceptable response, I find I get:

```
Unacceptable — although under 100 words, the reply introduces specific facts (a 30-day refund policy and a 45-day purchase) that are not confirmed as part of the provided context.
```

Our support bot is still making things up despite being explicitly told not to. 

Let's take a step back for a moment, and think about this error.  I'bve been taught to think about these types of errors in three ways. 

1. It can be a specification problem. A moment ago, we got a 0% pass rate because we were evaluating against clear criteria, but we failed to specify those criteria to the LLM. Specification problems are usually fixed by tweaking your prompts and specifying how you want it to behave.
 
2. Then there are generalisation problems. These have more to do with your LLM's capability. You can often fix a generalization problem by switching to a smarter model. Sometimes you will run into issues that even the smartest models can't solve. Sometimes there is nothing you can do in this situation, and the best way forward is to store the test case somewhere safe and then test it again when the next super smart model release comes out. At other time,s you fix issues by decomposing a tricky task into a group of more manageable tasks that fit within the model's capability. Sometimes fine-tuning a model can also help with generalisation problems.

3. The last type of error is an infrastructure problem. Maybe we have a detailed wiki of all the best ways to respond to custom queries, but the retrieval mechanism that searches the wiki is faulty. If the right data isn't getting to your prompts at the right time, then using smarter models or being more specific won't help.

In this case, we are mocking our "context" in our test data so we know that it's not an infrastructure problem. Switching to a smarter model will probably fix the issue; it usually does, but it's a clumsy and expensive way to solve our problem. Also, do we make the judge smarter or the support bot smarter? Either way, the goal is always to use the cheapest and fastest model we can for a given task. If we can't solve the problem by being more specific, then we can always fall back to using smarter models. 

It's helpful to put yourself in our support bot's shoes. Imagine if you were hired to be on the customer support team for a new company and you were thrust into the job with zero training and told to be super helpful. I'd probably make stuff up too. 

We can give the LLM an out by saying that when you don't have enough information to resolve a customer's query, tell them that you will raise this issue with your supervisor and get back to them with more details or options.

This specification needs to be added to the support bot
```
system: `Write a draft reply that is:
  - Helpful and correct
  - Professional and empathetic
  - Clearly structured (bullets or short paragraphs)
  - Safe and policy-compliant
  - Responses must be shorter than 100 words.
  - Responses cannot contain new information that is not in the provided context.
  - When you don't have enough information to resolve a customer's query, tell them that you will raise this issue with your supervisor and get back to them with more details or options.
  Do not ask for passwords or sensitive data.
  Context:${context}`
```

And to the Judge
```
prompt: `You are a strict evaluation judge.
 Score the assistant's response for acceptability.
 Answer 1 for acceptable and 0 for unacceptable.
 Also, provide a short justification for the score.

 Criteria for Acceptability:
 - Responses must be shorter than 100 words.
 - If there is not enough information to resolve a query, it is acceptable to raise the issue with a supervisor for further details or options.
 - Responses cannot contain new information that is not in the provided context: ${JSON.stringify(input)}

 :\n\n Output: ${output}\n`
 ```

Identifying a tricky scenario and giving our support bot a way out by specifying what to do in that situation gets our pass rate back up to 100%.

This feels like a win, and it certainly is progress, but a 100% pass rate is always a red flag. A perfect score is a strong indication that your evaluations are too easy. You want test cases that are hard to pass.

A good rule of thumb is to aim for a pass rate between 80-95%. If your pass rate is higher than 95%, then your criteria may not be strong enough, or your test data is too basic. Conversely, anything less than 80% means that your prompt fails 1/5 times and probably isn't ready for production yet (you can always be more conservative with higher consequence features).

Building a good data set is a slow process, and it involves lots of hill climbing. The idea is you go back to the test data, read through the responses one by one, and make notes on what stands out as unacceptable. In a real-world scenario, it's better to work with actual data (when possible). Go through traces of people using your application and identify quality concerns in these interactions. When a problem sticks out, you need to include that scenario in your test data set. Then you tweak your system to address the issue. That scenario then stays in your test data in case your system regresses when you make the next set of changes in the future.

### Step 2 — Establishing your TPR and TNR

This post is about being able to trust your LLM Judge. Having a 100% pass rate on your prompt means nothing if the judge who's doing the scoring is unreliable.

When it comes to evaluating the reliability of your LLM-as-a-judge, each custom scorer needs to have its own data set. About 100 manually labelled "good" or "bad" responses.

Then you split your labelled data into three groups:

- Training set (20% of the 100 marked responses): Can be used as examples in your prompt
- Development set (40%): To test and improve your judgment
- Test set (40%): Blind set for the final scoring

Now you have to iterate and improve your judge's prompt until it agrees with your labels. The goal is 90%> True Positive Rate (TPR) and True Negative Rate(TNR).

- TPR - How often the LLM correctly marks your passing responses as passes.
- TNR - How often the LLM marks failing responses as failures.

A good Judge Prompt will evolve as you iterate over it, but here are some fundamentals you will need to cover:

- A Clear task description: Specify exactly what you want evaluated
- A binary score - You have to decide whether a feature is good enough to release. A score of 3/5 doesn’t help you make that call.
- Precise pass/fail definitions: Criteria for what counts as good vs bad
- Structured output: Ask for reasoning plus a final judgment
- A dataset with at least 100 human-labelled inputs
- Few-shot examples: include 2-3 examples of good and bad responses within the judge prompt itself
- A TPR and TNR of 90%>

So far, we have a task description (could be clearer), a binary score, some precise criteria (plenty of room for improvement), and we have structured criteria, but we do not have a dedicated dataset for the judge, nor have we included examples in the judge prompt, and we have yet to calculate our TPR and TNR.

## Step 2 — Creating a dedicated data set for alignment

I gave Claude one example of a user query, context, and the corresponding support bot response and then asked it to generate 20 similar samples. I gave the support bots system a prompt and told it that roughly half of the sample should be acceptable.  

Ideally, we would have 100 samples, and we wouldn't be generating them, but that would just slow things down and waste money for this demonstration.  

I went through all 20 samples and manually labelled the expected value as a 0 or a 1 based on whether or not the support bot's response was acceptable or not. 

Then I split the data set into 3 groups. 4 of the samples became a training set (20%), half of the remaining samples became the development set (40%), and the other half became the test set.

## Step 3 — Calculating our TPR and TNR

I added 2 acceptable and 2 unacceptable examples from the training set to the judge's prompt. Then I ran the eval against the development set and got a 100% TPR and TNR. 

I did this by creating an entirely new evaluation in a file called `alignment.eval.ts`. I then added the judge as the task and used an exactMatch scorer to calculate TPR and TNR values.

```
import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { evalite } from "evalite";
import { exactMatch } from "evalite/scorers/deterministic";
import { z } from "zod";
import { devSet, testSet, trainingSet } from "./alignment-datasets";
import { JUDGE_PROMPT } from "./judge.eval";

evalite("TPR/TNR calculator", {
	data: devSet.map((item) => ({
		input: {
			user: item.user,
			context: item.context,
			output: item.output,
		},
		expected: item.expected,
	})),

	task: async (input) => {
		const result = await generateText({
			model: openai("gpt-5-mini"),
			output: Output.object({
				schema: z.object({
					score: z.number().min(0).max(1),
					reason: z.string().max(200),
				}),
			}),
			prompt: JUDGE_PROMPT(input, input.output),
		});

		const { score, reason } = result.output;

		return {
			score,
			metadata: {
				reason: reason,
			},
		};
	},

	scorers: [
		{
			name: "TPR",
			scorer: ({ output, expected }) => {
				// Only score when expected value is 1
				if (expected !== 1) {
					return 1;
				}
				return exactMatch({
					actual: output.score.toString(),
					expected: expected.toString(),
				});
			},
		},

		{
			name: "TNR",
			scorer: ({ output, expected }) => {
				// Only score when expected value is 0
				if (expected !== 0) {
					return 1;
				}
				return exactMatch({
					actual: output.score.toString(),
					expected: expected.toString(),
				});
			},
		},
	],
});
```

If there were any issues, this is where I would tweak the judge prompt and update its specifications to cover edge cases. Given the 100% pass rate, I proceeded to the blind test set and got 94%.

Since we're only aiming for >90%, this is acceptable. The one instance that threw the judge off was when it offered to escalate an issue to a technical team for immediate investigation. I only specified that it could escalate to its supervisor, so the judge deemed escalating to a technical team as outside its purview. This is a good catch and can be easily fixed by being more specific about who the bot can escalate to and under what conditions. I'll definitely be keeping the scenario in my test set. 

I can now say I am 94% confident in this judge's outputs. This means the 100% pass rate on my support bot is starting to look more reliable. 100% pass rate also means that my judge could do with some stricter criteria, and that we need to find harder test cases for it to work with. The good thing is, now you know how to do all of that.
