export class RateCalculator {
  private voteCounts: Map<string, number[]> = new Map();
  private readonly windowSize = 5000;

  addVote(optionId: string): void {
    const now = Date.now();
    const votes = this.voteCounts.get(optionId) || [];
    votes.push(now);

    const recentVotes = votes.filter((time) => now - time <= this.windowSize);
    this.voteCounts.set(optionId, recentVotes);
  }

  getRate(optionId: string): number {
    const votes = this.voteCounts.get(optionId) || [];
    const now = Date.now();
    const recentVotes = votes.filter((time) => now - time <= this.windowSize);

    const rate = (recentVotes.length / this.windowSize) * 1000;
    return Math.round(rate * 10) / 10;
  }

  reset(): void {
    this.voteCounts.clear();
  }
}
