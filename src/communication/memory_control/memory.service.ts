import { MemoryRepository } from "./memory.repository.js";
export class MemoryService {
  constructor(private memoryRepository: MemoryRepository) {}

  search_memory = async (params: any) => {
    return this.memoryRepository.search_memory(params);
  }

  delete_communications = async (profileID: string, communicationIDs: string[]) => {
    if(!communicationIDs.length) {
      return { count: 0 };
    }

    return this.memoryRepository.delete_communications(profileID, communicationIDs);
  }
}
