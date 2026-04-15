import { useState, useEffect, useRef } from 'react'
import { validateToken, saveProjects } from '../lib/github.js'
import './Edit.css'

const PASSWORD = 'sundance'
const MAX_FILE_SIZE = 25 * 1024 * 1024
const WARN_FILE_SIZE = 5 * 1024 * 1024

function PasswordGate({ onPass }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (value === PASSWORD) {
      onPass()
    } else {
      setError('Wrong password')
    }
  }

  return (
    <div className="edit-gate">
      <form className="edit-gate-form" onSubmit={handleSubmit}>
        <h1>Enter password</h1>
        <input
          type="password"
          className="edit-input"
          value={value}
          onChange={e => { setValue(e.target.value); setError('') }}
          placeholder="Password"
          autoFocus
        />
        {error && <p className="edit-error">{error}</p>}
        <button type="submit" className="edit-btn-primary">Continue</button>
      </form>
    </div>
  )
}

function TokenSetup({ onReady }) {
  const [value, setValue] = useState('')
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setValidating(true)
    setError('')
    const valid = await validateToken(value.trim())
    setValidating(false)
    if (valid) {
      localStorage.setItem('gh_token', value.trim())
      onReady(value.trim())
    } else {
      setError('Invalid token — needs repo access to tannerthelin/tanner-works')
    }
  }

  return (
    <div className="edit-token-setup">
      <h1>GitHub Token</h1>
      <p>Enter a GitHub Personal Access Token with repo access.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="password"
          className="edit-input"
          value={value}
          onChange={e => { setValue(e.target.value); setError('') }}
          placeholder="ghp_..."
          autoFocus
        />
        {error && <p className="edit-error">{error}</p>}
        <button type="submit" className="edit-btn-primary" disabled={validating || !value.trim()}>
          {validating ? 'Validating...' : 'Save Token'}
        </button>
      </form>
    </div>
  )
}

function EditModal({ project, onSave, onCancel, onDelete, saving }) {
  const [form, setForm] = useState({ ...project })
  const [images, setImages] = useState(project.images.map(img => ({ ...img })))
  const [pendingUploads, setPendingUploads] = useState([])
  const [pendingDeletes, setPendingDeletes] = useState([])
  const [sizeWarnings, setSizeWarnings] = useState([])
  const fileRef = useRef()

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleFiles(e) {
    const files = Array.from(e.target.files)
    const warnings = []
    const accepted = []

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        warnings.push(`${file.name} exceeds 25MB and was rejected`)
        continue
      }
      if (file.size > WARN_FILE_SIZE) {
        warnings.push(`${file.name} is over 5MB — consider compressing`)
      }
      accepted.push(file)
    }

    setSizeWarnings(warnings)

    const newImages = accepted.map(file => ({
      label: file.name.replace(/\.[^.]+$/, ''),
      src: URL.createObjectURL(file),
      _file: file,
      _isNew: true,
    }))

    setImages(prev => [...prev, ...newImages])
    setPendingUploads(prev => [
      ...prev,
      ...accepted.map(file => ({
        file,
        filename: file.name,
        projectId: form.id,
      })),
    ])

    e.target.value = ''
  }

  function removeImage(index) {
    const img = images[index]
    if (!img._isNew && img.src) {
      setPendingDeletes(prev => [...prev, { path: img.src, filename: img.src.split('/').pop() }])
    }
    if (img._isNew) {
      setPendingUploads(prev => prev.filter(u => u.filename !== img._file.name))
    }
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  function updateImageLabel(index, label) {
    setImages(prev => prev.map((img, i) => i === index ? { ...img, label } : img))
  }

  function handleSave() {
    const finalImages = images.map(img => {
      if (img._isNew) {
        return {
          label: img.label,
          src: `/images/work/${form.id}/${img._file.name}`,
        }
      }
      return { label: img.label, src: img.src }
    })
    onSave({ ...form, images: finalImages }, pendingUploads, pendingDeletes)
  }

  const isNew = !project.id

  return (
    <div className="edit-modal-overlay" onClick={onCancel}>
      <div className="edit-modal" onClick={e => e.stopPropagation()}>
        <h2>{isNew ? 'New Project' : `Edit — ${project.title}`}</h2>

        <div className="edit-form-group">
          <label className="edit-form-label">Year</label>
          <input className="edit-input" value={form.year || ''} onChange={e => set('year', e.target.value)} />
        </div>

        <div className="edit-form-group">
          <label className="edit-form-label">Client</label>
          <input className="edit-input" value={form.client || ''} onChange={e => set('client', e.target.value)} />
        </div>

        <div className="edit-form-group">
          <label className="edit-form-label">Title</label>
          <input className="edit-input" value={form.title || ''} onChange={e => set('title', e.target.value)} />
        </div>

        <div className="edit-form-group">
          <label className="edit-form-label">Description</label>
          <textarea className="edit-input edit-textarea" value={form.description || ''} onChange={e => set('description', e.target.value)} />
        </div>

        <div className="edit-form-group">
          <label className="edit-form-label">Status</label>
          <input className="edit-input" value={form.status || ''} onChange={e => set('status', e.target.value)} placeholder="e.g. Coming Soon" />
        </div>

        <div className="edit-form-group">
          <label className="edit-form-label">Link</label>
          <input className="edit-input" value={form.link || ''} onChange={e => set('link', e.target.value)} placeholder="e.g. /playlogged" />
        </div>

        <div className="edit-form-group">
          <label className="edit-checkbox-row">
            <input type="checkbox" checked={!!form.ai} onChange={e => set('ai', e.target.checked)} />
            Built with AI
          </label>
        </div>

        <div className="edit-form-group">
          <label className="edit-form-label">Images</label>
          <div className="edit-image-grid">
            {images.map((img, i) => (
              <div key={i} className="edit-image-item">
                <div className="edit-image-thumb">
                  {img.src && <img src={img.src} alt={img.label} />}
                </div>
                <button className="edit-image-delete" onClick={() => removeImage(i)}>×</button>
                <input
                  className="edit-image-label-input"
                  value={img.label}
                  onChange={e => updateImageLabel(i, e.target.value)}
                  placeholder="Label"
                />
              </div>
            ))}
            <div className="edit-image-add" onClick={() => fileRef.current.click()}>+</div>
          </div>
          {sizeWarnings.map((w, i) => (
            <p key={i} className="edit-image-warning">{w}</p>
          ))}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFiles}
          />
        </div>

        <div className="edit-modal-actions">
          {!isNew && (
            <button
              className="edit-btn-danger"
              disabled={saving}
              onClick={() => {
                if (confirm(`Delete "${project.title}"? This cannot be undone.`)) {
                  onDelete(project)
                }
              }}
            >
              Delete Project
            </button>
          )}
          <div className="edit-modal-actions-right">
            <button className="edit-btn-ghost" onClick={onCancel} disabled={saving} style={{ marginRight: 12 }}>Cancel</button>
            <button className="edit-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Edit() {
  const [authed, setAuthed] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('gh_token') || '')
  const [tokenReady, setTokenReady] = useState(false)
  const [projects, setProjects] = useState(null)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    validateToken(token).then(valid => {
      if (valid) setTokenReady(true)
      else {
        localStorage.removeItem('gh_token')
        setToken('')
      }
    })
  }, [token])

  useEffect(() => {
    if (!authed) return
    fetch(`/data/projects.json?t=${Date.now()}`)
      .then(res => res.json())
      .then(setProjects)
      .catch(() => setProjects([]))
  }, [authed])

  function clearToken() {
    localStorage.removeItem('gh_token')
    setToken('')
    setTokenReady(false)
  }

  async function handleSave(updatedProject, imagesToUpload, imagesToDelete) {
    setSaving(true)
    setError('')
    try {
      if (!updatedProject.id) {
        updatedProject.id = updatedProject.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      }

      let updated
      const idx = projects.findIndex(p => p.id === editing.id)
      if (idx >= 0) {
        updated = projects.map((p, i) => i === idx ? updatedProject : p)
      } else {
        updated = [...projects, updatedProject]
      }

      // Clean up empty optional fields
      updated = updated.map(p => {
        const clean = { ...p }
        if (!clean.status) delete clean.status
        if (!clean.link) delete clean.link
        if (!clean.ai) delete clean.ai
        return clean
      })

      await saveProjects(token, updated, imagesToUpload, imagesToDelete)
      setProjects(updated)
      setEditing(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(project) {
    setSaving(true)
    setError('')
    try {
      const updated = projects.filter(p => p.id !== project.id)

      const imagesToDelete = (project.images || [])
        .filter(img => img.src)
        .map(img => ({ path: img.src, filename: img.src.split('/').pop() }))

      await saveProjects(token, updated, [], imagesToDelete)
      setProjects(updated)
      setEditing(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!authed) {
    return <PasswordGate onPass={() => setAuthed(true)} />
  }

  if (!tokenReady) {
    return (
      <TokenSetup onReady={t => {
        setToken(t)
        setTokenReady(true)
      }} />
    )
  }

  return (
    <div className="page">
      <div className="edit-token-bar">
        <span>Token: ••••{token.slice(-4)}</span>
        <button onClick={clearToken}>Clear</button>
      </div>

      <div className="edit-page">
        <h1>Projects</h1>

        {error && <p className="edit-error" style={{ marginBottom: 16 }}>{error}</p>}

        {!projects ? (
          <p style={{ opacity: 0.4 }}>Loading...</p>
        ) : (
          <>
            <div className="edit-project-list">
              {projects.map(project => (
                <button
                  key={project.id}
                  className="edit-project-card"
                  onClick={() => setEditing(project)}
                >
                  <div className="edit-project-card-info">
                    <span>{project.title}</span>
                    <span className="edit-project-card-meta">{project.year} — {project.client}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              className="edit-btn-ghost edit-add-btn"
              onClick={() => setEditing({
                id: '',
                title: '',
                description: '',
                year: new Date().getFullYear().toString(),
                client: '',
                images: [],
              })}
            >
              + Add Project
            </button>
          </>
        )}
      </div>

      {editing && (
        <EditModal
          project={editing}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setError('') }}
          onDelete={handleDelete}
          saving={saving}
        />
      )}
    </div>
  )
}

export default Edit
