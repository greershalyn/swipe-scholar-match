
export interface EssaySuggestion {
  title: string;
  hook: string;
  framework: string;
}

export interface ExpandedFramework {
  title: string;
  hook: string;
  talkingPoints: {
    title: string;
    points: string[];
  }[];
  conclusion: string;
}

export interface PromptCategories {
  [key: string]: string[];
}
