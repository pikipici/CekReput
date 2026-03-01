const url = 'https://pub-4f0c21d1a2984b55868869034fa170d3.r2.dev/1772259954777-sss.png';
async function run() {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const urlObj = new URL(url)
    const filename = urlObj.pathname.split('/').pop() || 'downloaded-file'
    
    console.log('Success!', contentType, filename);
  } catch(error) {
    console.error('Download Proxy Error:', error)
  }
}
run();
