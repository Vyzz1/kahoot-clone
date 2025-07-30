import { gameQueue } from "../queue";

class GameQueueService {
  private baseQueueOptions = {
    attempts: 3,
    backoff: {
      type: "exponential" as const,
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  };

  async addToQueue(evtName: string, data: any, priority: number = 0) {
    try {
      const job = await gameQueue.add(evtName, data, {
        ...this.baseQueueOptions,
        priority,
      });

      console.log(`Job ${job.id} queued: ${evtName}`);
      return job;
    } catch (error) {
      console.error(`Failed to queue job: ${evtName}`, error);
      throw error;
    }
  }

  async getQueueHealth() {
    const [waiting, active, completed, failed] = await Promise.all([
      gameQueue.getWaiting(),
      gameQueue.getActive(),
      gameQueue.getCompleted(),
      gameQueue.getFailed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }
}

export default new GameQueueService();
