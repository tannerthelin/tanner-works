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

export async function getFileContent(token, path) {
  const res = await fetch(
    `${API}/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`,
    { headers: headers(token) }
  )
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
  const data = await res.json()
  return { content: atob(data.content), sha: data.sha }
}

export async function updateFile(token, path, content, sha, message) {
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: BRANCH,
  }
  if (sha) body.sha = sha
  const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Failed to update ${path}: ${res.status}`)
  }
  return res.json()
}

export async function updateFileBinary(token, path, base64Content, sha, message) {
  const body = {
    message,
    content: base64Content,
    branch: BRANCH,
  }
  if (sha) body.sha = sha
  const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Failed to upload ${path}: ${res.status}`)
  }
  return res.json()
}

export async function deleteFile(token, path, sha, message) {
  const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'DELETE',
    headers: headers(token),
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Failed to delete ${path}: ${res.status}`)
  }
  return res.json()
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

export async function saveProjects(token, projects, imagesToUpload, imagesToDelete) {
  // 1. Upload new images
  for (const img of imagesToUpload) {
    const base64 = await fileToBase64(img.file)
    const path = `public/images/work/${img.projectId}/${img.filename}`
    await updateFileBinary(token, path, base64, null, `Add image: ${img.filename}`)
  }

  // 2. Delete removed images
  for (const img of imagesToDelete) {
    const path = img.path.startsWith('/') ? `public${img.path}` : img.path
    const existing = await getFileContent(token, path)
    if (existing) {
      await deleteFile(token, path, existing.sha, `Remove image: ${img.filename}`)
    }
  }

  // 3. Update projects.json last
  const jsonPath = 'public/data/projects.json'
  const existing = await getFileContent(token, jsonPath)
  const content = JSON.stringify(projects, null, 2) + '\n'
  await updateFile(
    token,
    jsonPath,
    content,
    existing ? existing.sha : null,
    'Update projects'
  )
}
