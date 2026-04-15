import { useState, useEffect, useRef } from 'react'
import { Reorder, useDragControls } from 'motion/react'
import { useTheme } from '../context/ThemeContext.jsx'
import { validateToken, saveProjects } from '../lib/github.js'
import sunIcon from '../assets/icons/sun.svg'
import moonIcon from '../assets/icons/moon.svg'
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
  const [images, setImages] = useState(() =>
    project.images.map((img, i) => ({
      ...img,
      _id: `img-${i}-${img.src || img.label || 'empty'}`,
    }))
  )
  const [pendingUploads, setPendingUploads] = useState([])
  const [pendingDeletes, setPendingDeletes] = useState([])
  const [sizeWarnings, setSizeWarnings] = useState([])
  const [closing, setClosing] = useState(false)
  const [entered, setEntered] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true))
  }, [])

  function handleClose() {
    setClosing(true)
    setTimeout(onCancel, 200)
  }

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

    const newImages = accepted.map((file, i) => ({
      label: file.name.replace(/\.[^.]+$/, ''),
      src: URL.createObjectURL(file),
      _file: file,
      _isNew: true,
      _id: `new-${Date.now()}-${i}`,
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

  function removeImage(imageToRemove) {
    if (!imageToRemove._isNew && imageToRemove.src) {
      setPendingDeletes(prev => [...prev, { path: imageToRemove.src, filename: imageToRemove.src.split('/').pop() }])
    }
    if (imageToRemove._isNew) {
      setPendingUploads(prev => prev.filter(u => u.filename !== imageToRemove._file.name))
    }
    setImages(prev => prev.filter(img => img._id !== imageToRemove._id))
  }

  function updateImageLabel(imageToUpdate, label) {
    setImages(prev => prev.map(img => img._id === imageToUpdate._id ? { ...img, label } : img))
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
    <div className={`edit-modal-overlay${entered && !closing ? ' entered' : ''}`} onClick={handleClose}>
      <div className={`edit-modal${entered && !closing ? ' entered' : ''}`} onClick={e => e.stopPropagation()}>
        <h2>{isNew ? 'New Project' : `Edit — ${project.title}`}</h2>

        <div className="edit-form-row">
          <div className="edit-form-group">
            <label className="edit-form-label">Year</label>
            <input className="edit-input" value={form.year || ''} onChange={e => set('year', e.target.value)} />
          </div>
          <div className="edit-form-group">
            <label className="edit-form-label">Client</label>
            <input className="edit-input" value={form.client || ''} onChange={e => set('client', e.target.value)} />
          </div>
        </div>

        <div className="edit-form-group">
          <label className="edit-form-label">Title</label>
          <input className="edit-input" value={form.title || ''} onChange={e => set('title', e.target.value)} />
        </div>

        <div className="edit-form-group">
          <label className="edit-form-label">Description</label>
          <textarea className="edit-input edit-textarea" value={form.description || ''} onChange={e => set('description', e.target.value)} />
        </div>

        <div className="edit-form-row">
          <div className="edit-form-group">
            <label className="edit-form-label">Status</label>
            <input className="edit-input" value={form.status || ''} onChange={e => set('status', e.target.value)} placeholder="e.g. Coming Soon" />
          </div>
          <div className="edit-form-group">
            <label className="edit-form-label">Link</label>
            <input className="edit-input" value={form.link || ''} onChange={e => set('link', e.target.value)} placeholder="e.g. /playlogged" />
          </div>
        </div>

        <div className="edit-form-group">
          <label className="edit-form-label">Images</label>
          <Reorder.Group
            as="div"
            axis="y"
            values={images}
            onReorder={setImages}
            className="edit-image-grid"
          >
            {images.map(img => (
              <ImageItem
                key={img._id}
                image={img}
                onRemove={() => removeImage(img)}
                onLabelChange={label => updateImageLabel(img, label)}
              />
            ))}
            <div className="edit-image-add" onClick={() => fileRef.current.click()}>+</div>
          </Reorder.Group>
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
              className="edit-modal-link-btn"
              disabled={saving}
              onClick={() => {
                if (confirm(`Delete "${project.title}"? This cannot be undone.`)) {
                  onDelete(project)
                }
              }}
            >
              Delete
            </button>
          )}
          <div className="edit-modal-actions-right">
            <button className="edit-modal-link-btn" onClick={handleClose} disabled={saving}>Cancel</button>
            <button className="edit-modal-link-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImageItem({ image, onRemove, onLabelChange }) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      as="div"
      value={image}
      className="edit-image-item"
      dragListener={false}
      dragControls={controls}
    >
      <div
        className="edit-image-thumb"
        onPointerDown={e => controls.start(e)}
      >
        {image.src && <img src={image.src} alt={image.label} draggable={false} />}
      </div>
      <button
        type="button"
        className="edit-image-delete"
        onClick={onRemove}
      >
        ×
      </button>
      <input
        type="text"
        className="edit-image-label-input"
        value={image.label || ''}
        onChange={e => onLabelChange(e.target.value)}
        placeholder="Label"
      />
    </Reorder.Item>
  )
}

function ProjectRow({ project, onEdit }) {
  const controls = useDragControls()
  return (
    <Reorder.Item value={project} className="edit-project-card" dragListener={false} dragControls={controls}>
      <div className="edit-project-drag-handle" onPointerDown={e => controls.start(e)}>
        <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M9.5 8C10.3284 8 11 7.32843 11 6.5C11 5.67157 10.3284 5 9.5 5C8.67157 5 8 5.67157 8 6.5C8 7.32843 8.67157 8 9.5 8ZM9.5 14C10.3284 14 11 13.3284 11 12.5C11 11.6716 10.3284 11 9.5 11C8.67157 11 8 11.6716 8 12.5C8 13.3284 8.67157 14 9.5 14ZM11 18.5C11 19.3284 10.3284 20 9.5 20C8.67157 20 8 19.3284 8 18.5C8 17.6716 8.67157 17 9.5 17C10.3284 17 11 17.6716 11 18.5ZM15.5 8C16.3284 8 17 7.32843 17 6.5C17 5.67157 16.3284 5 15.5 5C14.6716 5 14 5.67157 14 6.5C14 7.32843 14.6716 8 15.5 8ZM17 12.5C17 13.3284 16.3284 14 15.5 14C14.6716 14 14 13.3284 14 12.5C14 11.6716 14.6716 11 15.5 11C16.3284 11 17 11.6716 17 12.5ZM15.5 20C16.3284 20 17 19.3284 17 18.5C17 17.6716 16.3284 17 15.5 17C14.6716 17 14 17.6716 14 18.5C14 19.3284 14.6716 20 15.5 20Z" fill="currentColor"/>
        </svg>
      </div>
      <div className="edit-project-card-info">
        <span>{project.title}</span>
        <span className="edit-project-card-meta">{project.year} — {project.client}</span>
      </div>
      <button className="edit-project-edit-btn" onClick={() => onEdit(project)}>Edit</button>
    </Reorder.Item>
  )
}

function Edit() {
  const { theme, toggleTheme } = useTheme()
  const [authed, setAuthed] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('gh_token') || '')
  const [tokenReady, setTokenReady] = useState(false)
  const [projects, setProjects] = useState(null)
  const [savedOrder, setSavedOrder] = useState(null)
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
      .then(data => { setProjects(data); setSavedOrder(data) })
      .catch(() => { setProjects([]); setSavedOrder([]) })
  }, [authed])

  const orderChanged = projects && savedOrder &&
    projects.map(p => p.id).join(',') !== savedOrder.map(p => p.id).join(',')

  function cancelReorder() {
    setProjects(savedOrder)
  }

  async function saveReorder() {
    setSaving(true)
    setError('')
    try {
      await saveProjects(token, projects, [], [], 'Project reorder')
      setSavedOrder(projects)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

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

      const message = idx >= 0
        ? `Update project: ${updatedProject.title}`
        : `Add project: ${updatedProject.title}`
      await saveProjects(token, updated, imagesToUpload, imagesToDelete, message)
      setProjects(updated)
      setSavedOrder(updated)
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

      await saveProjects(token, updated, [], imagesToDelete, `Delete project: ${project.title}`)
      setProjects(updated)
      setSavedOrder(updated)
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
        <button className="edit-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <img src={theme === 'light' ? sunIcon : moonIcon} alt="" />
        </button>
      </div>

      <div className="edit-page">
        <h1>Projects</h1>

        {error && <p className="edit-error" style={{ marginBottom: 16 }}>{error}</p>}

        {!projects ? (
          <p style={{ opacity: 0.4 }}>Loading...</p>
        ) : (
          <>
            <Reorder.Group axis="y" values={projects} onReorder={setProjects} className="edit-project-list">
              {projects.map(project => (
                <ProjectRow key={project.id} project={project} onEdit={setEditing} />
              ))}
            </Reorder.Group>

            <div className={`edit-reorder-actions${orderChanged ? ' visible' : ''}`}>
              <div className="edit-reorder-actions-inner">
                <button onClick={cancelReorder} disabled={saving}>Cancel</button>
                <button onClick={saveReorder} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Order'}
                </button>
              </div>
            </div>

            <button
              className="edit-btn-ghost edit-add-btn"
              disabled={orderChanged}
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
