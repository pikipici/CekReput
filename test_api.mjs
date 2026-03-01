async function run() {
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@cekreput.com', password: 'DemoPassword123!' })
  });
  const { accessToken } = await loginRes.json();

  const res = await fetch('http://localhost:3001/api/moderation/pending?page=1&limit=10', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const data = await res.json();
  
  data.reports.forEach(r => {
    console.log(`Report #${r.id.substring(0,8)} | Files:`);
    r.evidenceFiles.forEach(f => console.log(`   - ${f.fileName} (${f.fileUrl})`));
  });
}
run();
