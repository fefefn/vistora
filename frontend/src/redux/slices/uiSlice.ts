import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  isMobileMenuOpen: boolean
  theme: 'light' | 'dark'
}

const initialState: UiState = {
  isMobileMenuOpen: false,
  theme: 'light',
}

/** Global UI state (menu open/close, theme). A real slice so the store isn't empty. */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },
    setMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
  },
})

export const { toggleMobileMenu, setMobileMenu, setTheme } = uiSlice.actions
export default uiSlice.reducer
