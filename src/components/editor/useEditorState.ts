'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizeDoc } from '@/lib/doc/normalize';
import type { PlusDoc } from '@/lib/doc/types';
import { EditorHttpError, editorApi } from './editor-api';

export type SaveStatus = 'saved' | 'pending' | 'saving' | 'error' | 'conflict' | 'expired';

const HISTORY_LIMIT = 120;
const SAVE_DELAY = 900;
/** Shu vaqt ichidagi bir xil maydon o'zgarishlari — bitta «orqaga» qadami (har harf emas) */
const COALESCE_MS = 1200;

interface Options {
  initialDoc: PlusDoc;
  initialVersion: number;
  hasUnpublished: boolean;
  publishedAt: string | null;
  accountUrl: string;
}

/**
 * Muharrir holati: hujjat, orqaga/oldinga tarixi va avtomatik saqlash (qoralama). Saqlash ketma-ket
 * (bir vaqtda bitta so'rov), versiya bilan — boshqa oynada o'zgargan bo'lsa «conflict».
 */
export function useEditorState({ initialDoc, initialVersion, hasUnpublished, publishedAt, accountUrl }: Options) {
  const [doc, setDoc] = useState<PlusDoc>(initialDoc);
  const [status, setStatus] = useState<SaveStatus>('saved');
  const [error, setError] = useState<string | null>(null);
  const [unpublished, setUnpublished] = useState(hasUnpublished);
  const [lastPublished, setLastPublished] = useState(publishedAt);
  const [version, setVersion] = useState(initialVersion);

  const undoStack = useRef<PlusDoc[]>([]);
  const redoStack = useRef<PlusDoc[]>([]);
  const lastChange = useRef<{ key: string; at: number } | null>(null);
  const versionRef = useRef(initialVersion);
  const docRef = useRef(initialDoc);
  const dirty = useRef(false);
  const saving = useRef<Promise<void> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, force] = useState(0);

  const save = useCallback(async (): Promise<void> => {
    if (saving.current) {
      await saving.current;
      if (!dirty.current) return;
    }
    const run = (async () => {
      while (dirty.current) {
        dirty.current = false;
        const snapshot = docRef.current;
        setStatus('saving');
        try {
          const result = await editorApi.saveDraft(snapshot, versionRef.current);
          versionRef.current = result.draftVersion;
          setVersion(result.draftVersion);
          setUnpublished(true);
          setError(null);
        } catch (err) {
          dirty.current = true;
          const httpError = err instanceof EditorHttpError ? err : null;
          if (httpError?.status === 409) setStatus('conflict');
          else if (httpError?.status === 401) setStatus('expired');
          else setStatus('error');
          setError(err instanceof Error ? err.message : 'Saqlab bo‘lmadi.');
          return;
        }
      }
      setStatus('saved');
    })();
    saving.current = run;
    try {
      await run;
    } finally {
      saving.current = null;
    }
  }, []);

  const schedule = useCallback(() => {
    dirty.current = true;
    setStatus((current) => (current === 'conflict' || current === 'expired' ? current : 'pending'));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(), SAVE_DELAY);
  }, [save]);

  /** Hujjatni o'zgartirish. key — bir xil maydonni ketma-ket yozish tarixda bitta qadam bo'lishi uchun */
  const change = useCallback(
    (updater: (doc: PlusDoc) => PlusDoc, key?: string) => {
      const prev = docRef.current;
      const next = updater(prev);
      if (next === prev) return;
      const now = Date.now();
      const coalesce = key && lastChange.current?.key === key && now - lastChange.current.at < COALESCE_MS;
      if (!coalesce) {
        undoStack.current.push(prev);
        if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
      }
      redoStack.current = [];
      lastChange.current = key ? { key, at: now } : null;
      docRef.current = next;
      setDoc(next);
      schedule();
    },
    [schedule],
  );

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    redoStack.current.push(docRef.current);
    lastChange.current = null;
    docRef.current = prev;
    setDoc(prev);
    schedule();
  }, [schedule]);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(docRef.current);
    lastChange.current = null;
    docRef.current = next;
    setDoc(next);
    schedule();
  }, [schedule]);

  /** Serverdagi qoralamani qayta yuklash (boshqa oynada o'zgargan, tarixdan qaytarilgan yoki bekor qilingan) */
  const reload = useCallback(async () => {
    const state = await editorApi.load();
    const next = normalizeDoc(state.draft, accountUrl);
    undoStack.current = [];
    redoStack.current = [];
    lastChange.current = null;
    dirty.current = false;
    docRef.current = next;
    versionRef.current = state.draftVersion;
    setVersion(state.draftVersion);
    setDoc(next);
    setUnpublished(state.hasUnpublished);
    setLastPublished(state.publishedAt);
    setStatus('saved');
    setError(null);
  }, [accountUrl]);

  const publish = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    await save();
    if (dirty.current) throw new Error(error ?? 'Avval o‘zgarishlar saqlanishi kerak.');
    const result = await editorApi.publish();
    setUnpublished(false);
    setLastPublished(result.publishedAt);
    force((n) => n + 1);
  }, [save, error]);

  // Saqlanmagan o'zgarish bilan oynani yopishdan oldin ogohlantirish
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty.current || saving.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  return {
    doc,
    change,
    undo,
    redo,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    status,
    error,
    retry: save,
    reload,
    publish,
    unpublished,
    lastPublished,
    version,
  };
}

export type EditorState = ReturnType<typeof useEditorState>;
