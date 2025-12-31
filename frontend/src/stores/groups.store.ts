import { create } from 'zustand';
import { Group, Event } from '@/types';
import { groupService, eventService } from '@/services/api';

interface GroupsState {
  groups: Group[];
  currentGroup: Group | null;
  events: Event[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchGroups: () => Promise<void>;
  fetchGroupById: (id: string) => Promise<void>;
  fetchGroupEvents: (groupId: string) => Promise<void>;
  createGroup: (name: string) => Promise<Group>;
  joinGroup: (inviteCode: string) => Promise<Group>;
  leaveGroup: (id: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  setCurrentGroup: (group: Group | null) => void;
  reset: () => void;
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  currentGroup: null,
  events: [],
  isLoading: false,
  error: null,

  fetchGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const groups = await groupService.getMyGroups();
      set({ groups, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchGroupById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const group = await groupService.getById(id);
      set({ currentGroup: group, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchGroupEvents: async (groupId: string) => {
    try {
      const events = await eventService.getByGroupId(groupId);
      set({ events });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  createGroup: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const group = await groupService.create(name);
      set((state) => ({ 
        groups: [group, ...state.groups], 
        isLoading: false 
      }));
      return group;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  joinGroup: async (inviteCode: string) => {
    set({ isLoading: true, error: null });
    try {
      const group = await groupService.join(inviteCode);
      set((state) => ({ 
        groups: [group, ...state.groups], 
        isLoading: false 
      }));
      return group;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  leaveGroup: async (id: string) => {
    try {
      await groupService.leave(id);
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== id),
        currentGroup: state.currentGroup?.id === id ? null : state.currentGroup,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteGroup: async (id: string) => {
    try {
      await groupService.delete(id);
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== id),
        currentGroup: state.currentGroup?.id === id ? null : state.currentGroup,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  setCurrentGroup: (group) => set({ currentGroup: group }),

  reset: () => set({ groups: [], currentGroup: null, events: [], error: null }),
}));

