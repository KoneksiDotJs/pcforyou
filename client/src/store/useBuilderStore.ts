import { create } from 'zustand';
import type { Component, ComponentCategory } from '../types';

interface BuilderState {
  // Menyimpan komponen yang dipilih berdasarkan kategorinya
  selectedParts: Record<ComponentCategory, Component | null>;
  
  // Fungsi untuk memodifikasi state
  setPart: (category: ComponentCategory, component: Component) => void;
  removePart: (category: ComponentCategory) => void;
  clearBuild: () => void;
  
  // Kalkulasi total harga berdasarkan harga termurah dari listing
  getTotalPrice: () => number;
}

const initialParts: Record<ComponentCategory, Component | null> = {
  CPU: null,
  MOTHERBOARD: null,
  RAM: null,
  GPU: null,
  PSU: null,
  STORAGE: null,
  CASE: null,
  COOLER: null,
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  selectedParts: { ...initialParts },

  setPart: (category, component) => 
    set((state) => ({
      selectedParts: { ...state.selectedParts, [category]: component }
    })),

  removePart: (category) => 
    set((state) => ({
      selectedParts: { ...state.selectedParts, [category]: null }
    })),

  clearBuild: () => set({ selectedParts: { ...initialParts } }),

  getTotalPrice: () => {
    const { selectedParts } = get();
    let total = 0;

    Object.values(selectedParts).forEach((part) => {
      if (part && part.listings && part.listings.length > 0) {
        // Ambil harga termurah dari array listings (asumsi backend sudah mengurutkannya 'asc')
        total += part.listings[0].price;
      }
    });

    return total;
  }
}));