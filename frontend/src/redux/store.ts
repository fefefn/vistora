import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@/redux/slices/uiSlice'

/** The single Redux store. Add feature reducers (auth, cart...) here in later phases. */
export const store = configureStore({
  reducer: {
    ui: uiReducer,
  },
})

// Inferred types — used by the typed hooks below.
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
