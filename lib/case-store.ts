"use client";

import { create } from "zustand";
import type { Case, ProposalSlot, MaterialFile, ChatMessage } from "./types";
import { mockCases } from "./types";

interface CaseStore {
  cases: Case[];
  selectedCase: Case | null;
  currentStep: number;
  viewMode: "sales" | "admin";
  
  // Actions
  setCases: (cases: Case[]) => void;
  setSelectedCase: (caseItem: Case | null) => void;
  setCurrentStep: (step: number) => void;
  setViewMode: (mode: "sales" | "admin") => void;
  
  // Case Actions
  createCase: (corporateName: string, storeName: string, additionalData?: Partial<Case>) => Case;
  updateCase: (id: string, updates: Partial<Case>) => void;
  deleteCase: (id: string) => void;
  
  // Duplicate
  duplicateCase: (caseId: string, selectedSlotIds: string[]) => Case | null;
  duplicateSlotsToSameCase: (caseId: string, selectedSlotIds: string[]) => Case | null;

  // Proposal Actions
  addProposalSlot: (caseId: string, slot: ProposalSlot) => void;
  removeProposalSlot: (caseId: string, slotId: string) => void;
  updateProposalSlot: (caseId: string, slotId: string, updates: Partial<ProposalSlot>) => void;
  
  // Step 1 Actions
  proceedToPublishing: (caseId: string) => void;
  skipProposal: (caseId: string) => void;
  
  // Step 2 Actions
  uploadApplicationDocument: (caseId: string, documentUrl: string) => void;
  addMaterial: (caseId: string, material: MaterialFile) => void;
  removeMaterial: (caseId: string, materialId: string) => void;
  requestAdminReview: (caseId: string) => void;
  startPublishing: (caseId: string) => void;
  
  // Chat Actions
  sendChatMessage: (caseId: string, slotId: string, content: string, sender: "admin" | "sales", senderName: string) => void;
  addSystemChatMessage: (caseId: string, slotId: string, content: string, sender: "admin" | "sales") => void;

  // Admin Actions
  approveCase: (caseId: string) => void;
  rejectCase: (caseId: string, comment: string) => void;
  requestStopPublishing: (caseId: string, reason: string) => void;
  confirmStopPublishing: (caseId: string) => void;
}

export const useCaseStore = create<CaseStore>((set, get) => ({
  cases: mockCases,
  selectedCase: null,
  currentStep: 1,
  viewMode: "sales",
  
  setCases: (cases) => set({ cases }),
  setSelectedCase: (caseItem) => set({ selectedCase: caseItem }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setViewMode: (mode) => set({ viewMode: mode }),
  
  createCase: (corporateName, storeName, additionalData) => {
    const caseNum = get().cases.length + 1;
    const newCase: Case = {
      id: `case-${Date.now()}`,
      caseNumber: `PJ-${String(caseNum).padStart(3, "0")}`,
      corporateName,
      storeName,
      status: "提案中",
      projectStatus: "提案中",
      createdAt: new Date(),
      updatedAt: new Date(),
      proposalSlots: [],
      aiRecommendedSlots: [
        {
          id: `ai-slot-${Date.now()}`,
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          bannerType: "静止画",
        },
      ],
      ...additionalData,
    };
    set((state) => ({ cases: [newCase, ...state.cases] }));
    return newCase;
  },
  
  updateCase: (id, updates) => {
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
      ),
      selectedCase:
        state.selectedCase?.id === id
          ? { ...state.selectedCase, ...updates, updatedAt: new Date() }
          : state.selectedCase,
    }));
  },
  
  deleteCase: (id) => {
    set((state) => ({
      cases: state.cases.filter((c) => c.id !== id),
      selectedCase: state.selectedCase?.id === id ? null : state.selectedCase,
    }));
  },
  
  duplicateCase: (caseId, selectedSlotIds) => {
    const { cases } = get();
    const original = cases.find((c) => c.id === caseId);
    if (!original) return null;
    const caseNum = cases.length + 1;
    const duplicatedSlots: ProposalSlot[] = original.proposalSlots
      .filter((s) => selectedSlotIds.includes(s.id))
      .map((s) => ({
        ...s,
        id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        recordNumber: String(13828 + Math.floor(Math.random() * 10000)),
        proposalStatus: "提案前",
        executionStatus: "実施前",
        yomi: "-",
        managementCheck: "-",
      }));
    const newCase: Case = {
      ...original,
      id: `case-${Date.now()}`,
      caseNumber: `PJ-${String(caseNum).padStart(3, "0")}`,
      status: "提案中",
      projectStatus: "提案中",
      createdAt: new Date(),
      updatedAt: new Date(),
      proposalSlots: duplicatedSlots,
      applicationDocumentUrl: undefined,
      materials: [],
      chatMessages: [],
    };
    set((state) => ({ cases: [newCase, ...state.cases] }));
    return newCase;
  },

  duplicateSlotsToSameCase: (caseId, selectedSlotIds) => {
    const { cases } = get();
    const original = cases.find((c) => c.id === caseId);
    if (!original) return null;
    const duplicatedSlots: ProposalSlot[] = original.proposalSlots
      .filter((s) => selectedSlotIds.includes(s.id))
      .map((s) => ({
        ...s,
        id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        recordNumber: String(13828 + Math.floor(Math.random() * 10000)),
        proposalStatus: "提案前",
        executionStatus: "実施前",
        yomi: "-",
        managementCheck: "-",
      }));
    const updated: Case = {
      ...original,
      proposalSlots: [...original.proposalSlots, ...duplicatedSlots],
      updatedAt: new Date(),
    };
    set((state) => ({
      cases: state.cases.map((c) => (c.id === caseId ? updated : c)),
    }));
    return updated;
  },

  addProposalSlot: (caseId, slot) => {
    const { updateCase, cases } = get();
    const caseItem = cases.find((c) => c.id === caseId);
    if (caseItem) {
      updateCase(caseId, {
        proposalSlots: [...caseItem.proposalSlots, slot],
      });
    }
  },
  
  removeProposalSlot: (caseId, slotId) => {
    const { updateCase, cases } = get();
    const caseItem = cases.find((c) => c.id === caseId);
    if (caseItem) {
      updateCase(caseId, {
        proposalSlots: caseItem.proposalSlots.filter((s) => s.id !== slotId),
      });
    }
  },
  
  updateProposalSlot: (caseId, slotId, updates) => {
    const { updateCase, cases } = get();
    const caseItem = cases.find((c) => c.id === caseId);
    if (caseItem) {
      updateCase(caseId, {
        proposalSlots: caseItem.proposalSlots.map((s) =>
          s.id === slotId ? { ...s, ...updates } : s
        ),
      });
    }
  },
  
  proceedToPublishing: (caseId) => {
    const { updateCase } = get();
    updateCase(caseId, { status: "配信準備中" });
    set({ currentStep: 2 });
  },
  
  skipProposal: (caseId) => {
    const { updateCase } = get();
    updateCase(caseId, { status: "見送り" });
  },
  
  uploadApplicationDocument: (caseId, documentUrl) => {
    const { updateCase } = get();
    updateCase(caseId, { applicationDocumentUrl: documentUrl });
  },
  
  addMaterial: (caseId, material) => {
    const { updateCase, cases } = get();
    const caseItem = cases.find((c) => c.id === caseId);
    if (caseItem) {
      updateCase(caseId, {
        materials: [...(caseItem.materials || []), material],
      });
    }
  },
  
  removeMaterial: (caseId, materialId) => {
    const { updateCase, cases } = get();
    const caseItem = cases.find((c) => c.id === caseId);
    if (caseItem) {
      updateCase(caseId, {
        materials: (caseItem.materials || []).filter((m) => m.id !== materialId),
      });
    }
  },
  
  requestAdminReview: (caseId) => {
    const { updateCase } = get();
    updateCase(caseId, {
      status: "事務確認中",
      adminReviewStatus: "pending",
    });
  },
  
  startPublishing: (caseId) => {
    const { updateCase } = get();
    updateCase(caseId, { status: "掲載中" });
  },
  
  sendChatMessage: (caseId, slotId, content, sender, senderName) => {
    const { updateCase, cases } = get();
    const caseItem = cases.find((c) => c.id === caseId);
    if (caseItem) {
      const newMessage: ChatMessage = {
        id: `chat-${Date.now()}`,
        caseId,
        slotId,
        sender,
        senderName,
        content,
        createdAt: new Date(),
      };
      updateCase(caseId, {
        chatMessages: [...(caseItem.chatMessages || []), newMessage],
      });
    }
  },

  addSystemChatMessage: (caseId, slotId, content, sender) => {
    const { updateCase, cases } = get();
    const caseItem = cases.find((c) => c.id === caseId);
    if (caseItem) {
      const newMessage: ChatMessage = {
        id: `chat-sys-${Date.now()}-${slotId}`,
        caseId,
        slotId,
        sender,
        senderName: sender === "admin" ? "事務局" : "営業",
        content,
        createdAt: new Date(),
        isSystemMessage: true,
      };
      updateCase(caseId, {
        chatMessages: [...(caseItem.chatMessages || []), newMessage],
      });
    }
  },

  approveCase: (caseId) => {
    const { updateCase } = get();
    updateCase(caseId, {
      adminReviewStatus: "approved",
      adminReviewComment: undefined,
    });
  },

  rejectCase: (caseId, comment) => {
    const { updateCase, addSystemChatMessage, cases } = get();
    updateCase(caseId, {
      status: "差し戻し",
      adminReviewStatus: "rejected",
      adminReviewComment: comment,
    });
    const caseItem = cases.find((c) => c.id === caseId);
    if (caseItem) {
      for (const slot of caseItem.proposalSlots) {
        addSystemChatMessage(caseId, slot.id, `差し戻しました。${comment}`, "admin");
      }
    }
  },
  
  requestStopPublishing: (caseId, reason) => {
    const { updateCase } = get();
    updateCase(caseId, {
      status: "掲載停止依頼中",
      stopPublishingRequest: reason,
    });
  },
  
  confirmStopPublishing: (caseId) => {
    const { updateCase } = get();
    updateCase(caseId, {
      status: "掲載停止",
      stopPublishingRequest: undefined,
    });
  },
}));
