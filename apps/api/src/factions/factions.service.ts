import { Injectable } from '@nestjs/common';
import { Faction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeGradeName } from '../grades/grades.service';
import { filterByDepartment } from '../common/department-visibility';
import { CreateFactionDto, UpdateFactionDto } from './dto/faction.dto';

@Injectable()
export class FactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(authenticated = false) {
    const factions = await this.prisma.faction.findMany({
      where: { playable: true },
      include: { departments: true },
      orderBy: { name: 'asc' },
    });
    if (authenticated) return factions;
    return factions.map((f) => ({
      ...f,
      departments: f.departments.map(
        ({ leadership: _l, chefId: _c, deputyIds: _d, budget: _b, ...pub }) => pub,
      ),
    }));
  }

  /**
   * authenticated=false (visiteur non connecte) : masque direction/budget
   * des departements (leadership, chefId, deputyIds, budget) — infos
   * internes, pas la simple existence/description publique de la faction.
   */
  async findOne(slug: string, authenticated = false) {
    const faction = await this.prisma.faction.findUnique({
      where: { slug },
      include: { departments: true },
    });
    if (!faction) return null;

    const [memberCount, topGrade] = await Promise.all([
      this.prisma.player.count({
        where: { factionId: faction.id, activeForUser: { isNot: null } },
      }),
      this.prisma.grade.findFirst({
        where: { departmentRef: { factionId: faction.id }, pay: { not: null } },
        orderBy: { pay: 'desc' },
        select: { name: true, pay: true },
      }),
    ]);

    const departments = authenticated
      ? faction.departments
      : faction.departments.map(
          ({ leadership: _l, chefId: _c, deputyIds: _d, budget: _b, ...pub }) => pub,
        );

    return { ...faction, departments, memberCount, topGrade };
  }

  /** Personnages actifs affilies a cette faction — pour la vitrine publique. */
  async listMembers(factionId: string) {
    const players = await this.prisma.player.findMany({
      where: { factionId, activeForUser: { isNot: null } },
      orderBy: { seniority: 'asc' },
      include: {
        gradeInfo: { select: { name: true } },
        user: { select: { minecraftUsername: true, avatarUrl: true } },
      },
    });
    return players.map((p) => ({
      rpFirstName: p.rpFirstName,
      rpLastName: p.rpLastName,
      grade: p.gradeInfo?.name ?? p.grade,
      minecraftUsername: p.user.minecraftUsername,
      avatarUrl: p.user.avatarUrl,
    }));
  }

  /**
   * Meme requete que PlayersService.getDepartmentId — duplicuee ici plutot que
   * d'importer PlayersModule dans FactionsModule, ce qui fermerait un cycle
   * (AuthModule -> SyncModule -> FactionsModule -> PlayersModule -> SyncModule).
   */
  async resolveDepartmentId(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { activeCharacterId: true },
    });
    if (!user?.activeCharacterId) return null;
    const player = await this.prisma.player.findUnique({
      where: { id: user.activeCharacterId },
      select: { gradeInfo: { select: { departmentRefId: true } } },
    });
    return player?.gradeInfo?.departmentRefId ?? null;
  }

  /** Évènements RP liés à cette faction — filtrés par habilitation du demandeur, même règle que EventsService. */
  async listEvents(factionId: string, departmentId: string | null = null) {
    const events = await this.prisma.gameEvent.findMany({
      where: { factionId },
      orderBy: { date: 'desc' },
      take: 6,
    });
    return filterByDepartment(events, departmentId);
  }

  findById(id: string) {
    return this.prisma.faction.findUnique({
      where: { id },
      include: { departments: true },
    });
  }

  create(dto: CreateFactionDto) {
    return this.prisma.faction.create({
      data: {
        ...dto,
        objectives: dto.objectives ?? [],
        deputyIds: dto.deputyIds ?? [],
      },
    });
  }

  update(id: string, dto: UpdateFactionDto) {
    return this.prisma.faction.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.faction.delete({ where: { id } });
  }

  /**
   * Resout un nom de faction en texte libre (Discord/Minecraft) vers
   * l'entree du catalogue correspondante, par correspondance normalisee.
   */
  async findByName(name: string | null | undefined): Promise<Faction | null> {
    if (!name) return null;
    const key = normalizeGradeName(name);
    const factions = await this.prisma.faction.findMany();
    return factions.find((f) => normalizeGradeName(f.name) === key) ?? null;
  }
}
