
import React, { useState } from 'react';

export interface UserInfo {
  name?: string;
  age?: string;
  sex?: string;
  conditions?: string;
}

interface LandingPageProps {
  onSubmit: (userInfo: UserInfo | null) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [conditions, setConditions] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim() || undefined,
      age: age.trim() || undefined,
      sex: sex || undefined, // Will be empty string if "Select..." is chosen
      conditions: conditions.trim() || undefined,
    });
  };

  const handleSkip = () => {
    onSubmit(null); // Pass null to indicate skipping
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-rose-100 to-amber-100 p-4 selection:bg-sky-200 selection:text-sky-700">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-lg p-8 sm:p-10 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-sky-700 mb-2">Welcome to TrackWise!</h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Let's get started. Sharing a bit about yourself is optional but can help make our chat more personal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Your Name <span className="text-xs text-slate-500">(Optional)</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white/70 placeholder-slate-400"
              placeholder="E.g., Alex"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-1">
                Age <span className="text-xs text-slate-500">(Optional)</span>
              </label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="0"
                className="mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white/70 placeholder-slate-400"
                placeholder="E.g., 35"
              />
            </div>
            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-slate-700 mb-1">
                Sex <span className="text-xs text-slate-500">(Optional)</span>
              </label>
              <select
                id="sex"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white/70 text-slate-700"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="conditions" className="block text-sm font-medium text-slate-700 mb-1">
              Chronic Conditions <span className="text-xs text-slate-500">(Optional, e.g., Diabetes, Asthma)</span>
            </label>
            <textarea
              id="conditions"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm custom-scrollbar bg-white/70 placeholder-slate-400"
              placeholder="You can list any conditions you're managing here."
            />
          </div>

          <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-sky-500 to-rose-500 hover:from-sky-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all"
            >
              Start Chatting
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-slate-300 text-base font-medium rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all"
            >
              Skip & Start Chat
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-xs text-slate-500">
          Your privacy is important. The information you provide is used to personalize your chat experience and is not stored beyond your current session.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
