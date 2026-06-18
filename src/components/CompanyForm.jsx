/**
 * CompanyForm — Multi-field company profile form.
 *
 * Collects all inputs for the CompanyProfileRequest schema.
 * Supports "Other" free-text for data types and regions.
 * Removed "Processes Payments" / "Stores Health Data" toggles —
 * these are now inferred from data_types selections.
 */

import { useState, useEffect } from 'react';

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

export default function CompanyForm({ onSubmit, loading, prefillData, error }) {
  const [form, setForm] = useState({
    analysis_mode: 'self',
    analysis_type: 'product',
    information_availability: 'full',
    target_company_name: '',
    industry: 'fintech',
    business_type: 'software_product',
    business_description: '',
    data_types: [],
    user_regions: [],
    processes_payments: false,
    stores_health_data: false,
    existing_compliance: [],
  });

  const [complianceInput, setComplianceInput] = useState('');
  const [customDataType, setCustomDataType] = useState('');
  const [customRegion, setCustomRegion] = useState('');

  // Pre-fill for re-analysis
  useEffect(() => {
    if (prefillData) {
      setForm({
        analysis_mode: 'self',
        analysis_type: prefillData.analysis_type || 'product',
        information_availability: prefillData.information_availability || 'full',
        target_company_name: prefillData.company_name || '',
        industry: prefillData.industry || 'fintech',
        business_type: prefillData.business_type || 'software_product',
        business_description: prefillData.business_description || '',
        data_types: prefillData.data_types || [],
        user_regions: prefillData.user_regions || [],
        processes_payments: prefillData.processes_payments || false,
        stores_health_data: prefillData.stores_health_data || false,
        existing_compliance: prefillData.existing_compliance || [],
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Auto-infer payment/health flags from data_types
    const submissionData = {
      ...form,
      processes_payments: form.data_types.includes('financial'),
      stores_health_data: form.data_types.includes('health'),
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

        <div className="form-group">
          <label className="form-label">Analysis Type</label>
          <select className="form-select" value={form.analysis_type}
            onChange={(e) => updateField('analysis_type', e.target.value)}>
            <option value="product">Product</option>
            <option value="service">Service</option>
            <option value="company">Company</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Info Availability</label>
          <select className="form-select" value={form.information_availability}
            onChange={(e) => updateField('information_availability', e.target.value)}>
            <option value="full">Full</option>
            <option value="partial">Partial</option>
            <option value="minimal">Minimal</option>
          </select>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
        <div className="form-group">
          <label className="form-label">Industry</label>
          <select className="form-select" value={form.industry}
            onChange={(e) => updateField('industry', e.target.value)}>
            {INDUSTRIES.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Business Type</label>
          <select className="form-select" value={form.business_type}
            onChange={(e) => updateField('business_type', e.target.value)}>
            {BUSINESS_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── Business Description ─────────────────────── */}
      <div className="form-group">
        <label className="form-label" htmlFor="business-desc">Business Description</label>
        <textarea id="business-desc" className="form-textarea"
          value={form.business_description} required minLength={10}
          onChange={(e) => updateField('business_description', e.target.value)}
          placeholder="Describe what the company does, its products/services, how it handles user data, payment flows, and any relevant technical architecture..."
          rows={5} />
      </div>

      {/* ── Data Types ───────────────────────────────── */}
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

      <div className="form-group">
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

      {/* ── Existing Compliance ──────────────────────── */}
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
