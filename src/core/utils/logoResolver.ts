export interface EnrichmentResult {
  logoUrl: string;
  source: 'direct' | 'brandfetch' | 'domain-favicon' | 'microlink' | 'instagram-avatar' | 'avatar';
  brandName?: string;
  exactSocialUrl?: string;
}

export function isDirectImageUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  if (lower.startsWith('data:image/')) return true;
  if (lower.includes('cdninstagram.com') || lower.includes('fbcdn.net')) return true;
  if (lower.includes('googleusercontent.com') || lower.includes('unsplash.com')) return true;
  return /\.(jpg|jpeg|png|webp|svg|gif)(\?.*)?$/i.test(lower);
}

export function cleanSocialHandle(val: string): { handle: string; fullUrl: string; isInstagram: boolean; isWeb: boolean } {
  if (!val) return { handle: '', fullUrl: '', isInstagram: false, isWeb: false };
  const trimmed = val.trim();
  const isIg = /instagram\.com/i.test(trimmed) || trimmed.startsWith('@');

  if (isIg) {
    const clean = trimmed
      .replace(/^@/, '')
      .replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '')
      .replace(/\?.*$/, '')
      .replace(/\/$/, '')
      .trim();

    return {
      handle: clean,
      fullUrl: clean ? `https://www.instagram.com/${clean}/` : '',
      isInstagram: true,
      isWeb: false,
    };
  }

  const hasProtocol = /^https?:\/\//i.test(trimmed);
  const fullUrl = hasProtocol ? trimmed : `https://${trimmed}`;
  return {
    handle: trimmed,
    fullUrl,
    isInstagram: false,
    isWeb: true,
  };
}

export function extractDomain(val: string): string {
  try {
    const url = val.startsWith('http') ? val : `https://${val}`;
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return val.replace(/^www\./, '').split('/')[0];
  }
}

export async function searchBrandfetchAPI(query: string): Promise<{ name: string; icon: string } | null> {
  const clean = query.trim().replace(/^@/, '');
  if (!clean || clean.length < 2) return null;

  try {
    const res = await fetch(`https://api.brandfetch.io/v2/search/${encodeURIComponent(clean)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0]?.icon) {
      return { name: data[0].name, icon: data[0].icon };
    }
  } catch {
    // Silently continue
  }
  return null;
}

export async function resolveEnrichedLogo(
  socialOrUrl: string,
  businessName: string
): Promise<EnrichmentResult> {
  const input = socialOrUrl.trim();
  const name = businessName.trim();

  // 1. Direct image link
  if (isDirectImageUrl(input)) {
    return { logoUrl: input, source: 'direct' };
  }

  // 2. Exact Instagram Account
  const { handle, isInstagram, fullUrl } = cleanSocialHandle(input);
  if (isInstagram && handle) {
    // Try Microlink for direct profile photo
    try {
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(fullUrl)}`);
      if (res.ok) {
        const json = await res.json();
        const found = json?.data?.image?.url || json?.data?.logo?.url;
        if (found && typeof found === 'string' && (found.includes('cdninstagram') || found.includes('fbcdn'))) {
          return {
            logoUrl: found,
            source: 'microlink',
            brandName: `@${handle}`,
            exactSocialUrl: fullUrl,
          };
        }
      }
    } catch {
      // Fallback to avatar
    }

    // High quality Instagram styled badge strictly for THIS exact account handle
    return {
      logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(handle)}&background=E1306C&color=fff&size=128&bold=true`,
      source: 'instagram-avatar',
      brandName: `@${handle}`,
      exactSocialUrl: fullUrl,
    };
  }

  // 3. Web domain favicon
  if (input.includes('.') && !input.startsWith('@')) {
    const domain = extractDomain(input);
    return {
      logoUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
      source: 'domain-favicon',
      brandName: domain,
      exactSocialUrl: input.startsWith('http') ? input : `https://${input}`,
    };
  }

  // 4. Exact brand name search
  if (name) {
    const brandMatch = await searchBrandfetchAPI(name);
    if (brandMatch) {
      return { logoUrl: brandMatch.icon, source: 'brandfetch', brandName: brandMatch.name };
    }
  }

  return {
    logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Comercio')}&background=4f46e5&color=fff&size=128&bold=true`,
    source: 'avatar',
  };
}
