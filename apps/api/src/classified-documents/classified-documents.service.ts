import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassifiedDocumentStatus, ScpProposalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateClassifiedDocumentDto,
  UpdateClassifiedDocumentDto,
} from './dto/classified-document.dto';
import {
  filterByDepartment,
  isVisibleToDepartment,
} from '../common/department-visibility';
import { DiscordService } from '../sync/discord.service';

const LINKED_EVENT_SELECT = {
  id: true,
  slug: true,
  title: true,
  date: true,
  restrictedDepartmentIds: true,
};

const LINKED_SCP_SELECT = {
  id: true,
  slug: true,
  number: true,
  name: true,
  class: true,
  status: true,
  restrictedDepartmentIds: true,
};

@Injectable()
export class ClassifiedDocumentsService {
  constructor(
    private prisma: PrismaService,
    private discord: DiscordService,
  ) {}

  /** Ne garde que les liens réellement visibles/publiés pour le lecteur — jamais de fuite via un lien vers un contenu restreint ou non approuvé. */
  private filterLinks<
    T extends { restrictedDepartmentIds: string[] },
    S extends { restrictedDepartmentIds: string[]; status: ScpProposalStatus },
  >(document: { linkedEvents: T[]; linkedScpObjects: S[] }, departmentId: string | null) {
    return {
      ...document,
      linkedEvents: filterByDepartment(document.linkedEvents, departmentId),
      linkedScpObjects: filterByDepartment(
        document.linkedScpObjects.filter((s) => s.status === ScpProposalStatus.APPROVED),
        departmentId,
      ),
    };
  }

  async findPublished(departmentId: string | null = null) {
    const documents = await this.prisma.classifiedDocument.findMany({
      where: { status: ClassifiedDocumentStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      include: {
        author: { select: { minecraftUsername: true } },
        faction: { select: { id: true, slug: true, name: true, color: true } },
      },
    });
    return filterByDepartment(documents, departmentId);
  }

  async findBySlug(slug: string, departmentId: string | null = null) {
    const document = await this.prisma.classifiedDocument.findUnique({
      where: { slug },
      include: {
        author: { select: { minecraftUsername: true } },
        faction: { select: { id: true, slug: true, name: true, color: true } },
        linkedEvents: { select: LINKED_EVENT_SELECT },
        linkedScpObjects: { select: LINKED_SCP_SELECT },
      },
    });
    if (!document || document.status !== ClassifiedDocumentStatus.PUBLISHED) {
      throw new NotFoundException('Document introuvable');
    }
    if (!isVisibleToDepartment(document.restrictedDepartmentIds, departmentId)) {
      throw new NotFoundException('Accès restreint à un autre département');
    }
    return this.filterLinks(document, departmentId);
  }

  findAllAdmin() {
    return this.prisma.classifiedDocument.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        author: { select: { minecraftUsername: true } },
        faction: { select: { id: true, slug: true, name: true } },
      },
    });
  }

  findById(id: string) {
    return this.prisma.classifiedDocument.findUnique({
      where: { id },
      include: {
        linkedEvents: { select: { id: true, title: true } },
        linkedScpObjects: { select: { id: true, number: true, name: true } },
      },
    });
  }

  async create(authorId: string, dto: CreateClassifiedDocumentDto) {
    const { linkedEventIds, linkedScpIds, ...rest } = dto;
    const restrictedDepartmentIds = dto.restrictedDepartmentIds ?? [];
    const document = await this.prisma.classifiedDocument.create({
      data: {
        ...rest,
        authorId,
        restrictedDepartmentIds,
        tags: dto.tags ?? [],
        attachments: dto.attachments ?? [],
        publishedAt:
          dto.status === ClassifiedDocumentStatus.PUBLISHED ? new Date() : null,
        linkedEvents: linkedEventIds ? { connect: linkedEventIds.map((id) => ({ id })) } : undefined,
        linkedScpObjects: linkedScpIds ? { connect: linkedScpIds.map((id) => ({ id })) } : undefined,
      },
    });

    if (
      document.status === ClassifiedDocumentStatus.PUBLISHED &&
      restrictedDepartmentIds.length === 0
    ) {
      void this.discord.notifyDocumentPublished({
        title: document.title,
        excerpt: document.excerpt,
        slug: document.slug,
      });
    }

    return document;
  }

  async update(
    id: string,
    dto: UpdateClassifiedDocumentDto,
    editorId?: string,
    editorLabel?: string,
  ) {
    const before = await this.prisma.classifiedDocument.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Document introuvable');

    await this.prisma.classifiedDocumentRevision.create({
      data: {
        documentId: before.id,
        title: before.title,
        excerpt: before.excerpt,
        content: before.content,
        status: before.status,
        restrictedDepartmentIds: before.restrictedDepartmentIds,
        factionId: before.factionId,
        tags: before.tags,
        attachments: before.attachments,
        editedById: editorId,
        editedByLabel: editorLabel,
      },
    });

    const { linkedEventIds, linkedScpIds, ...rest } = dto;
    const updated = await this.prisma.classifiedDocument.update({
      where: { id },
      data: {
        ...rest,
        publishedAt:
          dto.status === ClassifiedDocumentStatus.PUBLISHED ? new Date() : undefined,
        linkedEvents: linkedEventIds ? { set: linkedEventIds.map((id) => ({ id })) } : undefined,
        linkedScpObjects: linkedScpIds ? { set: linkedScpIds.map((id) => ({ id })) } : undefined,
      },
    });

    const justPublished =
      updated.status === ClassifiedDocumentStatus.PUBLISHED &&
      before.status !== ClassifiedDocumentStatus.PUBLISHED;
    if (justPublished && updated.restrictedDepartmentIds.length === 0) {
      void this.discord.notifyDocumentPublished({
        title: updated.title,
        excerpt: updated.excerpt,
        slug: updated.slug,
      });
    }

    return updated;
  }

  /** Historique des révisions d'un document classifié — le plus récent d'abord */
  async listRevisions(documentId: string) {
    const document = await this.prisma.classifiedDocument.findUnique({
      where: { id: documentId },
      select: { id: true },
    });
    if (!document) throw new NotFoundException('Document introuvable');

    return this.prisma.classifiedDocumentRevision.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  remove(id: string) {
    return this.prisma.classifiedDocument.delete({ where: { id } });
  }
}
