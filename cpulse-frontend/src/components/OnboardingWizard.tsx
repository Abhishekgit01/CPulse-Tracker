import React from 'react';
import { Sparkles } from 'lucide-react';

export default function OnboardingWizard() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-dashed border-gray-300 dark:border-gray-700">
      <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 mb-6">
        <Sparkles size={48} />
      </div>
      <h2 className="text-3xl font-black mb-4">Setup Your Profile</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">
        The setup wizard will help you link all your CP handles in one go. Coming soon!
      </p>
    </div>
  );
}
