import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileItem } from '../types';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Search,
  RefreshCw,
  X,
  Code2,
  Copy,
  Check,
  ArrowRight,
  Terminal,
  Binary,
  Edit3,
  Save,
  RotateCcw,
  GripHorizontal,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectFileForContext: (filePath: string) => void;
  embedded?: boolean;
}

export function FileExplorer({ isOpen, onClose, onSelectFileForContext, embedded = false }: Props) {
  const [tree, setTree] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string; lines: number; size: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fs/tree');
      const data = await res.json();
      if (data.success && Array.isArray(data.tree)) {
        setTree(data.tree);
      }
    } catch (err) {
      console.error('Failed to load file tree:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTree();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleReadFile = async (filePath: string) => {
    setFileLoading(true);
    try {
      const res = await fetch('/api/fs/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedFile({
          path: filePath,
          content: data.content,
          lines: data.lines,
          size: data.size,
        });
        setEditedContent(data.content);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to read file:', err);
    } finally {
      setFileLoading(false);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/fs/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: selectedFile.path, content: editedContent }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedFile((prev) =>
          prev
            ? {
                ...prev,
                content: editedContent,
                lines: editedContent.split('\n').length,
                size: data.bytesWritten || editedContent.length,
              }
            : null
        );
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to write file:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyFile = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(isEditing ? editedContent : selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const filterItems = (items: FileItem[], query: string): FileItem[] => {
    if (!query) return items;
    const lower = query.toLowerCase();
    const result: FileItem[] = [];

    for (const item of items) {
      if (item.name.toLowerCase().includes(lower)) {
        result.push(item);
      } else if (item.children) {
        const filteredChildren = filterItems(item.children, query);
        if (filteredChildren.length > 0) {
          result.push({ ...item, children: filteredChildren });
        }
      }
    }
    return result;
  };

  const filteredTree = filterItems(tree, searchQuery);

  const renderTree = (items: FileItem[], level = 0) => {
    return items.map((item) => {
      const isFolder = item.type === 'directory';
      const isExpanded = expandedFolders.has(item.path);

      return (
        <div key={item.path} style={{ paddingLeft: `${level * 14}px` }}>
          <div
            onClick={() => (isFolder ? toggleFolder(item.path) : handleReadFile(item.path))}
            className={`flex items-center gap-2 py-1.5 px-2 rounded-xl cursor-pointer text-xs font-mono transition-all ${
              selectedFile?.path === item.path
                ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                : 'hover:bg-white/5 text-slate-300'
            }`}
          >
            {isFolder ? (
              isExpanded ? (
                <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )
            ) : item.name.endsWith('.ts') || item.name.endsWith('.tsx') ? (
              <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            <span className="truncate">{item.name}</span>
          </div>

          {isFolder && isExpanded && item.children && renderTree(item.children, level + 1)}
        </div>
      );
    });
  };

  const content = (
    <div className={`w-full ${embedded ? 'h-full' : 'h-[85vh] max-w-5xl ice-glass-window rounded-3xl border border-white/90 shadow-2xl'} flex flex-col overflow-hidden text-slate-800 bg-white/95 cursor-default select-none`}>
      {/* Header */}
      <div className={`px-6 py-3.5 border-b border-white/60 flex items-center justify-between bg-white/40 ${embedded ? '' : 'cursor-grab active:cursor-grabbing'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
            <Binary className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-xs sm:text-sm text-slate-900 tracking-wider flex items-center gap-1.5">
                <span>INODE EXPLORER // REPOSITORY VECTORS</span>
                {!embedded && <GripHorizontal className="w-3.5 h-3.5 text-slate-400" />}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold">
                READ-WRITE
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTree}
            className="p-1.5 rounded-full ice-glass-btn text-slate-600 hover:text-slate-900 transition cursor-pointer shadow-sm border border-white"
            title="Refresh tree"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition cursor-pointer shadow-sm border border-white"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

        {/* Content split: Left Tree / Right Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Tree View */}
          <div className="w-72 border-r border-white/10 p-3 flex flex-col bg-black/30">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="grep file name..."
                className="w-full pl-8 pr-3 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs font-mono text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-400 transition"
              />
            </div>

            {/* Tree listing */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-0.5">
              {loading ? (
                <div className="text-center py-8 text-xs font-mono text-slate-500">Scanning inodes...</div>
              ) : filteredTree.length > 0 ? (
                renderTree(filteredTree)
              ) : (
                <div className="text-center py-8 text-xs font-mono text-slate-500">No nodes matched.</div>
              )}
            </div>
          </div>

          {/* Right: File Preview */}
          <div className="flex-1 flex flex-col bg-[#070a14]">
            {selectedFile ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* File Sub-header */}
                <div className="px-4 py-2 bg-black/60 border-b border-white/10 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-cyan-300">{selectedFile.path}</span>
                    <span className="text-slate-500 text-[11px]">
                      {selectedFile.lines} lines • {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {saveSuccess && (
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 animate-pulse">
                        <Check className="w-3.5 h-3.5" /> Saved!
                      </span>
                    )}

                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveFile}
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-mono transition"
                        >
                          <Save className="w-3 h-3" />
                          <span>{saving ? 'Writing...' : 'Save File'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditedContent(selectedFile.content);
                            setIsEditing(false);
                          }}
                          className="p-1 rounded-xl liquid-btn text-slate-400 hover:text-white transition"
                          title="Discard changes"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl liquid-btn text-cyan-300 hover:text-white border-cyan-500/30 text-xs font-mono transition"
                        title="Edit file in-place"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onSelectFileForContext(selectedFile.path);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl liquid-btn text-cyan-300 hover:text-white border-cyan-500/40 text-xs font-mono"
                    >
                      <span>Attach to CODGAR</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={handleCopyFile}
                      className="p-1.5 rounded-xl liquid-btn text-slate-400 hover:text-white transition"
                      title="Copy content"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Code Content / Editor */}
                <div className="flex-1 overflow-auto bg-[#030509]">
                  {isEditing ? (
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full h-full p-4 bg-transparent text-emerald-300 font-mono text-xs leading-relaxed outline-none resize-none border-none selection:bg-emerald-950/80"
                      spellCheck={false}
                    />
                  ) : (
                    <div className="p-4 text-slate-200 font-mono text-xs leading-relaxed">
                      <pre className="whitespace-pre">
                        <code>
                          {selectedFile.content.split('\n').map((line, idx) => (
                            <div key={idx} className="table-row">
                              <span className="table-cell pr-4 text-slate-600 select-none text-right w-10">
                                {idx + 1}
                              </span>
                              <span className="table-cell whitespace-pre">{line || ' '}</span>
                            </div>
                          ))}
                        </code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 font-mono">
                <FileCode className="w-12 h-12 text-cyan-900 mb-3" />
                <p className="text-sm font-medium text-slate-300">Select an inode from the tree</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Dissect payloads, attach to prompt context, or audit source architecture.
                </p>
              </div>
            )}
          </div>
        </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/35 backdrop-blur-xs"
      >
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.08}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="w-full max-w-5xl"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
