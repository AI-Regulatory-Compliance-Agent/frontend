/**
 * CompanyForm — Multi-field company profile form.
 *
 * Collects all inputs for the CompanyProfileRequest schema.
 * Supports "Other" free-text for data types and regions.
 *
 * DYNAMIC FORM LEVELS:
 *   - Minimal: Company name, industry, regions, brief description
 *   - Partial: + business type, analysis type, data types, product name,
 *              existing compliance, document upload
 *   - Full:    + technical architecture, data processing details,
 *              third-party integrations, employee count, revenue range,
 *              document upload
 *
 * Document uploads (PDF/DOC/DOCX) are available in partial and full modes.
 * Uploaded files are sent to the backend for RAG processing.
 */

import { useState, useEffect, useRef } from 'react';
import api from '../api/client';

// ── Option definitions ──────────────────────────────────────
const INDUSTRIES = [
  { value: 'fintech', label: 'Fintech' },
  { value: 'healthtech', label: 'Healthtech' },
  { value: 'edtech', label: 'Edtech' },
  { value: 'saas', label: 'SaaS' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'managed_services', label: 'Managed Services' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'other', label: 'Other' },
];

const BUSINESS_TYPES = [
  { value: 'software_product', label: 'Software Product' },
  { value: 'physical_product', label: 'Physical Product' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'managed_services', label: 'Managed Services' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'other', label: 'Other' },
];

const DATA_TYPES = [
  { value: 'personal_identifiable', label: 'Personal / PII' },
  { value: 'financial', label: 'Financial' },
  { value: 'health', label: 'Health' },
  { value: 'biometric', label: 'Biometric' },
  { value: 'children_data', label: "Children's Data" },
  { value: 'behavioral', label: 'Behavioral / Analytics' },
  { value: 'location', label: 'Location / GPS' },
  { value: 'communications', label: 'Communications' },
  { value: 'employment', label: 'Employment / HR' },
  { value: 'none', label: 'None' },
  { value: 'other', label: 'Other' },
];

const REGIONS = [
  { value: 'india', label: '🇮🇳 India' },
  { value: 'eu', label: '🇪🇺 EU' },
  { value: 'us', label: '🇺🇸 US' },
  { value: 'uk', label: '🇬🇧 UK' },
  { value: 'singapore', label: '🇸🇬 Singapore' },
  { value: 'uae', label: '🇦🇪 UAE' },
  { value: 'japan', label: '🇯🇵 Japan' },
  { value: 'australia', label: '🇦🇺 Australia' },
  { value: 'global', label: '🌍 Global' },
  { value: 'other', label: 'Other' },
];

const EMPLOYEE_COUNTS = [
  { value: '1-10', label: '1–10 (Startup)' },
  { value: '11-50', label: '11–50 (Small)' },
  { value: '51-250', label: '51–250 (Medium)' },
  { value: '251-1000', label: '251–1,000 (Large)' },
  { value: '1000+', label: '1,000+ (Enterprise)' },
];

const REVENUE_RANGES = [
  { value: 'pre-revenue', label: 'Pre-Revenue' },
  { value: 'under-1m', label: 'Under $1M' },
  { value: '1m-10m', label: '$1M – $10M' },
  { value: '10m-50m', label: '$10M – $50M' },
  { value: '50m-250m', label: '$50M – $250M' },
  { value: '250m+', label: '$250M+' },
];

const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total

export default function CompanyForm({ onSubmit, loading, prefillData, error }) {
  const [form, setForm] = useState({
    analysis_mode: 'self',
    analysis_type: 'product',
    information_availability: 'full',
    target_company_name: '',
    target_product_name: '',
    industry: 'fintech',
    business_type: 'software_product',
    business_description: '',
    data_types: [],
    user_regions: [],
    processes_payments: false,
    stores_health_data: false,
    existing_compliance: [],
    // New full-mode fields
    technical_architecture: '',
    data_processing_details: '',
    third_party_integrations: '',
    employee_count: '',
    annual_revenue_range: '',
  });

  const [complianceInput, setComplianceInput] = useState('');
  const [customDataType, setCustomDataType] = useState('');
  const [customRegion, setCustomRegion] = useState('');

  // Document upload state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedDocIds, setUploadedDocIds] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Pre-fill for re-analysis
  useEffect(() => {
    if (prefillData) {
      setForm({
        analysis_mode: 'self',
        analysis_type: prefillData.analysis_type || 'product',
        information_availability: prefillData.information_availability || 'full',
        target_company_name: prefillData.company_name || '',
        target_product_name: prefillData.target_product_name || '',
        industry: prefillData.industry || 'fintech',
        business_type: prefillData.business_type || 'software_product',
        business_description: prefillData.business_description || '',
        data_types: prefillData.data_types || [],
        user_regions: prefillData.user_regions || [],
        processes_payments: prefillData.processes_payments || false,
        stores_health_data: prefillData.stores_health_data || false,
        existing_compliance: prefillData.existing_compliance || [],
        technical_architecture: prefillData.technical_architecture || '',
        data_processing_details: prefillData.data_processing_details || '',
        third_party_integrations: prefillData.third_party_integrations || '',
        employee_count: prefillData.employee_count || '',
        annual_revenue_range: prefillData.annual_revenue_range || '',
      });
    }
  }, [prefillData]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, value) => {
    setForm(prev => {
      const arr = prev[field];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...arr, value] };
      }
    });
  };

  const addCustomItem = (field, value, setter) => {
    const trimmed = value.trim();
    if (trimmed && !form[field].includes(trimmed)) {
      updateField(field, [...form[field], trimmed]);
      setter('');
    }
  };

  const addCompliance = () => {
    const trimmed = complianceInput.trim();
    if (trimmed && !form.existing_compliance.includes(trimmed)) {
      updateField('existing_compliance', [...form.existing_compliance, trimmed]);
      setComplianceInput('');
    }
  };

  const removeCompliance = (item) => {
    updateField('existing_compliance', form.existing_compliance.filter(c => c !== item));
  };

  // ── Document Upload Handlers ──────────────────────────────
  const validateFiles = (files) => {
    const errors = [];
    const validFiles = [];
    let totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);

    for (const file of files) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!['.pdf', '.doc', '.docx'].includes(ext)) {
        errors.push(`${file.name}: Only PDF, DOC, and DOCX files are accepted`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File exceeds 10MB limit`);
        continue;
      }
      totalSize += file.size;
      if (totalSize > MAX_TOTAL_SIZE) {
        errors.push(`Total upload size exceeds 50MB limit`);
        break;
      }
      // Check for duplicates
      if (uploadedFiles.some(f => f.name === file.name)) {
        errors.push(`${file.name}: File already added`);
        continue;
      }
      validFiles.push(file);
    }

    return { validFiles, errors };
  };

  const handleFileUpload = async (files) => {
    const { validFiles, errors } = validateFiles(files);
    if (errors.length > 0) {
      setUploadError(errors.join('. '));
      // Still upload valid files
    }
    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadError(errors.length > 0 ? errors.join('. ') : '');

    try {
      const formData = new FormData();
      validFiles.forEach(f => formData.append('files', f));

      const response = await api.post('/analyze/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newDocIds = response.data.document_ids || [];
      setUploadedDocIds(prev => [...prev, ...newDocIds]);
      setUploadedFiles(prev => [...prev, ...validFiles]);
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadedDocIds(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // ── Info level helpers ────────────────────────────────────
  const infoLevel = form.information_availability;
  const showPartialFields = infoLevel === 'partial' || infoLevel === 'full';
  const showFullFields = infoLevel === 'full';

  const handleSubmit = (e) => {
    e.preventDefault();
    // Auto-infer payment/health flags from data_types
    const submissionData = {
      ...form,
      processes_payments: form.data_types.includes('financial'),
      stores_health_data: form.data_types.includes('health'),
      uploaded_document_ids: uploadedDocIds,
    };
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      {/* ── Error Display ─────────────────────────────── */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(255, 71, 87, 0.1)',
          border: '1px solid rgba(255, 71, 87, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--risk-critical)',
          fontSize: '0.85rem',
          marginBottom: 'var(--space-lg)',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Analysis Configuration ───────────────────── */}
      <h3 style={{ marginBottom: 'var(--space-md)', color: 'var(--primary-400)' }}>
        Analysis Configuration
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
        <div className="form-group">
          <label className="form-label">Analysis Mode</label>
          <select className="form-select" value={form.analysis_mode}
            onChange={(e) => updateField('analysis_mode', e.target.value)}>
            <option value="self">Self (Own Company)</option>
            <option value="external">External (Other Company)</option>
          </select>
        </div>

        {showPartialFields && (
          <div className="form-group">
            <label className="form-label">Analysis Type</label>
            <select className="form-select" value={form.analysis_type}
              onChange={(e) => updateField('analysis_type', e.target.value)}>
              <option value="product">Product</option>
              <option value="service">Service</option>
              <option value="company">Company</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Info Availability</label>
          <select className="form-select" value={form.information_availability}
            onChange={(e) => updateField('information_availability', e.target.value)}>
            <option value="full">Full</option>
            <option value="partial">Partial</option>
            <option value="minimal">Minimal</option>
          </select>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            {infoLevel === 'minimal' && '🔹 Basic info only — AI will infer the rest'}
            {infoLevel === 'partial' && '🔸 Some details — more accurate analysis'}
            {infoLevel === 'full' && '🟢 Complete info — most accurate results'}
          </span>
        </div>
      </div>

      {/* ── Company Identity ─────────────────────────── */}
      <h3 style={{ marginBottom: 'var(--space-md)', marginTop: 'var(--space-lg)', color: 'var(--primary-400)' }}>
        Company Identity
      </h3>

      <div className="form-group">
        <label className="form-label" htmlFor="company-name">Company Name</label>
        <input id="company-name" type="text" className="form-input"
          value={form.target_company_name} required
          onChange={(e) => updateField('target_company_name', e.target.value)}
          placeholder="e.g., PayEasy Technologies" />
      </div>

      {/* ── Product / Service Name (conditional — partial + full) ─── */}
      {showPartialFields && (form.analysis_type === 'product' || form.analysis_type === 'service') && (
        <div className="form-group">
          <label className="form-label" htmlFor="product-name">
            {form.analysis_type === 'product' ? 'Product Name' : 'Service Name'}
          </label>
          <input id="product-name" type="text" className="form-input"
            value={form.target_product_name}
            onChange={(e) => updateField('target_product_name', e.target.value)}
            placeholder={form.analysis_type === 'product'
              ? 'e.g., PayEasy Payment Gateway'
              : 'e.g., Compliance Audit Service'}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: showPartialFields ? '1fr 1fr' : '1fr', gap: 'var(--space-md)' }}>
        <div className="form-group">
          <label className="form-label">Industry</label>
          <select className="form-select" value={form.industry}
            onChange={(e) => updateField('industry', e.target.value)}>
            {INDUSTRIES.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </div>

        {showPartialFields && (
          <div className="form-group">
            <label className="form-label">Business Type</label>
            <select className="form-select" value={form.business_type}
              onChange={(e) => updateField('business_type', e.target.value)}>
              {BUSINESS_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* ── Business Description ─────────────────────── */}
      <div className="form-group">
        <label className="form-label" htmlFor="business-desc">Business Description</label>
        <textarea id="business-desc" className="form-textarea"
          value={form.business_description} required minLength={10}
          onChange={(e) => updateField('business_description', e.target.value)}
          placeholder={infoLevel === 'minimal'
            ? 'Briefly describe what the company does...'
            : 'Describe what the company does, its products/services, how it handles user data, payment flows, and any relevant technical architecture...'}
          rows={infoLevel === 'minimal' ? 3 : 5} />
      </div>

      {/* ── Data & Regions (partial + full only) ─────── */}
      {showPartialFields && (
        <>
          <h3 style={{ marginBottom: 'var(--space-md)', marginTop: 'var(--space-lg)', color: 'var(--primary-400)' }}>
            Data & Regions
          </h3>

          <div className="form-group">
            <label className="form-label">Data Types Handled</label>
            <div className="form-checkbox-group">
              {DATA_TYPES.map(dt => (
                <label key={dt.value}
                  className={`form-checkbox-label ${form.data_types.includes(dt.value) ? 'checked' : ''}`}>
                  <input type="checkbox" checked={form.data_types.includes(dt.value)}
                    onChange={() => {
                      if (dt.value === 'other') return; // handled by text input below
                      toggleArrayItem('data_types', dt.value);
                    }} />
                  {dt.label}
                </label>
              ))}
            </div>
            {/* Custom data type input */}
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
              <input type="text" className="form-input" value={customDataType}
                onChange={(e) => setCustomDataType(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem('data_types', customDataType, setCustomDataType))}
                placeholder="Add custom data type..." style={{ flex: 1, fontSize: '0.85rem' }} />
              <button type="button" className="btn btn-secondary btn-sm"
                onClick={() => addCustomItem('data_types', customDataType, setCustomDataType)}>Add</button>
            </div>
            {/* Show custom (non-predefined) data types as removable tags */}
            {form.data_types.filter(dt => !DATA_TYPES.some(d => d.value === dt)).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
                {form.data_types.filter(dt => !DATA_TYPES.some(d => d.value === dt)).map(item => (
                  <span key={item} className="badge badge-complete" style={{ cursor: 'pointer', padding: '4px 10px' }}
                    onClick={() => toggleArrayItem('data_types', item)}>
                    {item} ✕
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── User Regions (always shown) ──────────────── */}
      <div className="form-group" style={showPartialFields ? {} : { marginTop: 'var(--space-lg)' }}>
        <label className="form-label">User Regions</label>
        <div className="form-checkbox-group">
          {REGIONS.map(r => (
            <label key={r.value}
              className={`form-checkbox-label ${form.user_regions.includes(r.value) ? 'checked' : ''}`}>
              <input type="checkbox" checked={form.user_regions.includes(r.value)}
                onChange={() => {
                  if (r.value === 'other') return;
                  toggleArrayItem('user_regions', r.value);
                }} />
              {r.label}
            </label>
          ))}
        </div>
        {/* Custom region input */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
          <input type="text" className="form-input" value={customRegion}
            onChange={(e) => setCustomRegion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem('user_regions', customRegion, setCustomRegion))}
            placeholder="Add custom region..." style={{ flex: 1, fontSize: '0.85rem' }} />
          <button type="button" className="btn btn-secondary btn-sm"
            onClick={() => addCustomItem('user_regions', customRegion, setCustomRegion)}>Add</button>
        </div>
        {form.user_regions.filter(r => !REGIONS.some(rg => rg.value === r)).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
            {form.user_regions.filter(r => !REGIONS.some(rg => rg.value === r)).map(item => (
              <span key={item} className="badge badge-complete" style={{ cursor: 'pointer', padding: '4px 10px' }}
                onClick={() => toggleArrayItem('user_regions', item)}>
                {item} ✕
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Full Mode: Additional Detail Fields ──────── */}
      {showFullFields && (
        <>
          <h3 style={{ marginBottom: 'var(--space-md)', marginTop: 'var(--space-lg)', color: 'var(--primary-400)' }}>
            Detailed Information
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)', marginTop: '-8px' }}>
            Providing more details leads to a more accurate and comprehensive compliance analysis.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="tech-arch">Technical Architecture</label>
            <textarea id="tech-arch" className="form-textarea"
              value={form.technical_architecture}
              onChange={(e) => updateField('technical_architecture', e.target.value)}
              placeholder="Describe your infrastructure: cloud providers (AWS, GCP, Azure), databases, data storage locations, encryption methods, network architecture..."
              rows={4} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="data-processing">Data Processing Details</label>
            <textarea id="data-processing" className="form-textarea"
              value={form.data_processing_details}
              onChange={(e) => updateField('data_processing_details', e.target.value)}
              placeholder="How is user data collected, stored, processed, and shared? Include data retention policies, cross-border transfers, third-party processors..."
              rows={4} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="third-party">Third-Party Integrations</label>
            <input id="third-party" type="text" className="form-input"
              value={form.third_party_integrations}
              onChange={(e) => updateField('third_party_integrations', e.target.value)}
              placeholder="e.g., Stripe, Google Analytics, Twilio, SendGrid, AWS S3..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Employee Count</label>
              <select className="form-select" value={form.employee_count}
                onChange={(e) => updateField('employee_count', e.target.value)}>
                <option value="">Select...</option>
                {EMPLOYEE_COUNTS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Annual Revenue Range</label>
              <select className="form-select" value={form.annual_revenue_range}
                onChange={(e) => updateField('annual_revenue_range', e.target.value)}>
                <option value="">Select...</option>
                {REVENUE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
        </>
      )}

      {/* ── Document Upload (partial + full) ─────────── */}
      {showPartialFields && (
        <>
          <h3 style={{ marginBottom: 'var(--space-md)', marginTop: 'var(--space-lg)', color: 'var(--primary-400)' }}>
            📄 Supporting Documents
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)', marginTop: '-8px' }}>
            Upload privacy policies, compliance certificates, internal audits, or any relevant documents.
            These will be processed through our RAG pipeline for deeper analysis.
          </p>

          {/* Drop zone */}
          <div
            className={`file-drop-zone ${dragOver ? 'drag-over' : ''} ${uploadedFiles.length > 0 ? 'has-files' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                handleFileUpload(Array.from(e.target.files));
                e.target.value = ''; // Reset so same file can be re-selected
              }}
            />
            {uploading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span className="spinner" /> Uploading...
              </div>
            ) : (
              <>
                <div className="file-drop-icon">📁</div>
                <div className="file-drop-text">
                  Drag & drop files here or <span style={{ color: 'var(--primary-400)', fontWeight: 600 }}>browse</span>
                </div>
                <div className="file-drop-hint">
                  PDF, DOC, DOCX · Max 10MB per file · 50MB total
                </div>
              </>
            )}
          </div>

          {/* Upload error */}
          {uploadError && (
            <div style={{
              padding: '8px 12px',
              background: 'rgba(255, 165, 2, 0.1)',
              border: '1px solid rgba(255, 165, 2, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--risk-medium)',
              fontSize: '0.8rem',
              marginTop: 'var(--space-sm)',
            }}>
              ⚠️ {uploadError}
            </div>
          )}

          {/* Uploaded file list */}
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files-list">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="uploaded-file-item">
                  <div className="uploaded-file-info">
                    <span className="uploaded-file-icon">
                      {file.name.endsWith('.pdf') ? '📕' : '📘'}
                    </span>
                    <div>
                      <div className="uploaded-file-name">{file.name}</div>
                      <div className="uploaded-file-size">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  <button type="button" className="uploaded-file-remove"
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    title="Remove file">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Existing Compliance (partial + full) ─────── */}
      {showPartialFields && (
        <div className="form-group" style={{ marginTop: 'var(--space-lg)' }}>
          <label className="form-label">Existing Compliance / Certifications</label>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <input type="text" className="form-input" value={complianceInput}
              onChange={(e) => setComplianceInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCompliance())}
              placeholder="e.g., ISO 27001, SOC 2" style={{ flex: 1 }} />
            <button type="button" className="btn btn-secondary" onClick={addCompliance}>Add</button>
          </div>
          {form.existing_compliance.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
              {form.existing_compliance.map(item => (
                <span key={item} className="badge badge-complete" style={{ cursor: 'pointer', padding: '4px 10px' }}
                  onClick={() => removeCompliance(item)}>
                  {item} ✕
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Submit ───────────────────────────────────── */}
      <button type="submit" className="btn btn-primary btn-lg"
        disabled={loading}
        style={{ width: '100%', marginTop: 'var(--space-xl)' }}>
        {loading ? (
          <><span className="spinner" /> Starting Analysis...</>
        ) : (
          'Start Compliance Analysis'
        )}
      </button>
    </form>
  );
}
