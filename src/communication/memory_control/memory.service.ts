import { MemoryRepository } from "./memory.repository.js";
export class MemoryService {
  constructor(private memoryRepository: MemoryRepository) {}

  search_memory = async (params: any) => {
    return this.memoryRepository.search_memory(params);
  }
}
