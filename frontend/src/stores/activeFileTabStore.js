import { create } from 'zustand';

export const useActiveFileTabStore = create((set, get) => ({
    openTabs: [],
    activeFileTab: null,

    setActiveFileTab: (path, value, extension) => {
        const { openTabs } = get();
        const fileName = path.split('/').pop().split('\\').pop();

        const existingTabIndex = openTabs.findIndex((tab) => tab.path === path);

        if (existingTabIndex !== -1) {
            const updatedTabs = [...openTabs];
            updatedTabs[existingTabIndex] = {
                ...updatedTabs[existingTabIndex],
                value,
            };

            set({
                openTabs: updatedTabs,
                activeFileTab: updatedTabs[existingTabIndex],
            });
        } else {
            const newTab = { path, value, extension, name: fileName };
            set({
                openTabs: [...openTabs, newTab],
                activeFileTab: newTab,
            });
        }
    },

    switchTab: (path) => {
        const { openTabs } = get();
        const tab = openTabs.find((t) => t.path === path);
        if (tab) {
            set({ activeFileTab: tab });
        }
    },

    closeTab: (path) => {
        const { openTabs, activeFileTab } = get();
        const filtered = openTabs.filter((t) => t.path !== path);

        if (activeFileTab?.path === path) {
            const closedIndex = openTabs.findIndex((t) => t.path === path);
            const nextTab =
                filtered[Math.min(closedIndex, filtered.length - 1)] || null;

            set({
                openTabs: filtered,
                activeFileTab: nextTab,
            });
        } else {
            set({ openTabs: filtered });
        }
    },
}));