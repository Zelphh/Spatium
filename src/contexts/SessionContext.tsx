import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { notify } from '@/components/notificationManager';
import { useTimerContext } from '@/contexts/TimerContext';
import { changeCategory, changeDescription, changeNotes, getCategories } from '@/lib/timer';
import type { Category } from '@/pages/type';

interface SessionContextValue {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  selectedCategory: Category | null;
  selectCategory: (category: Category | null) => void;
  taskDescription: string;
  setTaskDescription: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  /** Inicia ou pausa o timer com a descrição e a categoria atuais. */
  toggleTimer: () => void;
  /** Salva descrição e notas na sessão ativa, finaliza o timer e limpa o rascunho. */
  finishSession: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// Rascunho da sessão de foco (categoria, descrição e notas), compartilhado entre a tela
// do Timer, o card de Início Rápido e o modo mini.
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const timer = useTimerContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [taskDescription, setTaskDescription] = useState('');
  const [notes, setNotes] = useState('');
  const hasNotifiedCompletionRef = useRef(false);
  const cancelNotificationRef = useRef(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => console.error('Falha ao carregar categorias:', error));
  }, []);

  useEffect(() => {
    if (timer.mode !== 'custom' || !timer.isCompleted) {
      hasNotifiedCompletionRef.current = false;
      cancelNotificationRef.current = false;
      return;
    }

    if (!hasNotifiedCompletionRef.current && !cancelNotificationRef.current) {
      notify({
        title: 'Timer finalizado',
        message: 'O tempo do modo personalizado chegou ao fim.',
        duration: 4000,
      });
      hasNotifiedCompletionRef.current = true;
    }
  }, [timer.mode, timer.isCompleted]);

  // Derivada da lista, para refletir edições e exclusões de categoria automaticamente.
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) ?? null;

  const selectCategory = useCallback((category: Category | null) => {
    if (category && timer.sessionId !== null && timer.sessionId > 0) {
      changeCategory({
        session_id: timer.sessionId,
        category_id: Number(category.id),
      });
    }
    setSelectedCategoryId(category?.id ?? null);
  }, [timer.sessionId]);

  const toggleTimer = useCallback(() => {
    timer.toggle(taskDescription, selectedCategory?.id ? Number(selectedCategory.id) : null);
  }, [timer, taskDescription, selectedCategory]);

  const finishSession = useCallback(() => {
    cancelNotificationRef.current = true;
    if (timer.sessionId !== null && timer.sessionId > 0) {
      changeNotes({
        session_id: timer.sessionId,
        notes,
      });
      changeDescription({
        session_id: timer.sessionId,
        description: taskDescription,
      });
    }
    timer.reset();
    setTaskDescription('');
    setSelectedCategoryId(null);
    setNotes('');
  }, [timer, notes, taskDescription]);

  return (
    <SessionContext.Provider value={{
      categories,
      setCategories,
      selectedCategory,
      selectCategory,
      taskDescription,
      setTaskDescription,
      notes,
      setNotes,
      toggleTimer,
      finishSession,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}
