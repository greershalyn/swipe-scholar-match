
export function transformScholarships(scholarshipsData: any) {
  console.log('Transforming scholarships data:', JSON.stringify(scholarshipsData, null, 2));

  if (!scholarshipsData.scholarships || !Array.isArray(scholarshipsData.scholarships)) {
    console.error('Invalid scholarships data:', scholarshipsData);
    throw new Error('Invalid scholarship data format');
  }

  return scholarshipsData.scholarships.map((s: any) => {
    // Ensure amount is a number
    const amount = typeof s.amount === 'string' ? 
      Number(s.amount.replace(/[^0-9.-]+/g, '')) : 
      Number(s.amount);

    if (isNaN(amount)) {
      console.warn(`Invalid amount for scholarship "${s.title}": ${s.amount}`);
    }

    // Generate deadline 3 months from now
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 3);

    // Validate and clean URL
    const url = s.source_url && typeof s.source_url === 'string' ? 
      s.source_url.trim() : 
      null;

    // Enhanced URL validation
    const isValidUrl = (url: string | null): boolean => {
      if (!url) return false;
      try {
        const parsedUrl = new URL(url);
        // Check for common scholarship domains
        const validDomains = [
          '.edu',
          '.gov',
          'fastweb.com',
          'scholarships.com',
          'unigo.com',
          'cappex.com',
          'chegg.com',
          'collegeboard.org',
          'petersons.com',
          'niche.com',
          'salliemae.com',
          'studentaid.gov',
          'nsf.gov',
          'nacme.org'
        ];
        return validDomains.some(domain => parsedUrl.hostname.endsWith(domain)) ||
               (parsedUrl.protocol === 'https:' && 
                !parsedUrl.hostname.includes('example.com') &&
                !parsedUrl.hostname.includes('placeholder'));
      } catch {
        return false;
      }
    };

    // Generate a fallback URL for search
    const getFallbackUrl = (title: string, provider: string): string => {
      const searchQuery = encodeURIComponent(`${title} ${provider} scholarship application`);
      return `https://www.google.com/search?q=${searchQuery}`;
    };

    const validatedUrl = isValidUrl(url) ? url : getFallbackUrl(s.title, s.provider);

    const transformed = {
      id: crypto.randomUUID(),
      title: String(s.title || '').trim(),
      amount: isNaN(amount) ? 0 : amount,
      deadline: deadline.toISOString(),
      requirements: Array.isArray(s.requirements) ? 
        s.requirements.map((r: any) => String(r)) : 
        [],
      provider: String(s.provider || 'Unknown Provider').trim(),
      url: validatedUrl,
      description: String(s.description || '').trim(),
      category: String(s.category || 'General').trim(),
      is_active: true,
      verified: false,
      last_verified_at: new Date().toISOString(),
      source_url: validatedUrl,
      match_score: null,
      created_at: new Date().toISOString()
    };

    console.log('Transformed scholarship:', transformed);
    return transformed;
  });
}
