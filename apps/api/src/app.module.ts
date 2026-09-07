import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';
import { ApplicationsModule } from './applications/applications.module';
import { LoreModule } from './lore/lore.module';
import { SearchModule } from './search/search.module';
import { GalleryModule } from './gallery/gallery.module';
import { SyncModule } from './sync/sync.module';
import { ReportsModule } from './reports/reports.module';
import { PlatformModule } from './platform/platform.module';
import { HealthModule } from './health/health.module';
import { GradesModule } from './grades/grades.module';
import { FactionsModule } from './factions/factions.module';
import { FactionRelationsModule } from './faction-relations/faction-relations.module';
import { ClassifiedDocumentsModule } from './classified-documents/classified-documents.module';
import { DepartmentsModule } from './departments/departments.module';
import { TeamsModule } from './teams/teams.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { SanctionsModule } from './sanctions/sanctions.module';
import { MissionsModule } from './missions/missions.module';
import { ScpModule } from './scp/scp.module';
import { CharactersModule } from './characters/characters.module';
import { EventsModule } from './events/events.module';
import { NewsModule } from './news/news.module';
import { MapModule } from './map/map.module';
import { SystemModule } from './system/system.module';
import { CoreMessagesModule } from './core-messages/core-messages.module';
import { CoreDmModule } from './core-dm/core-dm.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Plafond global leger (protection generale) — les routes sensibles
    // (login/register) ont leur propre plafond plus strict via @Throttle().
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    PrismaModule,
    PlatformModule,
    HealthModule,
    AuthModule,
    PlayersModule,
    ApplicationsModule,
    LoreModule,
    SearchModule,
    GalleryModule,
    SyncModule,
    ReportsModule,
    GradesModule,
    FactionsModule,
    FactionRelationsModule,
    ClassifiedDocumentsModule,
    DepartmentsModule,
    TeamsModule,
    AssignmentsModule,
    SanctionsModule,
    MissionsModule,
    ScpModule,
    CharactersModule,
    EventsModule,
    NewsModule,
    MapModule,
    SystemModule,
    CoreMessagesModule,
    CoreDmModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
