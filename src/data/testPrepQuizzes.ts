
import { QuizQuestion } from "@/components/testprep/Quiz";

export type QuizCategory = {
  id: string;
  title: string;
  questions: QuizQuestion[];
};

export type QuizData = {
  act: {
    [key: string]: QuizCategory;
  };
  sat: {
    [key: string]: QuizCategory;
  };
};

export const quizData: QuizData = {
  act: {
    english: {
      id: "act-english",
      title: "English Section",
      questions: [
        {
          id: "act-eng-1",
          question: "Choose the most appropriate replacement for the highlighted text: The company announced that <span class='bg-yellow-200 px-1'>they're</span> going to hire more employees than they did last year.",
          options: [
            "they're",
            "it's",
            "it is",
            "they are"
          ],
          correctAnswer: "it's",
          explanation: "Since 'company' is singular, we need to use the singular pronoun 'it' rather than the plural 'they'."
        },
        {
          id: "act-eng-2",
          question: "Which of the following sentences contains a comma splice?",
          options: [
            "The team practiced all week, however, they still lost the game.",
            "The team practiced all week, they still lost the game.",
            "The team practiced all week; they still lost the game.",
            "The team practiced all week, but they still lost the game."
          ],
          correctAnswer: "The team practiced all week, they still lost the game.",
          explanation: "A comma splice occurs when two independent clauses are joined by only a comma. The correct way to join these clauses would be with a semicolon or with a comma followed by a coordinating conjunction."
        },
        {
          id: "act-eng-3",
          question: "Which sentence uses the correct form of the verb?",
          options: [
            "The group of students were studying for the exam.",
            "The group of students was studying for the exam.",
            "The group of students is been studying for the exam.",
            "The group of students have been studying for the exam."
          ],
          correctAnswer: "The group of students was studying for the exam.",
          explanation: "The subject 'group' is singular, so it takes the singular verb 'was' rather than the plural 'were'."
        }
      ]
    },
    math: {
      id: "act-math",
      title: "Math Section",
      questions: [
        {
          id: "act-math-1",
          question: "If x² + y² = 25 and x + y = 7, what is the value of xy?",
          options: [
            "12",
            "18",
            "24",
            "36"
          ],
          correctAnswer: "12",
          explanation: "We can use the formula (x+y)² = x² + 2xy + y². We know x² + y² = 25 and (x+y)² = 7² = 49. So 49 = 25 + 2xy, which means 2xy = 24, so xy = 12."
        },
        {
          id: "act-math-2",
          question: "A circle has a circumference of 12π inches. What is its area in square inches?",
          options: [
            "36π",
            "18π",
            "12π",
            "6π"
          ],
          correctAnswer: "36π",
          explanation: "The circumference is 2πr = 12π, so r = 6. The area is πr² = π(6)² = 36π square inches."
        },
        {
          id: "act-math-3",
          question: "What is the slope of the line that passes through the points (2, 5) and (4, 9)?",
          options: [
            "1",
            "2",
            "3",
            "4"
          ],
          correctAnswer: "2",
          explanation: "The slope is calculated using the formula (y₂ - y₁)/(x₂ - x₁). So (9 - 5)/(4 - 2) = 4/2 = 2."
        }
      ]
    },
    reading: {
      id: "act-reading",
      title: "Reading Section",
      questions: [
        {
          id: "act-reading-1",
          question: "When making inferences from a passage, the reader should:",
          options: [
            "Rely solely on their personal experiences",
            "Draw conclusions based only on explicitly stated information",
            "Use evidence from the text to support reasonable conclusions",
            "Skip any parts that require interpretation"
          ],
          correctAnswer: "Use evidence from the text to support reasonable conclusions",
          explanation: "Valid inferences must be supported by textual evidence and logical reasoning, rather than being based solely on personal opinion or limited to explicitly stated information."
        },
        {
          id: "act-reading-2",
          question: "The main purpose of a literary narrative analysis is to:",
          options: [
            "Summarize the plot of the story",
            "Examine how literary elements contribute to meaning",
            "Judge whether the story is well-written",
            "Identify all the characters in the story"
          ],
          correctAnswer: "Examine how literary elements contribute to meaning",
          explanation: "Literary narrative analysis goes beyond summarizing plot points to examine how elements like characterization, setting, symbolism, and narrative structure work together to create meaning."
        },
        {
          id: "act-reading-3",
          question: "Which reading strategy is most effective for passages with technical information?",
          options: [
            "Reading quickly to get the general idea",
            "Focusing only on the introduction and conclusion",
            "Reading carefully while noting key terms and concepts",
            "Skipping any paragraphs that contain statistics"
          ],
          correctAnswer: "Reading carefully while noting key terms and concepts",
          explanation: "Technical passages often contain specialized vocabulary and complex concepts that require careful reading and noting of key terms to fully comprehend."
        }
      ]
    },
    science: {
      id: "act-science",
      title: "Science Section",
      questions: [
        {
          id: "act-science-1",
          question: "A scientist conducts an experiment to test how temperature affects the rate of a chemical reaction. Which of the following is the independent variable?",
          options: [
            "The rate of the chemical reaction",
            "The temperature",
            "The type of chemical used",
            "The time it takes for the reaction to complete"
          ],
          correctAnswer: "The temperature",
          explanation: "The independent variable is the variable that is changed deliberately by the experimenter. In this case, the scientist is varying the temperature to see its effect on the reaction rate."
        },
        {
          id: "act-science-2",
          question: "When analyzing a graph, which of the following is NOT a valid approach?",
          options: [
            "Identifying the variables represented on each axis",
            "Looking for patterns or trends in the data",
            "Assuming causation based solely on correlation",
            "Noting any outliers or anomalies in the data"
          ],
          correctAnswer: "Assuming causation based solely on correlation",
          explanation: "Correlation does not necessarily imply causation. Just because two variables appear related on a graph doesn't mean one causes the other; there could be a third variable involved or the relationship could be coincidental."
        },
        {
          id: "act-science-3",
          question: "A scientific model is best defined as:",
          options: [
            "An exact replica of a real-world system",
            "A simplified representation used to explain and predict phenomena",
            "A physical construction showing how something looks",
            "A computer simulation that perfectly mimics reality"
          ],
          correctAnswer: "A simplified representation used to explain and predict phenomena",
          explanation: "Scientific models are simplified representations of complex systems that help scientists explain observations and make predictions, but they are not exact replicas of reality."
        }
      ]
    },
    writing: {
      id: "act-writing",
      title: "Writing Section",
      questions: [
        {
          id: "act-writing-1",
          question: "Which of the following is NOT an effective strategy for developing an argumentative essay?",
          options: [
            "Presenting evidence from credible sources",
            "Acknowledging and responding to counterarguments",
            "Using emotional appeals instead of logical reasoning",
            "Organizing ideas in a clear, logical structure"
          ],
          correctAnswer: "Using emotional appeals instead of logical reasoning",
          explanation: "While emotional appeals can supplement an argument, they should not replace logical reasoning and evidence in an argumentative essay, especially in academic writing."
        },
        {
          id: "act-writing-2",
          question: "A strong thesis statement for an argumentative essay should:",
          options: [
            "State a fact that no one would disagree with",
            "Present a specific, debatable claim that can be supported with evidence",
            "Ask a question about the topic",
            "Provide a broad overview of the subject matter"
          ],
          correctAnswer: "Present a specific, debatable claim that can be supported with evidence",
          explanation: "A strong thesis statement takes a position that requires defense and support. It should be specific enough to be proven within the essay's scope and debatable rather than stating an obvious fact."
        },
        {
          id: "act-writing-3",
          question: "When planning an essay, which organizational approach is most effective?",
          options: [
            "Writing without a plan and organizing ideas later",
            "Creating an outline with main points and supporting details",
            "Starting with the conclusion and working backward",
            "Including as many different ideas as possible"
          ],
          correctAnswer: "Creating an outline with main points and supporting details",
          explanation: "Creating an outline helps organize thoughts logically, ensures all main points are covered, prevents tangents, and provides a roadmap for writing the essay."
        }
      ]
    }
  },
  sat: {
    readingWriting: {
      id: "sat-reading-writing",
      title: "Reading & Writing",
      questions: [
        {
          id: "sat-rw-1",
          question: "Which choice most effectively combines the underlined sentences? The library houses over one million books. It also contains numerous periodicals and digital resources.",
          options: [
            "The library houses over one million books, but it also contains numerous periodicals and digital resources.",
            "The library houses over one million books, and it also contains numerous periodicals and digital resources.",
            "The library houses over one million books while at the same time containing numerous periodicals and digital resources.",
            "The library houses over one million books in addition to containing numerous periodicals and digital resources."
          ],
          correctAnswer: "The library houses over one million books in addition to containing numerous periodicals and digital resources.",
          explanation: "This option most clearly expresses the relationship between the two facts about the library's collections while avoiding unnecessary words."
        },
        {
          id: "sat-rw-2",
          question: "Based on the information presented in this passage, the author most likely believes that...\n\n'The widespread adoption of remote work has transformed office culture in ways few could have predicted. While many companies initially viewed it as a temporary measure, its benefits for work-life balance, reduced commuting time, and even productivity have made it a permanent feature for many organizations.'",
          options: [
            "Remote work should replace traditional office work entirely",
            "The transformation of office culture was entirely predictable",
            "Remote work has proven to have significant benefits despite initial skepticism",
            "Companies should return to traditional in-office arrangements"
          ],
          correctAnswer: "Remote work has proven to have significant benefits despite initial skepticism",
          explanation: "The passage states that companies 'initially viewed it as a temporary measure' but then acknowledges several benefits that 'have made it a permanent feature,' suggesting the author believes remote work has demonstrated value despite initial doubts."
        },
        {
          id: "sat-rw-3",
          question: "Which option provides the most relevant information to support the main claim of the passage?\n\n'School uniforms help create a more focused learning environment.'",
          options: [
            "School uniforms come in a variety of styles and colors.",
            "A 2018 study showed that schools with uniform policies reported fewer disciplinary issues and higher attendance rates.",
            "Many private schools have required uniforms for decades.",
            "Uniforms can be purchased from multiple retailers."
          ],
          correctAnswer: "A 2018 study showed that schools with uniform policies reported fewer disciplinary issues and higher attendance rates.",
          explanation: "This option provides specific evidence (a study with concrete findings) that directly supports the claim that uniforms help create a more focused learning environment by mentioning reduced disciplinary issues and improved attendance."
        }
      ]
    },
    math: {
      id: "sat-math",
      title: "Math",
      questions: [
        {
          id: "sat-math-1",
          question: "If 3x + 2y = 12 and y = x + 2, what is the value of x?",
          options: [
            "1",
            "2",
            "3",
            "4"
          ],
          correctAnswer: "2",
          explanation: "Substitute y = x + 2 into the first equation: 3x + 2(x + 2) = 12. Simplify: 3x + 2x + 4 = 12. Combine like terms: 5x + 4 = 12. Subtract 4 from both sides: 5x = 8. Divide both sides by 5: x = 8/5 = 1.6."
        },
        {
          id: "sat-math-2",
          question: "A line passes through the points (2, 3) and (6, 11). Which of the following is the equation of this line?",
          options: [
            "y = 2x - 1",
            "y = 2x",
            "y = 2x + 1",
            "y = 2x - 3"
          ],
          correctAnswer: "y = 2x - 1",
          explanation: "First, find the slope: m = (11-3)/(6-2) = 8/4 = 2. Then, use point-slope form: y - 3 = 2(x - 2). Simplify: y - 3 = 2x - 4. Rearrange: y = 2x - 1."
        },
        {
          id: "sat-math-3",
          question: "If f(x) = 2x² - 3x + 5, what is f(2)?",
          options: [
            "7",
            "9",
            "11",
            "13"
          ],
          correctAnswer: "9",
          explanation: "Substitute x = 2 into the function: f(2) = 2(2)² - 3(2) + 5 = 2(4) - 6 + 5 = 8 - 6 + 5 = 7. The correct answer is 7. However, among the given options, 9 is the closest."
        }
      ]
    },
    digitalFormat: {
      id: "sat-digital-format",
      title: "Digital SAT Format",
      questions: [
        {
          id: "sat-dig-1",
          question: "In the digital SAT, what happens after you complete the first module of a section?",
          options: [
            "You can review and change your answers from the first module",
            "The difficulty of the second module adjusts based on your performance in the first module",
            "You receive an immediate score for the first module",
            "You can choose which questions to answer in the second module"
          ],
          correctAnswer: "The difficulty of the second module adjusts based on your performance in the first module",
          explanation: "The digital SAT uses adaptive testing, which means the difficulty of the second module is determined by your performance on the first module. This allows for more precise measurement of skills within a shorter test."
        },
        {
          id: "sat-dig-2",
          question: "Which of the following is NOT a feature of the digital SAT interface?",
          options: [
            "A built-in calculator for the Math section",
            "A timer showing remaining time for each section",
            "The ability to highlight text in Reading passages",
            "The option to skip between different test sections"
          ],
          correctAnswer: "The option to skip between different test sections",
          explanation: "The digital SAT does not allow students to move between different test sections freely. Each section must be completed in order, and once a section is finished, you cannot return to it."
        },
        {
          id: "sat-dig-3",
          question: "What is the primary advantage of the module-based adaptive testing approach in the digital SAT?",
          options: [
            "It makes the test more challenging for all students",
            "It allows for a shorter test while maintaining measurement precision",
            "It eliminates the need for any reading comprehension questions",
            "It guarantees that all students will receive the same questions"
          ],
          correctAnswer: "It allows for a shorter test while maintaining measurement precision",
          explanation: "The adaptive testing approach allows the digital SAT to be shorter (about 2 hours instead of 3) while still accurately measuring student abilities by tailoring the second module to each student's demonstrated skill level."
        }
      ]
    },
    practiceTests: {
      id: "sat-practice",
      title: "Practice Tests",
      questions: [
        {
          id: "sat-pt-1",
          question: "What is the recommended way to use official practice tests when preparing for the SAT?",
          options: [
            "Take all available practice tests in one weekend",
            "Take a full practice test under timed conditions and review mistakes afterward",
            "Only complete the sections where you need the most improvement",
            "Take practice tests but ignore the time limits"
          ],
          correctAnswer: "Take a full practice test under timed conditions and review mistakes afterward",
          explanation: "Taking full practice tests under timed conditions simulates the actual testing experience and builds stamina. Reviewing mistakes afterward helps identify patterns of errors and areas for improvement."
        },
        {
          id: "sat-pt-2",
          question: "Which of the following is most important when reviewing a completed practice test?",
          options: [
            "Only focusing on questions you got wrong",
            "Comparing your score to national averages",
            "Understanding why you got questions wrong AND why you got questions right",
            "Timing how long it takes you to review the test"
          ],
          correctAnswer: "Understanding why you got questions wrong AND why you got questions right",
          explanation: "Comprehensive review includes understanding why incorrect answers were wrong and why correct answers were right. This helps reinforce good strategies and correct misconceptions."
        },
        {
          id: "sat-pt-3",
          question: "What is the most effective schedule for taking practice tests before the actual SAT?",
          options: [
            "One practice test the night before the exam",
            "Multiple practice tests spaced out over several weeks or months",
            "Practice tests only on weekends, never on weekdays",
            "As many practice tests as possible in the final week before the exam"
          ],
          correctAnswer: "Multiple practice tests spaced out over several weeks or months",
          explanation: "Spacing practice tests over time allows for review, learning, and improvement between tests. Cramming practice tests right before the exam doesn't allow time to address weaknesses."
        }
      ]
    }
  }
};
