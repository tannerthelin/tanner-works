const OWNER = 'tannerthelin'
const REPO = 'tanner-works'
const BRANCH = 'main'
const API = 'https://api.github.com'

function headers(token) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }
}

async function ghFetch(token, path, options = {}) {
  const res = await fetch(`${API}${path}`, { ...options, headers: headers(token) })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `GitHub API error: ${res.status} on ${path}`)
  }
  return res.json()
}

export async function validateToken(token) {
  try {
    const res = await fetch(`${API}/repos/${OWNER}/${REPO}`, {
      headers: headers(token),
    })
    return res.ok
  } catch {
    return false
  }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Save all changes (image uploads, image deletes, projects.json update) in a
 * single atomic commit using the GitHub Git Data API.
 *
 * This avoids creating multiple commits per save, which would otherwise:
 *   - Trigger multiple workflow runs that cancel each other (cancel-in-progress)
 *   - Risk leaving the repo in an inconsistent state if one commit fails
 */
export async function saveProjects(token, projects, imagesToUpload, imagesToDelete, message = 'Update projects') {
  // 1. Get the current commit SHA on the branch
  const ref = await ghFetch(token, `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`)
  const baseCommitSha = ref.object.sha

  // 2. Get the base tree SHA
  const baseCommit = await ghFetch(token, `/repos/${OWNER}/${REPO}/git/commits/${baseCommitSha}`)
  const baseTreeSha = baseCommit.tree.sha

  // 3. Create blobs for each new image upload
  const treeEntries = []
  for (const img of imagesToUpload) {
    const base64 = await fileToBase64(img.file)
    const blob = await ghFetch(token, `/repos/${OWNER}/${REPO}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content: base64, encoding: 'base64' }),
    })
    treeEntries.push({
      path: `public/images/work/${img.projectId}/${img.filename}`,
      mode: '100644',
      type: 'blob',
      sha: blob.sha,
    })
  }

  // 4. Create blob for projects.json
  const jsonContent = JSON.stringify(projects, null, 2) + '\n'
  const jsonBlob = await ghFetch(token, `/repos/${OWNER}/${REPO}/git/blobs`, {
    method: 'POST',
    body: JSON.stringify({
      content: btoa(unescape(encodeURIComponent(jsonContent))),
      encoding: 'base64',
    }),
  })
  treeEntries.push({
    path: 'public/data/projects.json',
    mode: '100644',
    type: 'blob',
    sha: jsonBlob.sha,
  })

  // 5. Add deletions (sha: null in tree marks the entry for removal)
  for (const img of imagesToDelete) {
    const path = img.path.startsWith('/') ? `public${img.path}` : img.path
    treeEntries.push({
      path,
      mode: '100644',
      type: 'blob',
      sha: null,
    })
  }

  // 6. Create a new tree based on the existing one
  const newTree = await ghFetch(token, `/repos/${OWNER}/${REPO}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeEntries,
    }),
  })

  // 7. Create a single commit with all changes
  const newCommit = await ghFetch(token, `/repos/${OWNER}/${REPO}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message,
      tree: newTree.sha,
      parents: [baseCommitSha],
    }),
  })

  // 8. Move the branch ref to the new commit
  await ghFetch(token, `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: newCommit.sha }),
  })
}
