# Setup Instructions for Vegetarian Recipe Test

This project uses OpenAI's API to test a vegetarian recipe agent. Follow these steps to set up and run the tests:

## Prerequisites

1. You need an OpenAI API key. Get one from: https://platform.openai.com/api-keys

## Setup

1. **Install dependencies** (if not already done):
   ```bash
   pnpm install
   ```

2. **Set up your OpenAI API key**:
   
   **Option A: Create a .env file**
   ```bash
   echo "OPENAI_API_KEY=your_actual_api_key_here" > .env
   ```
   Replace `your_actual_api_key_here` with your actual OpenAI API key.
   
   **Option B: Set environment variable inline**
   ```bash
   OPENAI_API_KEY=your_actual_api_key_here pnpm run test
   ```

3. **Run the test**:
   ```bash
   pnpm run test
   ```

## What the test does

The test creates a scenario where:
- A user asks for a quick dinner recipe
- The vegetarian recipe agent responds with recipe suggestions
- The system validates that the recipe:
  - Doesn't ask more than two follow-up questions
  - Includes a list of ingredients
  - Includes step-by-step cooking instructions
  - Is vegetarian (no meat)

## Troubleshooting

- **"OpenAI API key is missing"**: Make sure you've set the `OPENAI_API_KEY` environment variable
- **"Model not found"**: The test uses `gpt-4o-mini` which should be available in most OpenAI accounts
- **Test timeout**: The test has a 30-second timeout. If your API calls are slow, this might need to be increased

## Security Note

Never commit your `.env` file to version control. It's already included in `.gitignore`.