// src/app/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Typed dispatch hook
export const useAppDispatch: () => AppDispatch = useDispatch;

// Typed selector hook (type-only import avoids ESM runtime export errors)
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;