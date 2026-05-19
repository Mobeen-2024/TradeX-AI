import { PortfolioRepository, Portfolio } from "../db/repositories/portfolios";
import { PositionRepository, Position } from "../db/repositories/positions";

export class PortfolioService {
  static async createPortfolio(userId: string, name: string, description: string | null): Promise<Portfolio> {
    return PortfolioRepository.create(userId, name, description);
  }

  static async getUserPortfolios(userId: string): Promise<(Portfolio & { positions: Position[] })[]> {
    const portfolios = await PortfolioRepository.findByUserId(userId);
    const enrichedPortfolios = [];

    for (const portfolio of portfolios) {
      const positions = await PositionRepository.findByPortfolioId(portfolio.id);
      enrichedPortfolios.push({
        ...portfolio,
        positions,
      });
    }

    return enrichedPortfolios;
  }
}
