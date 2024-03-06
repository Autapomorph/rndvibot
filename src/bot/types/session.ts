export interface VideoConversationData {
  fileId: string;
  fileUniqueId: string;
}

export interface SessionData {
  videoConversationData?: VideoConversationData;
  createdAt: string;
  updatedAt: string;
}
