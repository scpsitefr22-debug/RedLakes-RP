import { PrismaClient } from '@prisma/client';
import { scpObjects } from '../../web/src/data/scp';

const prisma = new PrismaClient();

export async function seedScpObjects() {
  for (const scp of scpObjects) {
    await prisma.scpObject.upsert({
      where: { slug: scp.id },
      update: {
        number: scp.number,
        name: scp.name,
        class: scp.class,
        threatLevel: scp.threatLevel,
        containment: scp.containment,
        history: scp.history,
        description: scp.description,
        image: scp.image,
        incidents: scp.incidents,
        tests: scp.tests,
        addendums: scp.addendums,
        containmentCost: scp.stats.containmentCost,
        personnelAssigned: scp.stats.personnelAssigned,
        breachCount: scp.stats.breachCount,
        clearance: scp.clearance,
      },
      create: {
        slug: scp.id,
        number: scp.number,
        name: scp.name,
        class: scp.class,
        threatLevel: scp.threatLevel,
        containment: scp.containment,
        history: scp.history,
        description: scp.description,
        image: scp.image,
        incidents: scp.incidents,
        tests: scp.tests,
        addendums: scp.addendums,
        containmentCost: scp.stats.containmentCost,
        personnelAssigned: scp.stats.personnelAssigned,
        breachCount: scp.stats.breachCount,
        clearance: scp.clearance,
      },
    });
  }
  console.log(`SCP objects seeded: ${scpObjects.length}`);
}

if (require.main === module) {
  seedScpObjects()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
