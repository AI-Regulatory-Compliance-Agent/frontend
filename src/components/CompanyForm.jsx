/**
 * CompanyForm — Multi-field company profile form.
 *
 * All inline style={{}} props on AnalysisModeToggle and ExternalModeBanner
 * are replaced with CSS classes (mode-toggle__*, external-banner__*).
 * Remaining inline styles in the form body are token-referenced only
 * (e.g. `style={{ flex: 1 }}`).
 *
 * Modes: self | external
 * Info levels: minimal | partial | full
 */

import { useState, useEffect, useRef } from 'react';
import api from '../api/client';

// ── Option lists ──────────────────────────────────────────────
const INDUSTRIES = [
  { value: 'fintech',           label: 'Fintech' },
  { value: 'healthtech',        label: 'Healthtech' },
  { value: 'edtech',            label: 'Edtech' },
  { value: 'saas',              label: 'SaaS' },
  { value: 'ecommerce',         label: 'E-Commerce' },
  { value: 'consulting',        label: 'Consulting' },
  { value: 'managed_services',  label: 'Managed Services' },
  { value: 'marketplace',       label: 'Marketplace' },
  { value: 'other',             label: 'Other' },
];

const BUSINESS_TYPES = [
  { value: 'software_product',      label: 'Software Product' },
  { value: 'physical_product',      label: 'Physical Product' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'managed_services',      label: 'Managed Services' },
  { value: 'marketplace',           label: 'Marketplace' },
  { value: 'other',                 label: 'Other' },
];

const DATA_TYPES = [
  { value: 'personal_identifiable', label: 'Personal / PII' },
  { value: 'financial',             label: 'Financial' },
  { value: 'health',                label: 'Health' },
  { value: 'biometric',             label: 'Biometric' },
  { value: 'children_data',         label: "Children's Data" },
  { value: 'behavioral',            label: 'Behavioral / Analytics' },
  { value: 'location',              label: 'Location / GPS' },
  { value: 'communications',        label: 'Communications' },
  { value: 'employment',            label: 'Employment / HR' },
  { value: 'none',                  label: 'None' },
  { value: 'other',                 label: 'Other' },
];

const REGIONS = [
  { value: 'india',     label: '🇮🇳 India' },
  { value: 'eu',        label: '🇪🇺 EU' },
  { value: 'us',        label: '🇺🇸 US' },
  { value: 'uk',        label: '🇬🇧 UK' },
  { value: 'singapore', label: '🇸🇬 Singapore' },
  { value: 'uae',       label: '🇦🇪 UAE' },
  { value: 'japan',     label: '🇯🇵 Japan' },
  { value: 'australia', label: '🇦🇺 Australia' },
  { value: 'global',    label: '🌍 Global' },
  { value: 'other',     label: 'Other' },
];

const EMPLOYEE_COUNTS = [
  { value: '1-10',    label: '1–10 (Startup)' },
  { value: '11-50',   label: '11–50 (Small)' },
  { value: '51-250',  label: '51–250 (Medium)' },
  { value: '251-1000', label: '251–1,000 (Large)' },
  { value: '1000+',   label: '1,000+ (Enterprise)' },
];

const REVENUE_RANGES = [
  { value: 'pre-revenue', label: 'Pre-Revenue' },
  { value: 'under-1m',    label: 'Under $1M' },
  { value: '1m-10m',      label: '$1M – $10M' },
  { value: '10m-50m',     label: '$10M – $50M' },
  { value: '50m-250m',    label: '$50M – $250M' },
  { value: '250m+',       label: '$250M+' },
];

const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx';
const MAX_FILE_SIZE   = 10 * 1024 * 1024;  // 10MB
const MAX_TOTAL_SIZE  = 50 * 1024 * 1024;  // 50MB

// ── Analysis Mode Toggle ──────────────────────────────────────
function AnalysisModeToggle({ value, onChange }) {
  const modes = [
    {
      key: 'self',
      icon: '🏢',
      title: 'Self-Assessment',
      desc: 'Analyse your own company. You provide all the details.',
    },
    {
      key: 'external',
      icon: '🌐',
      title: 'External Research',
      desc: 'Analyse another company. AI will web-search for public info.',
    },
  ];

  return (
    <div className="mode-toggle" role="group" aria-label="Analysis mode">
      {modes.map((mode) => {
        const isActive = value === mode.key;
        return (
          <button
            key={mode.key}
            type="button"
            id={`mode-${mode.key}`}
            className={`mode-toggle__card${isActive ? ' mode-toggle__card--active' : ''}`}
            onClick={() => onChange(mode.key)}
            aria-pressed={isActive}
          >
            <span className="mode-toggle__icon" aria-hidden="true">{mode.icon}</span>
            <span className="mode-toggle__title">{mode.title}</span>
            <span className="mode-toggle__desc">{mode.desc}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── External Mode Banner ──────────────────────────────────────
function ExternalModeBanner() {
  return (
    <div className="external-banner" role="note" aria-label="External research mode is active">
      <span className="external-banner__icon" aria-hidden="true">🌐</span>
      <div className="external-banner__body">
        <div className="external-banner__title">External Research Mode Active</div>
        <p className="external-banner__text">
          AI agents will search the web for publicly available information before analysis.
          Findings are tagged:{' '}
          <strong style={{ color: 'var(--color-risk-low)' }}>CONFIRMED</strong>,{' '}
          <strong style={{ color: 'var(--color-risk-medium)' }}>PROBABLE</strong>, or{' '}
          <strong style={{ color: 'var(--color-risk-critical)' }}>UNKNOWN</strong>.
          <span className="external-banner__tip">
            Tip: Use the company's full legal or public name for best results.
          </span>
        </p>
      </div>
    </div>
  );
}

// ── Main Form Component ───────────────────────────────────────
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
    technical_architecture: '',
    data_processing_details: '',
    third_party_integrations: '',
    employee_count: '',
    annual_revenue_range: '',
  });

  const [complianceInput, setComplianceInput] = useState('');
  const [customDataType, setCustomDataType] = useState('');
  const [customRegion, setCustomRegion] = useState('');

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

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleArrayItem = (field, value) =>
    setForm((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });

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

  const removeCompliance = (item) =>
    updateField('existing_compliance', form.existing_compliance.filter((c) => c !== item));

  // File upload
  const validateFiles = (files) => {
    const errors = [];
    const validFiles = [];
    let totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);

    for (const file of files) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!['.pdf', '.doc', '.docx'].includes(ext)) {
        errors.push(`${file.name}: Only PDF, DOC, DOCX accepted`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Exceeds 10MB`);
        continue;
      }
      totalSize += file.size;
      if (totalSize > MAX_TOTAL_SIZE) {
        errors.push('Total size exceeds 50MB');
        break;
      }
      if (uploadedFiles.some((f) => f.name === file.name)) {
        errors.push(`${file.name}: Already added`);
        continue;
      }
      validFiles.push(file);
    }
    return { validFiles, errors };
  };

  const handleFileUpload = async (files) => {
    const { validFiles, errors } = validateFiles(files);
    if (errors.length > 0) setUploadError(errors.join('. '));
    if (validFiles.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      validFiles.forEach((f) => formData.append('files', f));
      const response = await api.post('/analyze/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedDocIds((prev) => [...prev, ...(response.data.document_ids || [])]);
      setUploadedFiles((prev) => [...prev, ...validFiles]);
      if (!errors.length) setUploadError('');
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(Array.from(e.dataTransfer.files));
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedDocIds((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const infoLevel          = form.information_availability;
  const showPartialFields  = infoLevel === 'partial' || infoLevel === 'full';
  const showFullFields     = infoLevel === 'full';
  const isExternal         = form.analysis_mode === 'external';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      processes_payments: form.data_types.includes('financial'),
      stores_health_data: form.data_types.includes('health'),
      uploaded_document_ids: uploadedDocIds,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in" noValidate>

      {/* ── Submit error ─────────────────────────── */}
      {error && (
        <div className="auth__error" role="alert" style={{ marginBottom: 'var(--space-6)' }}>
          <span aria-hidden>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════
          SECTION: Analysis Configuration
      ══════════════════════════════════════════ */}
      <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-primary-400)' }}>
        Analysis Configuration
      </h3>

      {/* Mode toggle */}
      <div className="form-group">
        <label className="form-label" id="mode-group-label">Analysis Mode</label>
        <AnalysisModeToggle
          value={form.analysis_mode}
          onChange={(val) => updateField('analysis_mode', val)}
        />
        {isExternal && <ExternalModeBanner />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showPartialFields ? '1fr 1fr' : '1fr', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
        {showPartialFields && (
          <div className="form-group">
            <label className="form-label" htmlFor="analysis-type">Analysis Type</label>
            <select id="analysis-type" className="form-select" value={form.analysis_type}
              onChange={(e) => updateField('analysis_type', e.target.value)}>
              <option value="product">Product</option>
              <option value="service">Service</option>
              <option value="company">Company</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="info-availability">Info Availability</label>
          <select id="info-availability" className="form-select" value={form.information_availability}
            onChange={(e) => updateField('information_availability', e.target.value)}>
            <option value="full">Full</option>
            <option value="partial">Partial</option>
            <option value="minimal">Minimal</option>
          </select>
          <span className="form-hint">
            {infoLevel === 'minimal' && '🔹 Basic info only — AI will infer the rest'}
            {infoLevel === 'partial' && '🔸 Some details — more accurate analysis'}
            {infoLevel === 'full'    && '🟢 Complete info — most accurate results'}
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION: Company Identity
      ══════════════════════════════════════════ */}
      <h3 style={{ marginBottom: 'var(--space-4)', marginTop: 'var(--space-6)', color: 'var(--color-primary-400)' }}>
        Company Identity
      </h3>

      <div className="form-group">
        <label className="form-label" htmlFor="company-name">
          {isExternal ? 'Target Company Name' : 'Company Name'}
        </label>
        <input
          id="company-name"
          type="text"
          className="form-input"
          value={form.target_company_name}
          required
          onChange={(e) => updateField('target_company_name', e.target.value)}
          placeholder={
            isExternal
              ? 'e.g., Razorpay, Paytm, HDFC Bank (use full public name)'
              : 'e.g., PayEasy Technologies'
          }
        />
        {isExternal && (
          <span className="form-hint form-hint--external">
            🌐 Use the company's full public name for best web search results
          </span>
        )}
      </div>

      {showPartialFields && (form.analysis_type === 'product' || form.analysis_type === 'service') && (
        <div className="form-group">
          <label className="form-label" htmlFor="product-name">
            {form.analysis_type === 'product' ? 'Product Name' : 'Service Name'}
          </label>
          <input
            id="product-name"
            type="text"
            className="form-input"
            value={form.target_product_name}
            onChange={(e) => updateField('target_product_name', e.target.value)}
            placeholder={form.analysis_type === 'product' ? 'e.g., PayEasy Payment Gateway' : 'e.g., Compliance Audit Service'}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: showPartialFields ? '1fr 1fr' : '1fr', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="industry">Industry</label>
          <select id="industry" className="form-select" value={form.industry}
            onChange={(e) => updateField('industry', e.target.value)}>
            {INDUSTRIES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </div>

        {showPartialFields && (
          <div className="form-group">
            <label className="form-label" htmlFor="business-type">Business Type</label>
            <select id="business-type" className="form-select" value={form.business_type}
              onChange={(e) => updateField('business_type', e.target.value)}>
              {BUSINESS_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="business-desc">Business Description</label>
        <textarea
          id="business-desc"
          className="form-textarea"
          value={form.business_description}
          required
          minLength={10}
          onChange={(e) => updateField('business_description', e.target.value)}
          placeholder={
            isExternal
              ? 'Describe what you know about this company publicly — products, markets, data practices...'
              : infoLevel === 'minimal'
                ? 'Briefly describe what the company does...'
                : 'Describe the company, its products/services, how it handles user data, payment flows...'
          }
          rows={infoLevel === 'minimal' ? 3 : 5}
        />
      </div>

      {/* ══════════════════════════════════════════
          SECTION: Data & Regions (partial + full)
      ══════════════════════════════════════════ */}
      {showPartialFields && (
        <>
          <h3 style={{ marginBottom: 'var(--space-4)', marginTop: 'var(--space-6)', color: 'var(--color-primary-400)' }}>
            Data &amp; Regions
          </h3>

          <div className="form-group">
            <label className="form-label">Data Types Handled</label>
            <div className="form-checkbox-group">
              {DATA_TYPES.map((dt) => (
                <label
                  key={dt.value}
                  className={`form-checkbox-label${form.data_types.includes(dt.value) ? ' checked' : ''}`}
                >
                  <input type="checkbox" checked={form.data_types.includes(dt.value)}
                    onChange={() => { if (dt.value !== 'other') toggleArrayItem('data_types', dt.value); }} />
                  {dt.label}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <input type="text" className="form-input" value={customDataType}
                onChange={(e) => setCustomDataType(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem('data_types', customDataType, setCustomDataType))}
                placeholder="Add custom data type..." style={{ flex: 1 }} />
              <button type="button" className="btn btn-secondary btn--sm"
                onClick={() => addCustomItem('data_types', customDataType, setCustomDataType)}>Add</button>
            </div>
            {form.data_types.filter((dt) => !DATA_TYPES.some((d) => d.value === dt)).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
                {form.data_types.filter((dt) => !DATA_TYPES.some((d) => d.value === dt)).map((item) => (
                  <button key={item} type="button" className="badge badge-complete"
                    style={{ cursor: 'pointer', border: 'none' }}
                    onClick={() => toggleArrayItem('data_types', item)}>
                    {item} ✕
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* User Regions */}
      <div className="form-group" style={showPartialFields ? {} : { marginTop: 'var(--space-6)' }}>
        <label className="form-label">User Regions</label>
        <div className="form-checkbox-group">
          {REGIONS.map((r) => (
            <label
              key={r.value}
              className={`form-checkbox-label${form.user_regions.includes(r.value) ? ' checked' : ''}`}
            >
              <input type="checkbox" checked={form.user_regions.includes(r.value)}
                onChange={() => { if (r.value !== 'other') toggleArrayItem('user_regions', r.value); }} />
              {r.label}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          <input type="text" className="form-input" value={customRegion}
            onChange={(e) => setCustomRegion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem('user_regions', customRegion, setCustomRegion))}
            placeholder="Add custom region..." style={{ flex: 1 }} />
          <button type="button" className="btn btn-secondary btn--sm"
            onClick={() => addCustomItem('user_regions', customRegion, setCustomRegion)}>Add</button>
        </div>
        {form.user_regions.filter((r) => !REGIONS.some((rg) => rg.value === r)).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
            {form.user_regions.filter((r) => !REGIONS.some((rg) => rg.value === r)).map((item) => (
              <button key={item} type="button" className="badge badge-complete"
                style={{ cursor: 'pointer', border: 'none' }}
                onClick={() => toggleArrayItem('user_regions', item)}>
                {item} ✕
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          SECTION: Detailed Info (full only)
      ══════════════════════════════════════════ */}
      {showFullFields && (
        <>
          <h3 style={{ marginBottom: 'var(--space-4)', marginTop: 'var(--space-6)', color: 'var(--color-primary-400)' }}>
            Detailed Information
          </h3>
          <p className="form-hint form-hint--tight">
            Providing more details leads to a more accurate and comprehensive compliance analysis.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="tech-arch">Technical Architecture</label>
            <textarea id="tech-arch" className="form-textarea" value={form.technical_architecture}
              onChange={(e) => updateField('technical_architecture', e.target.value)}
              placeholder="Cloud providers, databases, encryption methods, network architecture..."
              rows={4} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="data-processing">Data Processing Details</label>
            <textarea id="data-processing" className="form-textarea" value={form.data_processing_details}
              onChange={(e) => updateField('data_processing_details', e.target.value)}
              placeholder="Collection, storage, processing, sharing, retention policies, cross-border transfers..."
              rows={4} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="third-party">Third-Party Integrations</label>
            <input id="third-party" type="text" className="form-input" value={form.third_party_integrations}
              onChange={(e) => updateField('third_party_integrations', e.target.value)}
              placeholder="e.g., Stripe, Google Analytics, Twilio, SendGrid, AWS S3..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="employee-count">Employee Count</label>
              <select id="employee-count" className="form-select" value={form.employee_count}
                onChange={(e) => updateField('employee_count', e.target.value)}>
                <option value="">Select...</option>
                {EMPLOYEE_COUNTS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="revenue-range">Annual Revenue Range</label>
              <select id="revenue-range" className="form-select" value={form.annual_revenue_range}
                onChange={(e) => updateField('annual_revenue_range', e.target.value)}>
                <option value="">Select...</option>
                {REVENUE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
          SECTION: Supporting Documents (partial + full)
      ══════════════════════════════════════════ */}
      {showPartialFields && (
        <>
          <h3 style={{ marginBottom: 'var(--space-4)', marginTop: 'var(--space-6)', color: 'var(--color-primary-400)' }}>
            📄 Supporting Documents
          </h3>
          <p className="form-hint form-hint--tight">
            Upload privacy policies, compliance certs, or internal audits. Processed via RAG for deeper analysis.
          </p>

          <div
            className={`file-drop-zone${dragOver ? ' drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload documents — click or drag and drop"
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} multiple
              style={{ display: 'none' }}
              onChange={(e) => { handleFileUpload(Array.from(e.target.files)); e.target.value = ''; }} />
            {uploading ? (
              <><span className="spinner" aria-hidden /> Uploading...</>
            ) : (
              <>
                <div className="file-drop-icon" aria-hidden>📁</div>
                <div className="file-drop-text">
                  Drag &amp; drop or <strong style={{ color: 'var(--color-primary-400)' }}>browse</strong>
                </div>
                <div className="file-drop-hint">PDF, DOC, DOCX · Max 10MB per file · 50MB total</div>
              </>
            )}
          </div>

          {uploadError && (
            <div className="form-error" role="alert" style={{ marginTop: 'var(--space-2)' }}>
              ⚠️ {uploadError}
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <ul className="uploaded-files-list" aria-label="Uploaded files">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="uploaded-file-item">
                  <div className="uploaded-file-info">
                    <span className="uploaded-file-icon" aria-hidden>
                      {file.name.endsWith('.pdf') ? '📕' : '📘'}
                    </span>
                    <div>
                      <div className="uploaded-file-name">{file.name}</div>
                      <div className="uploaded-file-size">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="uploaded-file-remove"
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    aria-label={`Remove ${file.name}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Existing compliance (partial + full) */}
      {showPartialFields && (
        <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
          <label className="form-label">Existing Compliance / Certifications</label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input type="text" className="form-input" value={complianceInput}
              onChange={(e) => setComplianceInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCompliance())}
              placeholder="e.g., ISO 27001, SOC 2" style={{ flex: 1 }} />
            <button type="button" className="btn btn-secondary" onClick={addCompliance}>Add</button>
          </div>
          {form.existing_compliance.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
              {form.existing_compliance.map((item) => (
                <button key={item} type="button" className="badge badge-complete"
                  style={{ cursor: 'pointer', border: 'none' }}
                  onClick={() => removeCompliance(item)}>
                  {item} ✕
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Submit ───────────────────────────────── */}
      <button
        type="submit"
        className="btn btn-primary btn--lg"
        disabled={loading}
        style={{ width: '100%', marginTop: 'var(--space-8)' }}
      >
        {loading ? (
          <><span className="spinner" aria-hidden /> Starting Analysis...</>
        ) : isExternal ? (
          '🌐 Start External Research Analysis'
        ) : (
          'Start Compliance Analysis'
        )}
      </button>
    </form>
  );
}
