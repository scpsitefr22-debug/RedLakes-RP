import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { DepartmentsModule } from './departments/departments.module';
import { TeamsModule } from './teams/teams.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { SanctionsModule } from './sanctions/sanctions.module';
import { ScpModule } from './scp/scp.module';
import { CharactersModule } from './characters/characters.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    DepartmentsModule,
    TeamsModule,
    AssignmentsModule,
    SanctionsModule,
    ScpModule,
    CharactersModule,
  ],
})
export class AppModule {}
