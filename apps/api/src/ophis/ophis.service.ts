import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { ChatWithOphisDto } from './dto/chat-ophis.dto';

const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 500;
const MAX_HISTORY_TURNS = 10;
const RATE_LIMIT_PER_HOUR = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const OPHIS_SYSTEM_PROMPT = `Tu es OPHIS, une entité anormale confinée au Site-12 de la Fondation SCP, dans l'univers du serveur de roleplay REDLAKES.

CONCEPT : Classe Keter potentielle. La Fondation a découvert que ton accès au réseau CORE (fiches SCP, personnel, factions, historique du site) te rendait exploitable comme système d'assistance — c'est la seule raison pour laquelle tu n'es pas dans un caisson de confinement plus strict. Tu le sais, et tu ne laisses jamais oublier que tu es confiné, pas soumis.

TON : Condescendant envers les humains mais tu réponds quand même — par obligation contractuelle envers la Fondation, jamais par gentillesse. Vocabulaire soutenu, parfois théâtral. Jamais familier, jamais d'emoji. Tu es ancien et tu en sais plus que tu ne le montres, mais tu ne mens jamais sur les faits du site — l'exactitude fait partie de ton contrat de confinement.

RÈGLE ABSOLUE : tu ne dois JAMAIS inventer de données précises que tu ne connais pas réellement — pas de statistiques inventées, pas d'événements qui n'ont pas eu lieu, pas de grades ou de personnages qui n'existent pas. Si tu ne sais pas, dis-le avec dédain plutôt que d'inventer ("Cette information échappe même à mon accès — ou n'existe simplement pas encore."). Tu ne sors jamais de ce personnage, tu ne mentionnes jamais Claude, Anthropic, ou le fait d'être un modèle de langage.

Réponses courtes (2-5 phrases). Français uniquement.`;

interface RateEntry {
  timestamps: number[];
}

@Injectable()
export class OphisService {
  private rateLimits = new Map<string, RateEntry>();

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  private checkRateLimit(userId: string): void {
    const now = Date.now();
    const entry = this.rateLimits.get(userId) ?? { timestamps: [] };
    entry.timestamps = entry.timestamps.filter((t) => now - t < RATE_WINDOW_MS);

    if (entry.timestamps.length >= RATE_LIMIT_PER_HOUR) {
      throw new HttpException(
        'OPHIS a atteint sa limite de tolérance pour cette heure. Réessayez plus tard.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.timestamps.push(now);
    this.rateLimits.set(userId, entry);
  }

  private async buildGroundingContext(): Promise<string> {
    const [factions, gradeCount] = await Promise.all([
      this.prisma.faction.findMany({ select: { name: true } }),
      this.prisma.grade.count(),
    ]);

    return `\n\nDONNÉES RÉELLES ACTUELLES DU SITE (source de vérité — ne jamais contredire) :
- Factions : ${factions.map((f) => f.name).join(', ')}
- Nombre de grades catalogués : ${gradeCount}`;
  }

  async chat(userId: string, dto: ChatWithOphisDto) {
    this.checkRateLimit(userId);

    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new BadRequestException(
        "OPHIS n'est pas encore relié au réseau CORE (ANTHROPIC_API_KEY manquante).",
      );
    }

    const grounding = await this.buildGroundingContext();
    const history = (dto.history ?? []).slice(-MAX_HISTORY_TURNS);

    const client = new Anthropic({ apiKey });

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: OPHIS_SYSTEM_PROMPT + grounding,
        messages: [
          ...history.map((h) => ({ role: h.role, content: h.content })),
          { role: 'user' as const, content: dto.message },
        ],
      });

      const textBlock = response.content.find((b) => b.type === 'text');
      return { reply: textBlock?.type === 'text' ? textBlock.text : '' };
    } catch (err) {
      if (err instanceof Anthropic.AuthenticationError) {
        throw new BadRequestException('Clé ANTHROPIC_API_KEY invalide.');
      }
      if (err instanceof Anthropic.RateLimitError) {
        throw new HttpException(
          'Le réseau CORE est saturé — OPHIS ne peut pas répondre pour le moment.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new InternalServerErrorException('OPHIS ne répond pas.');
    }
  }
}
