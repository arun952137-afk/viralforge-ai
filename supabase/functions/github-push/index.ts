import { serve } from "https://deno.land/std@0.208.0/http/server.ts"

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { token, files, message } = await req.json()
    const owner = 'arun952137-afk'
    const repo = 'viralforge-ai'
    const branch = 'main'

    // Get current commit SHA for branch
    const branchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
      headers: { Authorization: `token ${token}`, 'User-Agent': 'CREOVA-Deploy' }
    })
    const branchData = await branchRes.json()
    const latestCommitSha = branchData.object?.sha

    if (!latestCommitSha) {
      return new Response(JSON.stringify({ error: 'Could not get branch SHA', detail: branchData }), { status: 400, headers: corsHeaders })
    }

    // Get base tree SHA
    const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, {
      headers: { Authorization: `token ${token}`, 'User-Agent': 'CREOVA-Deploy' }
    })
    const commitData = await commitRes.json()
    const baseTreeSha = commitData.tree?.sha

    // Create blobs for each file
    const treeItems = []
    for (const file of files) {
      const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        headers: { Authorization: `token ${token}`, 'User-Agent': 'CREOVA-Deploy', 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: file.content, encoding: 'base64' })
      })
      const blob = await blobRes.json()
      treeItems.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha })
    }

    // Create new tree
    const newTreeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers: { Authorization: `token ${token}`, 'User-Agent': 'CREOVA-Deploy', 'Content-Type': 'application/json' },
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems })
    })
    const newTree = await newTreeRes.json()

    // Create commit
    const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers: { Authorization: `token ${token}`, 'User-Agent': 'CREOVA-Deploy', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, tree: newTree.sha, parents: [latestCommitSha] })
    })
    const newCommit = await newCommitRes.json()

    // Update branch ref
    const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers: { Authorization: `token ${token}`, 'User-Agent': 'CREOVA-Deploy', 'Content-Type': 'application/json' },
      body: JSON.stringify({ sha: newCommit.sha, force: true })
    })
    const updateRef = await updateRefRes.json()

    return new Response(JSON.stringify({ 
      success: true, 
      commit: newCommit.sha,
      url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders })
  }
})
