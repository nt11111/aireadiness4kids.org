MODULE 1: HOW AI ACTUALLY WORKS

Course: AI Literate (6-8)

Status: Writing

Writer: Rishi

Peer checker: Neil

ON THE SITE

Students get a non-technical but accurate introduction to how machine learning works, including training data, patterns, and predictions. Slide deck

KEY TOPICS

- Training data and how AI learns from examples

- Pattern recognition vs. true understanding

- The difference between AI, machine learning, and algorithms

- Inputs, outputs, and feedback loops: a simple mental model

OBJECTIVES

By the end, learners can:

1. Describe how a machine learning model learns from training data.

2. Explain the difference between spotting patterns and knowing what something means.

3. Tell apart AI, machine learning, and an algorithm.

4. Describe an AI tool they use in terms of input, model, prediction, and feedback.

VOCABULARY

| Term | Definition |
| --- | --- |
| algorithm | A set of step-by-step instructions that a computer follows. |
| machine learning | A way of building AI where a program learns patterns from examples, so nobody has to write every rule by hand. |
| training data | The examples an AI tool learns from. |
| model | What you get after training: a program that takes an input and makes a prediction. |
| prediction | A model's best guess for a new input. |
| feedback loop | When a tool's results become its future data, so a pattern keeps repeating. |

---

STEP 1: Hook (explainer, 5 min, free preview)

Title: The guess that felt like mind reading

You open Instagram and the first Reel is exactly the kind of video you'd save. Your Explore page is somehow full of stuff you'd screenshot and send to a friend. It can feel like the app is reading your mind.

It isn't. It's making a [VOCAB prediction], a best guess about what you'll like. Predictions come from patterns.

Most of the AI you use every day was built with [VOCAB machine learning]. [CITATION NEEDED] Nobody typed in a rule that says "this person likes skate fail videos." Instagram studied huge numbers of examples. What you watched all the way through. What you liked. What you scrolled past in half a second. Then it found patterns. [CITATION NEEDED]

[CALLOUT think] Think of a time Instagram's feed guessed right, or got it strangely wrong. What had you watched or liked right before that?

In this module, you'll open the box. You'll see what goes in and what comes out. You'll also see why an app can guess so well and still not know what a video is.

---

STEP 2: Core idea (explainer, 7 min)

Title: Inputs, patterns, predictions

Here's a simple way to think about machine learning. It has four parts.

Training data. People collect huge numbers of examples. For a recommender like Instagram, that means videos people watched, skipped, liked, or saved. [CITATION NEEDED] This is the [VOCAB training data].

Training. An [VOCAB algorithm] goes through the examples and adjusts itself to find patterns. It might notice that people who finish cooking videos often watch more of them.

The model. After training, you have a [VOCAB model]. Give it a new video and a viewer, the input. It gives back a prediction: how likely you are to watch, like, or save it.

Feedback. When you tap "not interested" or watch something all the way through, that becomes new data. This is a [VOCAB feedback loop].

[FIGURE] A loop diagram: training data, then training, then model, then prediction, with feedback flowing back into training data | Alt text: Diagram of data flowing into training, producing a model that makes predictions, with feedback returning as new data.

An algorithm is step-by-step instructions, like a recipe. Machine learning is one way to build AI: it learns patterns from examples instead of following typed-in rules. AI is the bigger category: systems built to do tasks that usually need human thinking. [CITATION NEEDED]

[CALLOUT fact] A model finds patterns. It doesn't know what a video actually is.

[SORT] Which part of the loop is it? | Training data; Model; Prediction; Feedback

- Millions of videos labeled by how long people watched them -> Training data -> These are the examples the program learns from.

- The trained program inside Instagram that ranks your feed -> Model -> It's what training produced.

- "You'll probably watch this one all the way through" -> Prediction -> It's the model's best guess for a new input.

- You tap "not interested" on a video -> Feedback -> Your tap becomes new data.

---

STEP 3: Scenario (scenario, 6 min)

Title: The pet-tagging app at Pigskin

A friend builds an app for the Pigskin club fair. It tags photos as "dog" or "cat." She trained it on photos from her own phone. In nearly all of her dog photos, the dog is outside on grass. At the fair, the app tags a cat sitting on a lawn as a dog.

[SCENARIO] What's the most likely reason?

- A. The app is broken and needs a restart. Feedback: A restart won't change what the model learned. The mistake comes from training, not a glitch.

- B. The model learned "grass means dog" from her photos. Feedback: Most likely. The pattern it found was the background, not the animal. During testing, it was right for the wrong reasons.

- C. That cat looks a lot like a dog. Feedback: Possible, but the grass explains it better. Ask what her dog photos had in common.

- D. AI can't tell animals apart. Feedback: It can, with the right data. Photos of dogs and cats in many different places would help.

Follow-up: What would you add to the training data to fix it?

---

STEP 4: Quick check (check, 4 min)

[CHECK] In machine learning, what is training data?

A. The rules a programmer types in

B. The examples a program learns patterns from

C. The model's final answer

D. The app's settings

Answer: B. Training data is the set of examples the program learns from.

[CHECK] A recommender says you're 90% likely to watch a video. What is that?

A. Training data

B. An algorithm

C. A prediction

D. A feedback loop

Answer: C. It's the model's output for a new input: a prediction.

[CHECK] Which statement is most accurate?

A. A model knows what its words mean

B. A model finds patterns in data and uses them to guess

C. A model follows only rules a person wrote

D. A model can't be wrong if it has enough data

Answer: B. Models find patterns. They don't know meaning, and they can still be wrong.

[CHECK] You mark a recommended video "not interested." Which part of the loop is that?

A. Training

B. Prediction

C. Feedback

D. Input

Answer: C. Your response goes back in as new data.

[CHECK] Which one is machine learning, not just "an algorithm" in general?

A. A recipe that lists steps in order

B. A program that learns patterns from examples instead of following rules a person wrote

C. A set of directions for solving a math problem

D. Any list of instructions a computer follows

Answer: B. Machine learning is one way to build AI: it learns patterns from examples. The others are just algorithms.

---

STEP 5: Reflect (reflect, 5 min)

Title: Your own loop

[REFLECT] Pick one AI tool you use. Write its loop. What data did it learn from? What is the input? What does it predict? How do your taps and clicks feed back in?

This stays on your device. Nobody else will see it.

[DISCUSS]

- If an app learns from your clicks, who is training whom?

- What is one thing a model could get right for the wrong reason?

- If you knew exactly what Instagram is trained on, would you act differently?

---

STEP 6: Recap (recap, 3 min)

[RECAP]

- Machine learning builds AI by finding patterns in examples, called training data.

- A trained model takes an input and makes a prediction.

- Feedback from users becomes new data, which creates a loop.

- Models find patterns. They don't know meaning, and they can be right for the wrong reasons.

Next: Bias in AI. What happens when the examples are unfair or incomplete?

---

PRE/POST CHECK (same three questions at the start and the end)

1. What does a machine learning model learn from?

A. A rule book written by one programmer

B. Examples that people collected or labeled

C. The internet connection

D. Its own opinions

Answer: B. Models learn patterns from examples.

2. Which of these is an algorithm?

A. A recipe with steps in order

B. A photo

C. A battery

D. A password

Answer: A. An algorithm is a set of step-by-step instructions.

3. A model trained only on daytime photos fails at night. Why?

A. Night photos are not allowed

B. Its training data had no examples like these

C. Models need rest

D. The camera is broken

Answer: B. A model struggles with inputs that look nothing like what it trained on.

---

FACILITATOR GUIDE

Materials

- A device or screen per small group, or one shared screen

- Index cards for the unplugged "be the model" sort

- Printed or projected quick check and pre/post check

- Paper or a device for Reflect (optional, stays private)

Timing

| Part | 60 min | 90 min |
| --- | --- | --- |
| Pre-check | 4 | 5 |
| Warm-up: "an app guessed wrong about me" | 3 | 5 |
| Step 1: Hook | 6 | 10 |
| Step 2: Core idea, with the "be the model" round | 18 | 25 |
| Step 3: Scenario | 8 | 12 |
| Step 4: Quick check | 5 | 8 |
| Step 5: Reflect | 5 | 7 |
| Step 6: Recap | 3 | 6 |
| Post-check | 4 | 5 |
| Buffer | 4 | 7 |
| Total | 60 | 90 |

The "be the model" round: one group sorts cards by a secret rule, and the others guess the pattern.

Before you start

- The Instagram example is illustrative. It is not a judgment on screen time. Let students swap in the app they actually argue about if Instagram isn't it.

- Instagram requires users to be 13 or older in most regions, and learners are 11 to 13. Do not ask who has an account.

- Reflect answers are private. Do not ask anyone to share their screen or read theirs aloud.

- Name products only as examples. The Pigskin app is made up.

Discussion prompts

- Use the three in Step 5.

- For extra time: "Should apps have to explain why they recommended something to you?"

Answer notes

- Step 2 sort: the common mix-up is treating prediction and feedback as the same thing. A prediction is the model's guess. Feedback is the new data created by the student's reaction to that guess.

- Step 3: B is the best answer. Accept any choice a learner can explain, and use the feedback lines to steer.

- Step 4: B, C, B, C, B. For Q5, make sure students see machine learning as one specific kind of algorithm, not a separate thing from algorithms entirely.

- Pre/post: B, A, B.

---

SOURCES AND FACTS TO VERIFY

Every fact in this module needs a link you have opened and read. Four [CITATION NEEDED] marks are still in the steps:

- Step 1: "Most of the AI you use every day was built with machine learning." Find one source.

- Step 1: Instagram learns from what you watch all the way through, like, and scroll past. Use a source from Instagram or Meta, or a researcher.

- Step 2: A recommender learns from videos people watched, skipped, liked, or saved. This can share the Instagram source above.

- Step 2: The plain definitions of AI, machine learning, and algorithm. Match them to a named source, such as a university or a standards body.

- Make the Step 2 loop diagram.

---

SIGN-OFF

| Writer self-check | Peer check | Educator | AI professional |
| --- | --- | --- | --- |
| Rishi | Neil |  |  |
| Date: | Date: | Date: | Date: |

## Depth pass: suggested upgrades (October 14, 2026)

From a review of all three courses. Nothing above this heading was changed. Rishi decides what to keep, then deletes this section. Claude opened every source below on October 14, 2026.

**Overall:** This module is clear and well built. Its best idea is the Step 3 scenario: a model can be right for the wrong reasons. The gap is chatbots. Most middle schoolers meet AI through a chatbot, and this module never explains how one writes.

### 1. Big idea for the header

**Big idea:** A model finds patterns, not meaning. It can be right for the wrong reasons, and wrong while sounding sure.

### 2. New step: How a chatbot writes (explainer, 7 min)

Paste-ready. It fits after Step 2.

**Title:** The biggest autocomplete ever built

Chatbots run on the same idea as your feed: patterns in examples. But their examples are text, and their prediction is the next word.

A chatbot studied a huge amount of writing. When you ask it something, it picks a likely next word, then the next, then the next. It does not look facts up unless a tool tells it to.

That is why a chatbot can sound sure and still be wrong. A confident, made-up answer is called a [VOCAB hallucination].

[CALLOUT fact] In 2025, a summer reading list ran in major newspapers. A writer used AI to help make it. Only 5 of its 15 books were real.

[CALLOUT think] Why would a "likely next word" machine invent a book title that sounds real?

This is not rare. By October 2026, a public database listed 2,184 court cases where filings included citations AI had made up.

Sources:

- Fake summer reading list (NPR, May 20, 2025) ->[https://www.npr.org/2025/05/20/nx-s1-5405022/fake-summer-reading-list-ai](https://www.npr.org/2025/05/20/nx-s1-5405022/fake-summer-reading-list-ai)
- AI Hallucination Cases database (Charlotin, updated October 10, 2026) ->[https://www.damiencharlotin.com/hallucinations/](https://www.damiencharlotin.com/hallucinations/)

Add to the vocabulary table: hallucination | A confident answer from an AI that is false or made up.

### 3. Sources for three of the [CITATION NEEDED] marks

- Step 1, Instagram learns from what you watch: Instagram's own 2021 overview of Reels ranking lists how many Reels you watch, "ideally all the way through," plus likes and comments. ->[https://www.socialmediatoday.com/news/instagram-provides-new-overview-of-how-its-reels-algorithm-works/](https://www.socialmediatoday.com/news/instagram-provides-new-overview-of-how-its-reels-algorithm-works/) (it links Instagram's post:[https://www.instagram.com/p/CSIOjxcJ8Vv/)](https://www.instagram.com/p/CSIOjxcJ8Vv/))
- Step 1 and Step 2, recommendations are built with machine learning: Meta's AI blog, "Powered by AI: Instagram's Explore recommender system" (November 25, 2019). ->[https://ai.meta.com/blog/powered-by-ai-instagrams-explore-recommender-system/](https://ai.meta.com/blog/powered-by-ai-instagrams-explore-recommender-system/)
- Step 2, a recommender predicts what you will like from what you watched and rated: Netflix Help Center. ->[https://help.netflix.com/en/node/100639](https://help.netflix.com/en/node/100639)
- Suggested rewording for Step 1: "Feeds like Instagram's are built with machine learning." That is easier to source than "most of the AI you use every day."

### 4. A harder check question

[CHECK] A pet app learned "grass means dog." On a test where every dog photo has grass, it scores 98%. What does the score tell you?

A. The app understands dogs

B. The test shares the same shortcut, so the score can hide the problem

C. The app will work on any photo

D. Grass is part of what makes a dog a dog

*Answer: B. A test built like the training data can reward the shortcut. Test on photos that break the pattern.*

### 5. ARK's view (new in guide 1.4)

Suggested for Step 5, before the reflect prompt:

**ARK's view:** We think apps should tell you why they recommended something. You should also be able to pick a feed that isn't built from your data.

**The best case against:** Explanations are often too vague to help. Many people like the personalized feed and would never switch.

[REFLECT] Do you agree with ARK? What would change your mind?

### 6. Fixes

- Instagram is 13+ and learners are 11 to 13. Your facilitator note covers this. Consider a general "video app" in the learner text and keep Instagram as the teacher's example.
