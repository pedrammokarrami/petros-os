import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

export default function TodoListApp() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('codgar_todos');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'طراحی رابط کاربری مدرن با Tailwind', completed: true, category: 'طراحی' },
      { id: 2, text: 'پیاده‌سازی سیستم روتینگ هوشمند', completed: false, category: 'توسعه' }
    ];
  });
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('عمومی');

  useEffect(() => {
    localStorage.setItem('codgar_todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input.trim(), completed: false, category }]);
    setInput('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 my-8 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">مدیریت کارهای هوشمند</h1>
        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full">
          {todos.filter(t => t.completed).length} از {todos.length} انجام شده
        </span>
      </div>

      <form onSubmit={addTodo} className="space-y-3 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="عنوان کار جدید..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-500/20 flex items-center gap-2 text-sm">
            <Plus className="w-5 h-5" />
            افزودن
          </button>
        </div>
      </form>

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {todos.map(todo => (
          <div key={todo.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 transition">
            <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleTodo(todo.id)}>
              {todo.completed ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-400 shrink-0" />
              )}
              <span className={`text-sm font-medium ${todo.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
                {todo.text}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] rounded-md">
                {todo.category}
              </span>
              <button onClick={() => deleteTodo(todo.id)} className="text-slate-400 hover:text-rose-500 transition p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}