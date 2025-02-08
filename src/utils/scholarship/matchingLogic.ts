
export const calculateMatchScore = (scholarship: any, userProfile: any): number => {
  let score = 75; // Base score

  if (userProfile?.intended_major && 
      scholarship.description?.toLowerCase().includes(userProfile.intended_major.toLowerCase())) {
    score += 10;
  }

  if (userProfile?.first_generation_student && 
      scholarship.description?.toLowerCase().includes('first generation')) {
    score += 10;
  }

  if (userProfile?.ethnicity && 
      scholarship.description?.toLowerCase().includes(userProfile.ethnicity.toLowerCase())) {
    score += 5;
  }

  return Math.min(100, score);
};

