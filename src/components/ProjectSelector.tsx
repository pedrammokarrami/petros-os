import React, { useState } from 'react';
import { ProjectItem } from '../types';
import { FolderGit2, Check, Plus, RefreshCw, Layers } from 'lucide-react';

interface Props {
  projects: ProjectItem[];
  currentProject: string;
  onSwitchProject: (path: string) => Promise<void>;
  onCreateTestProject: () => Promise<void>;
  language: 'en' | 'fa';
}

export function ProjectSelector({
  projects,
  currentProject,
  onSwitchProject,
  onCreateTestProject,
  language,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const currentProjectName =
    projects.find((p) => p.path === currentProject)?.name ||
    currentProject.split('/').pop() ||
    'workspace';

  const handleCreateTest = async () => {
    setIsCreating(true);
    try {
      await onCreateTestProject();
    } finally {
      setIsCreating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left select-none">
      <button
        id="project-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 rounded-xl liquid-btn text-xs font-mono text-slate-200 hover:text-emerald-400 transition cursor-pointer flex items-center gap-2 border border-white/10"
        title="Switch active project workspace"
      >
        <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
        <span className="max-w-[130px] truncate font-medium">{currentProjectName}</span>
        <Layers className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="project-selector-dropdown"
            className="absolute left-0 mt-2 w-72 rounded-2xl glass-modal border border-white/15 shadow-2xl p-2 z-50 backdrop-blur-2xl animate-fade-in"
          >
            <div className="px-3 py-1.5 border-b border-white/10 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>{language === 'fa' ? 'پروژه‌های ورک‌اسپیس' : 'WORKSPACE PROJECTS'}</span>
              <span className="text-[10px] text-emerald-400">CODGAR FS</span>
            </div>

            <div className="py-1 max-h-56 overflow-y-auto space-y-1">
              {projects.map((proj) => {
                const isSelected = proj.path === currentProject;
                return (
                  <button
                    key={proj.path}
                    onClick={() => {
                      onSwitchProject(proj.path);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition text-left cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FolderGit2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="truncate">{proj.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/10 mt-1">
              <button
                onClick={handleCreateTest}
                disabled={isCreating}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl liquid-btn text-xs font-mono text-cyan-300 hover:text-white transition cursor-pointer border border-cyan-500/20 disabled:opacity-50"
              >
                {isCreating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>
                  {language === 'fa'
                    ? 'ایجاد پروژه تست ایزوله (test-project)'
                    : 'Create Isolated Test Repo'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
