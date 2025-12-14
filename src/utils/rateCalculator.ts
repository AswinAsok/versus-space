export class RateCalculator {
  private voteCounts: Map<string, { time: number; count: number }[]> = new Map();
  private readonly windowSize = 5000;

  // Register a vote timestamp and prune old entries to maintain a sliding window.
  addVote(optionId: string): void {
    this.addVotes(optionId, 1);
  }

  // Register multiple votes at once (useful for external tally changes).
  addVotes(optionId: string, count: number): void {
    if (count <= 0) return;
    const now = Date.now();
    const votes = this.voteCounts.get(optionId) || [];
    votes.push({ time: now, count });

    const recentVotes = votes.filter((entry) => now - entry.time <= this.windowSize);
    this.voteCounts.set(optionId, recentVotes);
  }

  // Compute votes-per-second over the configured window.
  getRate(optionId: string): number {
    const votes = this.voteCounts.get(optionId) || [];
    const now = Date.now();
    const recentVotes = votes.filter((entry) => now - entry.time <= this.windowSize);
    this.voteCounts.set(optionId, recentVotes);

    const totalVotes = recentVotes.reduce((sum, entry) => sum + entry.count, 0);
    const rate = (totalVotes / this.windowSize) * 1000;
    return Math.round(rate * 10) / 10;
  }

  reset(): void {
    this.voteCounts.clear();
  }
}
