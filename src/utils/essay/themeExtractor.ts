
export interface ExtractedThemes {
  context: string;
  keyMoment: string;
  challenge: string;
  skill: string;
  action: string;
  achievement: string;
  growth: string;
  aspiration: string;
}

function extractMeaningfulPhrase(text: string, startIndex: number): string {
  const sentences = text.split('.');
  return sentences[startIndex] ? sentences[startIndex].trim() : text.slice(0, 30).trim();
}

function findPhraseContaining(text: string, keywords: string[]): string {
  const sentences = text.split('.');
  for (const sentence of sentences) {
    for (const keyword of keywords) {
      if (sentence.toLowerCase().includes(keyword)) {
        return sentence.trim();
      }
    }
  }
  return '';
}

function findChallengePhrase(text: string): string {
  const challengeWords = ['challenge', 'difficult', 'struggle', 'obstacle'];
  return findPhraseContaining(text, challengeWords) || "this challenge";
}

function findSkillPhrase(text: string): string {
  const skillWords = ['learned', 'developed', 'mastered', 'improved'];
  return findPhraseContaining(text, skillWords) || "these skills";
}

function findActionPhrase(text: string): string {
  const actionWords = ['took', 'created', 'organized', 'started'];
  return findPhraseContaining(text, actionWords) || "take action";
}

function findAchievementPhrase(text: string): string {
  const achievementWords = ['accomplished', 'achieved', 'succeeded', 'completed'];
  return findPhraseContaining(text, achievementWords) || "your achievement";
}

function findGrowthPhrase(text: string): string {
  const growthWords = ['grew', 'changed', 'evolved', 'developed'];
  return findPhraseContaining(text, growthWords) || "personal growth";
}

function findAspirationPhrase(text: string): string {
  const aspirationWords = ['hope', 'dream', 'goal', 'future'];
  return findPhraseContaining(text, aspirationWords) || "your chosen field";
}

export function extractThemes(response: string): ExtractedThemes {
  const context = extractMeaningfulPhrase(response, 0);
  const keyMoment = extractMeaningfulPhrase(response, 1);
  const challenge = findChallengePhrase(response);
  const skill = findSkillPhrase(response);
  const action = findActionPhrase(response);
  const achievement = findAchievementPhrase(response);
  const growth = findGrowthPhrase(response);
  const aspiration = findAspirationPhrase(response);

  return {
    context,
    keyMoment,
    challenge,
    skill,
    action,
    achievement,
    growth,
    aspiration
  };
}
