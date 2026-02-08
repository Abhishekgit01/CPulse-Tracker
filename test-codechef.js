const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0',
      'Accept': 'text/html',
    }}, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    }).on('error', reject);
  });
}

async function main() {
  const r = await fetch('https://www.codechef.com/users/aryanc403');
  const body = r.body;

  // Extract rating number
  const ratingNumber = body.match(/rating-number[^>]*>(\d+)/);
  console.log('Rating:', ratingNumber?.[1]);
  
  // Extract rating stars
  const starsMatch = body.match(/rating-star[^"]*"/g);
  console.log('Stars HTML matches:', starsMatch);
  
  // Look for star count in different way
  const starSpan = body.match(/<span[^>]*class="[^"]*rating[^"]*"[^>]*>[\s\S]*?<\/span>/gi);
  if (starSpan) starSpan.slice(0,5).forEach((s,i) => console.log(`Star span ${i}:`, s.substring(0,200)));
  
  // Extract highest rating 
  const highest = body.match(/Highest Rating[^<]*<[^>]*>(\d+)/i);
  console.log('Highest Rating:', highest?.[1]);
  
  // Look for div with rating header info
  const ratingHeader = body.match(/rating-header[^"]*"[^>]*>([\s\S]*?)<\//);
  console.log('Rating header:', ratingHeader?.[1]?.substring(0, 200));

  // Extract global rank and country rank
  const globalRank = body.match(/Global Rank[^<]*<[^>]*>(\d+)/i);
  const countryRank = body.match(/Country Rank[^<]*<[^>]*>(\d+)/i);
  console.log('Global Rank:', globalRank?.[1]);
  console.log('Country Rank:', countryRank?.[1]);
  
  // Look for user details section - problems solved etc.
  const problemsSolved = body.match(/Problems Solved[^<]*<[^>]*>(\d+)/i);
  console.log('Problems Solved:', problemsSolved?.[1]);

  // Division
  const divMatch = body.match(/Div\s*(\d)/i);
  console.log('Division:', divMatch?.[1]);

  // All rating data - first entry to check color field
  const ratingMatch = body.match(/var\s+all_rating\s*=\s*(\[.*?\]);/s);
  if (ratingMatch) {
    const data = JSON.parse(ratingMatch[1]);
    console.log('\nFirst entry full:', JSON.stringify(data[0], null, 2));
    console.log('Last entry full:', JSON.stringify(data[data.length-1], null, 2));
    console.log('Total contests:', data.length);
    
    // Check color values
    const colors = new Set(data.map(d => d.color));
    console.log('Unique colors:', [...colors]);
  }

  // Look for username display  
  const displayName = body.match(/<h1[^>]*class="[^"]*h2-style[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
  console.log('Display name:', displayName?.[1]?.trim()?.substring(0, 100));

  // Country
  const country = body.match(/Country[^<]*<[^>]*>[^<]*<[^>]*>([^<]+)/i);
  console.log('Country:', country?.[1]?.trim());
}

main();
