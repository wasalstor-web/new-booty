'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

export const SettingsForm = () => {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/global-config')
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      });
  }, []);

  const handleChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/global-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  const fields = [
    { key: 'site_name', label: 'Site Name' },
    { key: 'hero_title', label: 'Hero Title' },
    { key: 'hero_description', label: 'Hero Description' },
    { key: 'hero_button_text', label: 'Hero Button Text' },
    { key: 'hero_button_link', label: 'Hero Button Link' },
  ];

  return (
    <div className="space-y-6 max-w-xl bg-white p-6 rounded-lg shadow">
      {fields.map((field) => (
        <div key={field.key} className="grid w-full items-center gap-2">
          <Label htmlFor={field.key} className="text-sm font-medium text-gray-700">
            {field.label}
          </Label>
          <Input
            type="text"
            id={field.key}
            value={config[field.key] || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="w-full"
            placeholder={`Enter ${field.label}`}
          />
        </div>
      ))}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};
