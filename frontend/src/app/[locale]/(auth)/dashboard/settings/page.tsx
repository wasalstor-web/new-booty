import { SettingsForm } from './SettingsForm';

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Site Settings</h1>
      <p className="mb-6 text-gray-600">Manage your website content and configuration here.</p>
      <SettingsForm />
    </div>
  );
}
