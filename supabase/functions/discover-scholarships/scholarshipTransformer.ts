
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
        
        // Check if URL uses HTTPS
        if (parsedUrl.protocol !== 'https:') {
          console.warn(`Non-HTTPS URL detected for "${s.title}": ${url}`);
          return false;
        }
        
        // More extensive list of valid domains for scholarships
        const validDomains = [
          '.edu',
          '.gov',
          '.org',
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
          'nacme.org',
          'bigfuture.collegeboard.org',
          'scholarshipamerica.org',
          'thurgoodmarshallfund.net',
          'uncf.org',
          'hispanicfund.org',
          'apiasf.org',
          'hsf.net',
          'gmsp.org',
          'jkcf.org',
          'scholarshipowl.com'
        ];
        
        // Check for known scholarship domains
        const domainValid = validDomains.some(domain => 
          parsedUrl.hostname.endsWith(domain) || 
          parsedUrl.hostname.includes(domain)
        );
        
        // Check for suspicious or placeholder URLs
        const suspiciousPatterns = [
          'example.com',
          'placeholder',
          'test',
          'lorem',
          'undefined',
          'null',
          'unknown'
        ];
        
        const hasSuspiciousPattern = suspiciousPatterns.some(pattern => 
          parsedUrl.hostname.includes(pattern) || 
          parsedUrl.pathname.includes(pattern)
        );
        
        return domainValid && !hasSuspiciousPattern;
      } catch (error) {
        console.error(`Invalid URL format for "${s.title}": ${url}`, error);
        return false;
      }
    };

    // Generate a better fallback URL for search
    const getFallbackUrl = (title: string, provider: string): string => {
      // Create a more specific search query to help find the application
      const searchTerms = [
        title,
        provider,
        'scholarship',
        'application',
        'apply',
        'deadline',
        'eligibility'
      ].filter(Boolean);
      
      const searchQuery = encodeURIComponent(searchTerms.join(' '));
      // Return a Google search with specific search parameters
      return `https://www.google.com/search?q=${searchQuery}&tbm=lcl`;
    };

    // Prioritize the most specific URL available
    let validatedUrl: string;
    
    if (isValidUrl(url)) {
      validatedUrl = url as string;
      console.log(`Valid direct URL found for "${s.title}": ${validatedUrl}`);
    } else if (s.provider_url && isValidUrl(s.provider_url)) {
      validatedUrl = s.provider_url;
      console.log(`Using provider URL for "${s.title}": ${validatedUrl}`);
    } else {
      validatedUrl = getFallbackUrl(s.title, s.provider);
      console.log(`Generated fallback search URL for "${s.title}": ${validatedUrl}`);
    }

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
