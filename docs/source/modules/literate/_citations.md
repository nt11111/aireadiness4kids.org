# AI Literate: citations for open source gaps

Added October 18, 2026. Rishi's modules list most of their sources at the bottom, under "Sources and facts to verify". This file covers what those lists left open: every `[CITATION NEEDED]` mark, and every definition he flagged as needing a named source. Claude opened every link below on October 18, 2026. Rishi should still open each one before peer check (guide section 8).

Status key:
- **Supported:** the sources back the claim. Remove the marker and add the sources to that step's Sources list.
- **Partly supported:** the sources back part of the claim. Add the sources and keep the "Source needed" marker. The note says which part is open.

## `[CITATION NEEDED]` marks in the steps

| # | Module, step | Claim in the text | Status | Sources | Note |
| --- | --- | --- | --- | --- | --- |
| 1 | M1, Step 1 (first mark) | "Most of the AI you use every day was built with machine learning." | Supported | Sara Brown, "Machine learning, explained," MIT Sloan, April 21, 2021: https://mitsloan.mit.edu/ideas-made-to-matter/machine-learning-explained | MIT's Thomas Malone says machine learning has become a key way, maybe the most important one, that most parts of AI are done. |
| 2 | M1, Step 1 (second mark) | Instagram found patterns in what you watched all the way through, liked, and scrolled past. | Partly supported | Adam Mosseri, "Instagram Ranking Explained," Instagram, May 31, 2023: https://about.instagram.com/blog/announcements/instagram-ranking-explained ; Pan et al., "Learning and Optimization of Implicit Negative Feedback for Industrial Short-video Recommender System," CIKM 2023: https://arxiv.org/abs/2308.13249 | Instagram names likes, saves, reshares, and how likely you are to watch a reel all the way through. It doesn't mention scrolling past. The second source shows skipping is a main signal for short-video recommenders, but it studies Kuaishou, not Instagram. Rishi can keep the line and the marker, or make the scrolling-past part general. |
| 3 | M1, Step 2 | A recommender's training data: videos people watched, skipped, liked, or saved. | Supported | Mosseri (row 2) for watched, liked, saved; Pan et al. (row 2) for skipped | |
| 4 | M1, Step 2 | Plain definitions of algorithm, machine learning, and AI. | Supported | Merriam-Webster, "algorithm," sense 1b ("a set of step-by-step instructions used by a computer system to achieve a particular result"): https://www.merriam-webster.com/dictionary/algorithm ; MIT Sloan (row 1) for AI ("the capability of a machine to imitate intelligent human behavior") and machine learning (Arthur Samuel: "the field of study that gives computers the ability to learn without explicitly being programmed") | |
| 5 | M4, Step 1 | Deepfake: AI-made or AI-altered video, image, or audio showing a real person doing or saying something they didn't. | Supported | Merriam-Webster, "deepfake": https://www.merriam-webster.com/dictionary/deepfake ; U.S. GAO, "Science & Tech Spotlight: Deepfakes" (GAO-20-379SP), February 20, 2020: https://www.gao.gov/products/GAO-20-379SP | |
| 6 | M4, Step 2 | An AI tool studies lots of real photos, videos, and voices, then makes new ones that seem real. | Supported | GAO-20-379SP (row 5): creators feed "hundreds or thousands of images" into a neural network ; FTC Consumer Alert, "Scammers use AI to enhance their family emergency schemes," March 20, 2023: https://consumer.ftc.gov/consumer-alerts/2023/03/scammers-use-ai-enhance-their-family-emergency-schemes | The FTC alert covers voices: a scammer needs only "a short audio clip" of someone's voice. Deeper reading for the facilitator guide: Mirsky and Lee, "The Creation and Detection of Deepfakes: A Survey," ACM Computing Surveys, 2021: https://arxiv.org/abs/2004.11138 |
| 7 | M5, Step 1 | "As of 2026, Instagram says it collects:" (seven bullets) | Supported | Meta Privacy Policy (covers Instagram): https://privacycenter.instagram.com/policy | All seven bullets match the policy text effective November 3, 2023, including contacts "if you choose to upload or import" them and "Purchases and transactions you make off of our Products." The live page loads with JavaScript and couldn't be read here, so Rishi should confirm it against the current version and add the check date. |

## Definitions Rishi flagged as needing a named source

These go in the module's vocabulary sources. No marker appears in the step text for them.

| Module | Term | Source |
| --- | --- | --- |
| M3 | generative AI | NIST AI 600-1, "Generative Artificial Intelligence Profile," July 2024: AI models that "emulate the structure and characteristics of input data" to "generate derived synthetic content": https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf |
| M3 | plagiarism | Merriam-Webster, "plagiarize": "to steal and pass off (the ideas or words of another) as one's own": https://www.merriam-webster.com/dictionary/plagiarize |
| M3 | academic honesty | Grinnell College, "Honesty in Academic Work": your work is "your own contribution," and you "acknowledge what you have derived from other sources": https://www.grinnell.edu/node/49371 |
| M3 | disclosure | Grinnell College (same page): acknowledge "assistance received from another person or from a Large Language Model or AI service," for example in a footnote |
| M5 | personal data | California Privacy Protection Agency, FAQ: personal information "identifies, relates to, or could reasonably be linked" to a consumer or household: https://cppa.ca.gov/faq.html |
| M5 | data broker | California Privacy Protection Agency, "Information for Data Brokers" (current as of 2026): a business that knowingly collects and sells "the personal information of a consumer with whom the business does not have a direct relationship": https://cppa.ca.gov/data_brokers/ . This can replace the 2014 FTC release in Step 2. |
| M5 | privacy policy | California Privacy Protection Agency, "What General Notices Are Required By The CCPA?": a privacy policy gives "a comprehensive description of a business's online and offline information practices": https://cppa.ca.gov/pdf/general_notices.pdf |
| M5 | permission | Android Developers, "Permissions on Android": permissions protect access to restricted data such as "users' contact information" and restricted actions such as "recording audio": https://developer.android.com/guide/topics/permissions/overview |
| M6 | ethics | Merriam-Webster, "ethic," sense 3: "the discipline dealing with what is good and bad and with moral duty and obligation": https://www.merriam-webster.com/dictionary/ethics |
| M6 | fairness | NIST AI 100-1, AI Risk Management Framework 1.0, January 2023, section 3.7: fairness "includes concerns for equality and equity by addressing issues such as harmful bias and discrimination": https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf |
| M6 | accountability | Merriam-Webster, "accountability": "an obligation or willingness to accept responsibility or to account for one's actions": https://www.merriam-webster.com/dictionary/accountability |
| M6 | transparency | NIST AI RMF 1.0 (above), section 3.4: "the extent to which information about an AI system and its outputs is available to individuals" |
| M6 | trade-off | Merriam-Webster, "trade-off": "a giving up of one thing in return for another": https://www.merriam-webster.com/dictionary/trade-off |

## Other open items in M5's source list

| Item | Source |
| --- | --- |
| Step 2: "Confirm the Axios claim about opt out training" | Stanford HAI, "Be careful what you tell your AI chatbot," October 15, 2025: all six companies studied "employ users' chat data by default to train their models": https://hai.stanford.edu/news/be-careful-what-you-tell-your-ai-chatbot |
| Step 2: "Confirm Instagram's stance on selling data" | Meta Privacy Policy (row 7): "We don't sell any of your information to anyone, and we never will." |
