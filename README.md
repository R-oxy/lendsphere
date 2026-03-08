<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bbc624f3-c83e-43c0-adb9-3de54c0d6914

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## AI Reflection Log

- **Which AI tool did you use?**
  I used the Antigravity AI agent.
- **What specific problem or concept did you ask it about?**
  I asked it to implement a complete Playwright end-to-end testing setup using TypeScript and the Page Object Model (POM) pattern for the Lendsphere application's authentication flows (Registration and Login).
- **Did the AI provide the correct solution immediately, or did you have to modify it?**
  The AI provided the correct foundational setup immediately (installations, locators, specs). However, an issue arose where the Playwright `webServer` block timed out waiting for the local dev server. The AI correctly identified that this was due to Node.js resolving `localhost` to IPv6 (`::1`), while the Lendsphere dev server was binding to IPv4 (`0.0.0.0`). The AI fixed this by removing the failing `webServer` verification block and pointing Playwright directly to `http://localhost:3000`, allowing the tests to run successfully!
