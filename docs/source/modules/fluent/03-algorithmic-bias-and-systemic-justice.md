# Module 3: Algorithmic Bias & Systemic Justice

**Course:** AI Fluent (9-12). **Writer:** Neil. **Peer checker:** Viren.

**Status:** Full draft, revised October 14, 2026 with 2024-2026 cases and ARK's view. Written with Claude from Neil's direction. Claude opened every source below. Neil still needs to open each link and read the module aloud before peer check.

**On the site:** Students apply a social justice lens to AI, examining how algorithmic systems can reinforce or amplify existing inequities.[ Slide deck](https://drive.google.com/file/d/109I2XQqV-OwA-yE9ZhgmLd1G-2Q6xF8E/view)

**Key topics:**

- How historical inequity gets encoded in training data
- Case studies: criminal justice, healthcare, education, housing
- Intersectionality and compound algorithmic harm
- Auditing AI systems: how researchers and journalists hold AI accountable

**Hard idea:** Fairness definitions conflict. When groups have different base rates, no risk score can meet every common definition of fairness at once. Choosing one is a choice about values, not math.

**Recent events in this module (last checked October 14, 2026):** Amsterdam's "Smart Check" welfare pilot (reported June 2025), AI resume-screening studies from 2024 and 2025, and Mobley v. Workday (rulings in 2025 and 2026).

**Note for whoever leads this:** this module touches on race, gender, disability, and class. Keep the focus on how systems work, never on individual students, and let anyone pass.

## Objectives

By the end, learners can:

1. Explain how past inequity can enter a system through its data, its target, and where it is used.
2. Analyze a documented case: who built the system, what data it used, who was affected, and what happened next.
3. Explain why two reasonable definitions of fairness can't both be met when groups have different base rates.
4. Describe how an algorithmic audit works, and why it must check overlapping groups, not just averages.

## Vocabulary

| Term | Definition for this grade band |
| --- | --- |
| disparate impact | When a rule that looks neutral harms one group more than others. |
| proxy variable | A data point that stands in for a protected trait, such as a zip code standing in for race. |
| base rate | How common an outcome is in a group before any prediction is made. |
| intersectionality | How overlapping identities, such as race and gender together, shape what a person experiences. |
| algorithmic audit | An independent test of a system for unequal outcomes. |

## Step 1: Hook (explainer, 5 min, free preview)

**Title:** Same tool, different mistakes

In 2016, journalists at ProPublica studied COMPAS, a tool that scores how likely a defendant is to commit another crime. They followed more than 7,000 people arrested in Broward County, Florida, in 2013 and 2014, for two years. Here is what they found about the tool's mistakes:

| Mistake | Black defendants | White defendants |
| --- | --- | --- |
| Labeled higher risk, but did not reoffend | 44.9% | 23.5% |
| Labeled lower risk, but did reoffend | 28.0% | 47.7% |

Black defendants who did not reoffend were almost twice as likely to be wrongly labeled higher risk. White defendants who did reoffend were more often wrongly labeled lower risk.

[CALLOUT think] Before you read on: where could a gap like this come from? List two possible sources.

The company behind the tool, Northpointe, rejected ProPublica's conclusion of racial bias. It argued that the scores were equally accurate for both groups once you account for their different rates of reoffending.

Both sides used the same data, and both did careful math. In Step 3 you will see how they could both be right, and why that matters more than either side winning.

A rule that looks neutral but hits one group harder has [VOCAB disparate impact]. This module is about how that happens in AI systems, and how people catch it.

**Sources:**

- Machine Bias (ProPublica, May 2016) ->[https://www.propublica.org/article/machine-bias-risk-assessments-in-criminal-sentencing](https://www.propublica.org/article/machine-bias-risk-assessments-in-criminal-sentencing)
- Northpointe's response to ProPublica ->[https://www.equivant.com/?p=2091](https://www.equivant.com/?p=2091)

## Step 2: Core idea (explainer, 7 min)

**Title:** Three ways inequity gets in

This module builds on Bias in AI from the AI Literate course. Researchers look for bias at three points.

**The data.** A system learns from past decisions and from text people wrote. In 2018, Reuters reported that Amazon dropped a hiring tool that penalized resumes containing the word "women's." In 2024, University of Washington researchers ran identical resumes through AI models with different names attached. The models favored white-associated names 85% of the time.

**The target.** Builders choose what to predict, and that choice can carry bias on its own. A 2019 study in Science examined a health tool that predicted future medical costs as a stand-in for need. Less money is spent on Black patients with the same need, so the tool underrated how sick they were. Fixing the target would have raised the share of Black patients flagged for extra help from 17.7% to 46.5%.

**Where it is used.** In 2020, England replaced cancelled exams with a formula that leaned on each school's past results. It lowered 35.6% of grades by one level, and students at larger state schools were hit harder. After protests, regulators dropped it on August 17, 2020.

A [VOCAB proxy variable] lets bias in even after a protected trait is removed. In 2022, the US Justice Department settled with Meta over housing ads. It alleged that the ad delivery system relied in part on race, national origin, and sex to decide who saw each ad.

[SORT] Where did the bias get in? | The data; The target; Where it is used

- A hiring tool learns from ten years of mostly male resumes -> The data -> It copied who got hired before.
- A health tool predicts spending instead of illness -> The target -> Some groups get less care, so spending understates their need.
- A grading formula leans on each school's past results -> Where it is used -> Grades tracked the school's history, not just the student.
- A loan model drops race but keeps zip code -> The data -> Zip code can act as a proxy for race.

**Sources:**

- Amazon hiring tool (Reuters, October 2018) ->[https://www.businessinsurance.com/amazon-scraps-secret-artificial-intelligence-recruiting-tool-showed-bias-against/](https://www.businessinsurance.com/amazon-scraps-secret-artificial-intelligence-recruiting-tool-showed-bias-against/)
- AI resume screening and names (Wilson and Caliskan, University of Washington, October 2024) ->[https://www.washington.edu/news/2024/10/31/ai-bias-resume-screening-race-gender/](https://www.washington.edu/news/2024/10/31/ai-bias-resume-screening-race-gender/)
- Health cost algorithm (Obermeyer et al., Science, 2019) ->[https://www.ftc.gov/system/files/documents/public_events/1548288/privacycon-2020-ziad_obermeyer.pdf](https://www.ftc.gov/system/files/documents/public_events/1548288/privacycon-2020-ziad_obermeyer.pdf)
- England's 2020 grading formula ->[https://www.engadget.com/uk-algorithm-a-levels-gcse-results-143503870.html](https://www.engadget.com/uk-algorithm-a-levels-gcse-results-143503870.html)
- Reversal on August 17, 2020 ->[https://amp.cnn.com/cnn/2020/08/17/europe/uk-school-exams-coronavirus-gbr-intl](https://amp.cnn.com/cnn/2020/08/17/europe/uk-school-exams-coronavirus-gbr-intl)
- US v. Meta housing ads settlement (June 2022) ->[https://www.justice.gov/opa/pr/justice-department-secures-groundbreaking-settlement-agreement-meta-platforms-formerly-known](https://www.justice.gov/opa/pr/justice-department-secures-groundbreaking-settlement-agreement-meta-platforms-formerly-known)

## Step 3: The hard idea (explainer, 7 min)

**Title:** Two kinds of fair

Back to COMPAS. ProPublica asked: among people who did not reoffend, were both groups flagged at the same rate? No. Northpointe asked: does a given score mean the same chance of reoffending in both groups? Northpointe said yes.

These are two different definitions of fair. In 2016 and 2017, researchers proved that you can't meet both when groups differ in how often the outcome happens. Here is why, with made-up numbers.

Group A has 100 people, and 50 will reoffend. Group B has 100 people, and 30 will. That share is the group's [VOCAB base rate].

Suppose "high risk" means a 60% chance of reoffending in both groups, and "low risk" means 20%. To fit the base rates, the tool labels 75 people in Group A high risk, and 25 in Group B. Now look only at people who will not reoffend:

- Group A: 30 of its 50 are labeled high risk anyway. That is 60%.
- Group B: 10 of its 70 are. That is about 14%.

The label means the same thing in both groups. Yet a person in Group A who will not reoffend is about four times as likely to be flagged. Equalize those mistakes, and "high risk" stops meaning the same thing.

[FIGURE] Two grids of 100 dots, one per group. Filled dots will reoffend. Dots labeled "high risk" have a red outline. In Group A, many unfilled dots have red outlines. In Group B, few do | Alt text: Two groups of 100 people showing that a score with the same meaning in both groups still flags many more people who will not reoffend in the group with the higher base rate.

The math allows two ways out: equal base rates, or a perfect predictor. Real life offers neither. So every risk tool picks which kind of fairness to protect.

Amsterdam tried hard to escape this. In 2023 the city built a welfare-fraud model without nationality, gender, or age. Its first version still wrongly flagged non-Western applicants nearly twice as often. After a fix, it tested fair. In a live pilot of about 1,600 applications, the errors shifted onto Dutch nationals and women. The city shut it down.

[CALLOUT think] If you were being scored, which would you want? A label that means the same thing for everyone, or an equal chance of being wrongly flagged? Who should make that choice?

**Sources:**

- Inherent trade-offs in risk scores (Kleinberg, Mullainathan, and Raghavan, 2016) ->[https://arxiv.org/abs/1609.05807](https://arxiv.org/abs/1609.05807)
- Fair prediction with disparate impact (Chouldechova, 2017) ->[https://arxiv.org/abs/1703.00056](https://arxiv.org/abs/1703.00056)
- Amsterdam's Smart Check pilot (MIT Technology Review with Lighthouse Reports and Trouw, June 11, 2025) ->[https://www.technologyreview.com/2025/06/11/1118233/amsterdam-fair-welfare-ai-discriminatory-algorithms-failure/](https://www.technologyreview.com/2025/06/11/1118233/amsterdam-fair-welfare-ai-discriminatory-algorithms-failure/)

## Step 4: Try it (activity, 8 min)

**Title:** The fairness slider

Now try to beat the math yourself.

[TRY] Use the ARK fairness slider once it launches. You get two groups of people with different base rates. Move the cutoff for "high risk" in each group and watch two meters:

- Meter 1: in each group, what share of "high risk" people actually reoffend?
- Meter 2: in each group, what share of people who won't reoffend get flagged anyway?

Try to make both meters equal across the groups at the same time.

No slider? Use the card version your facilitator hands out. Each pair gets two decks of 20 cards. Move cards between "high risk" and "low risk" piles and count.

You will be able to equalize one meter or the other, but not both. Write down:

1. Which meter did you choose to equalize, and why?
2. Who pays for your choice? Name the people in the other meter.
3. Would your answer change if the tool decided bail, a college scholarship, or extra tutoring?

There is no right answer to question 1. There is a wrong way to answer it: pretending the choice isn't there.

**Check these:**

- [TRY] is a new tag. The slider is a small widget with no AI model inside. It needs a site change.

## Step 5: Scenario (scenario, 6 min)

**Title:** You are the auditor

An [VOCAB algorithmic audit] tests a system for unequal outcomes. The first rule of auditing: check overlapping groups, not just averages. In the 2018 Gender Shades study, three commercial gender classification systems had error rates up to 34.7% for darker-skinned women. The highest rate for lighter-skinned men was 0.8%. Checking skin tone alone or gender alone would hide the worst-hit group. That is [VOCAB intersectionality], a term Kimberlé Crenshaw introduced in 1989.

The rule holds for newer AI too. In 2025, researchers ran about 361,000 resumes through five AI models. The models scored women higher than men overall, but gave lower scores to Black men with comparable qualifications.

Audits work. Within seven months of Gender Shades, all three companies released new versions with lower error rates for darker-skinned women. Since July 2023, New York City has required bias audits for automated hiring tools.

A school district uses an early-warning score that flags middle schoolers as "at risk" of not graduating on time. You are asked to audit it.

[SCENARIO] What do you do first?

- **A. Compare error rates across groups, including overlapping ones.** Feedback: Strong. This is where hidden harm shows up. Averages can look fine while one group carries most of the mistakes.
- **B. Read the code.** Feedback: Useful later. The code shows what the tool computes, not how its errors fall on real students. Start with outcomes.
- **C. Interview flagged students.** Feedback: A strong second step. Students know what the label did to them. Interviews alone can't show whether errors fall unevenly.
- **D. Ask what the flag is used for.** Feedback: Also strong. A flag that triggers extra tutoring carries different stakes than one that moves a student to a separate classroom.

This is close to a real case. In 2023, The Markup found that Wisconsin's Dropout Early Warning System used race and free or reduced-price lunch status as inputs. It was wrong nearly three-quarters of the time when it predicted a student would not graduate on time. It was wrong more often for Black and Hispanic students than for white students.

**Sources:**

- Gender Shades (Buolamwini and Gebru, 2018) ->[https://proceedings.mlr.press/v81/buolamwini18a.html](https://proceedings.mlr.press/v81/buolamwini18a.html)
- Crenshaw, Demarginalizing the Intersection of Race and Sex (1989) ->[https://scholarship.law.columbia.edu/faculty_scholarship/3007](https://scholarship.law.columbia.edu/faculty_scholarship/3007)
- Actionable Auditing (Raji and Buolamwini, 2019) ->[https://www.media.mit.edu/publications/actionable-auditing-investigating-the-impact-of-publicly-naming-biased-performance-results-of-commercial-ai-products/](https://www.media.mit.edu/publications/actionable-auditing-investigating-the-impact-of-publicly-naming-biased-performance-results-of-commercial-ai-products/)
- NYC Local Law 144 ->[https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page](https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page)
- 361,000 resumes and five AI models (An et al., PNAS Nexus, March 2025) ->[https://pmc.ncbi.nlm.nih.gov/articles/PMC11937954/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11937954/)
- Wisconsin's dropout algorithm (The Markup, April 2023) ->[https://themarkup.org/the-breakdown/2023/04/27/takeaways-from-our-investigation-into-wisconsins-racially-inequitable-dropout-algorithm](https://themarkup.org/the-breakdown/2023/04/27/takeaways-from-our-investigation-into-wisconsins-racially-inequitable-dropout-algorithm)

**YOUR TURN (Neil):** Decide what the flag leads to in your version: extra support or extra discipline. If your district uses a system like this, describe it with no student names.

____

## Step 6: Quick check (check, 4 min)

[CHECK] A lending model removes race from its inputs but keeps zip code. Why might it still treat groups unequally?

A. Zip codes are random

B. Zip code can act as a proxy for race

C. Removing race always fixes bias

D. Lending models can't use location

*Answer: B. If where people live tracks race, zip code can carry the same pattern.*

[CHECK] A health tool predicted medical costs as a stand-in for need. Why did that underrate Black patients?

A. The tool used race as an input

B. Black patients visited doctors more often

C. Less money is spent on Black patients with the same need, so cost understated their need

D. The data was too small

*Answer: C. The target, cost, was a biased stand-in for the thing that mattered, need.*

[CHECK] Two groups have different base rates. What can a risk score NOT do?

A. Make a label mean the same thing in both groups and give both groups the same rate of wrongful flags

B. Make any predictions at all

C. Use a cutoff

D. Be checked by an auditor

*Answer: A. Unless base rates match or predictions are perfect, those two kinds of fairness conflict.*

[CHECK] Amsterdam's welfare model left out nationality, gender, and age. In a live pilot, its errors shifted onto Dutch nationals and women. What does this show?

A. The city made a simple coding mistake

B. Welfare offices can never use data

C. Removing traits and fixing one measure can move the harm instead of ending it

D. The model was fair, and the pilot was unlucky

*Answer: C. Fixing a model on one test does not settle which errors it makes, or who carries them.*

[CHECK] An audit finds a hiring model scores women higher than men on average. What should the auditor check next?

A. Nothing. Women are doing fine.

B. Results for overlapping groups, such as Black men and Black women

C. Whether the tool is popular

D. The price

*Answer: B. A 2025 study found exactly this pattern: women scored higher overall, while Black men scored lower.*

## Step 7: Reflect (reflect, 5 min)

**Title:** Where it touches you

**ARK's view:** We think any tool that scores people for school, jobs, housing, or policing should name its kind of fairness. It should also say who carries its mistakes. A hidden trade-off is still a choice. It is just one nobody gets to argue with.

**The best case against:** Publishing details can help people game a system, and companies say it exposes trade secrets. Human decision-makers hide their trade-offs too, so why hold software to a higher bar?

[REFLECT] Do you agree with ARK? What would change your mind?

[REFLECT] Where might an algorithm already be making or shaping a decision about you? Think about school, apps, job applications, or prices you see online.

Your answers stay on your device. Nobody else will see them.

[DISCUSS]

- Ban it or fix it? Take the early-warning score. Would you retrain it, ban it, pause it for an audit, or keep it with a person reviewing every flag?
- Who answers for a biased hiring tool: the employer, or the company that built it? A federal case, Mobley v. Workday, is testing that question. In 2025 a judge let it go forward as a group case for applicants over 40. As of 2026, it includes claims about race, sex, age, and disability.
- Where is the real fix? Pick a corner: better data and testing, strict laws and bans, more varied builder teams, or people making the final call.

**YOUR TURN (Neil):** Add one prompt about a system your school or city uses.

____

**Sources:**

- Mobley v. Workday docket, including the May 16, 2025 collective certification (Civil Rights Litigation Clearinghouse) ->[https://clearinghouse.net/case/44074/](https://clearinghouse.net/case/44074/)
- The June 22, 2026 ruling and the claims it left standing (Kress, July 23, 2026) ->[https://kressinc.com/blog/mobley-v-workday-ai-hiring-liability-10-steps/](https://kressinc.com/blog/mobley-v-workday-ai-hiring-liability-10-steps/)

**Check these:**

- The Kress summary is a company blog. Confirm the June 2026 ruling's details on the court docket before launch.

## Step 8: Recap (recap, 3 min)

[RECAP]

- Bias can enter through the data, the target a team chooses to predict, and where a system is used.
- Removing a protected trait doesn't remove bias when proxy variables remain.
- When base rates differ, no score can meet every definition of fairness at once. Choosing one is a choice about values, and fixing one measure can move the harm.
- Audits must check overlapping groups. Averages can hide the worst-hit people, in face analysis and in AI resume screening.
- Audits work. Public results have pushed companies and governments to change.

Next: AI and work, and who gains and who loses as tasks change.

## Pre/post check

The same three questions open and close the module.

[CHECK] What is a proxy variable?

A. A backup copy of a dataset

B. A data point that stands in for a protected trait, such as zip code for race

C. A variable that has no effect

D. A rule against bias

*Answer: B. Proxies can carry bias into a model even after the protected trait is removed.*

[CHECK] A rule treats everyone the same on paper but harms one group more. What is this called?

A. Disparate impact

B. A base rate

C. Calibration

D. An audit

*Answer: A. Disparate impact is about outcomes, not intentions.*

[CHECK] What does an algorithmic audit check?

A. Whether the code compiles

B. Whether the company is profitable

C. Whether the system's outcomes are unequal across groups, including overlapping ones

D. Whether users like the system

*Answer: C. Audits test outcomes for different groups, not just the average.*

## Facilitator guide

**Materials:** Projector. Devices for the fairness slider once it exists, or two decks of 20 cards per pair (see below). Printed case cards for the Step 2 sort. Four corner signs.

**Card decks for Step 4:** Use the Step 3 numbers scaled to 20. Group A deck: 20 cards, 10 marked "will reoffend." Start with 15 in the high-risk pile (9 marked) and 5 in the low-risk pile (1 marked). Group B deck: 20 cards, 6 marked. Start with 5 high (3 marked) and 15 low (3 marked). Both high piles start at 60% marked, and both low piles at 20%. Wrongful flags start at 6 of 10 in Group A and 2 of 14 in Group B. Learners move cards to try to equalize both.

**Timing for a 75-minute class:** For 60 minutes, do the Step 2 sort as a whole class. For 90 minutes, let groups present their Step 4 choices and defend them.

| Minutes | What happens | Format |
| --- | --- | --- |
| 0-3 | Pre-check | Individual |
| 3-10 | Step 1: guess the sources of the gap before reading on | Whole class |
| 10-22 | Step 2 and the sort | Pairs |
| 22-34 | Step 3: work the numbers on the board, then the Amsterdam case | Whole class |
| 34-48 | Step 4 Try it with the slider or cards | Pairs |
| 48-58 | Step 5 audit scenario | Groups of four |
| 58-62 | Step 6 quick check | Individual |
| 62-71 | Step 7: ARK's view, reflect, then the fix-it corners | Individual, then whole class |
| 71-75 | Step 8 recap and post-check | Whole class |

**Before you start:**

- Keep discussion on systems and evidence. Never ask students to share their own experiences of discrimination, and let anyone pass.
- Some students may have family members affected by criminal justice, health, or housing systems. Present cases calmly and avoid graphic detail.
- In Step 3, slow down. Draw both groups on the board and count together. The point lands when students see that the math, not anyone's bad intent, forces the trade-off. Amsterdam then shows it happening to a city that tried to do everything right.
- ARK's view is an opinion, labeled as one. Invite students to argue with it. No grade depends on agreeing.

**Discussion prompts:** Use the deck's "Ban it or fix it?" debate and "Where's the real fix?" corners.

**Answer notes:** Quick check: 1 B, 2 C, 3 A, 4 C, 5 B. Pre/post: 1 B, 2 A, 3 C. If learners choose A on quick check question 5, ask who the average hides.

**Deck alignment:** The deck covers compound harm, four case files, the AI detectives, Guess the Culprit, Ban It or Fix It, How Bias Gets In, Can We Debias AI, and the corners. New in this draft: the fairness trade-off and the slider, the Amsterdam pilot, AI resume screening, the Wisconsin case, the post-audit results, Mobley v. Workday, and ARK's view. One fix: the deck's compound-harm slide says "face-ID errors," but Gender Shades tested gender classification, not identification. Change the wording.

## Sources and facts to verify

- Open every link in the steps above before peer check, and the original studies behind any summaries.
- Check whether each system named is still in use, and add any company or agency responses.
- The Obermeyer link is the author's slide deck for an FTC event. Add the Science article link if you can access it.

## Sign-off

| Writer self-check | Peer check | Educator | AI professional |
| --- | --- | --- | --- |
| ____ | ____ | ____ | ____ |
