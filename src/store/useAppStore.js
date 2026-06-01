import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
  origin: null,
  destination: null,
  routes: [],
  selectedRouteIndex: 0,
  isNavigating: false,
  currentStepIndex: 0,
  isLoading: false,
  error: null,

  setOrigin: (position) => set({ origin: position }),

  setDestination: (dest) => set({ destination: dest, routes: [], selectedRouteIndex: 0 }),

  setRoutes: (routes) => set({ routes, selectedRouteIndex: 0 }),

  selectRoute: (index) => set({ selectedRouteIndex: index }),

  startNavigation: () => set({ isNavigating: true, currentStepIndex: 0 }),

  stopNavigation: () => set({ isNavigating: false, currentStepIndex: 0 }),

  nextStep: () => {
    const { currentStepIndex, routes, selectedRouteIndex } = get()
    const steps = routes[selectedRouteIndex]?.legs?.[0]?.steps ?? []
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 })
    }
  },

  setLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),

  reset: () => set({
    destination: null,
    routes: [],
    selectedRouteIndex: 0,
    isNavigating: false,
    currentStepIndex: 0,
    error: null
  })
}))
