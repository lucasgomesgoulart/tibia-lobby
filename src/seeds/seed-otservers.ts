import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OtServer } from '../db/entities/otserver.entity';
import { World } from '../db/entities/world.entity';

// Lista inicial de OTs mais populares (seleção manual, pode ajustar conforme necessidade).
// Critérios: presença frequente em comunidades BR / internacionais e estabilidade.
// Atenção: nomes apenas referenciais, sem qualquer afiliação oficial.
const otSeeds: Array<{ name: string; worlds: string[] }> = [
  { name: 'Baiak BR', worlds: ['Baiak-Alpha', 'Baiak-Beta'] },
  { name: 'Ascarus', worlds: ['Ascarus-Main'] },
  { name: 'Kingdom AAC', worlds: ['Kingdom-Main'] },
  { name: 'Archlight', worlds: ['Archlight-Europe', 'Archlight-America'] },
  { name: 'RetroCores', worlds: ['RetroCores-1'] },
  { name: 'Realera', worlds: ['Realera-Main'] },
  { name: 'Aurera', worlds: ['Aurera-Main'] },
  { name: 'FunTibia', worlds: ['FunTibia-1'] },
  { name: 'OxiTibia', worlds: ['OxiTibia-Global'] },
  { name: 'Znote Test', worlds: ['Znote-Dev'] },
];

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    const otRepo = app.get<typeof OtServer>(getRepositoryToken(OtServer)) as any;
    const worldRepo = app.get<typeof World>(getRepositoryToken(World)) as any;

    let createdServers = 0;
    let createdWorlds = 0;

    for (const { name, worlds } of otSeeds) {
      let ot = await otRepo.findOne({ where: { name }, relations: ['worlds'] });
      if (!ot) {
        ot = otRepo.create({ name });
        ot = await otRepo.save(ot);
        createdServers++;
        console.log(`> OT criado: ${name}`);
      } else {
        console.log(`> OT já existe: ${name}`);
      }

      for (const wName of worlds) {
        const existingWorld = await worldRepo.findOne({ where: { name: wName } });
        if (existingWorld) continue; // respeita unique name
        const world = worldRepo.create({ name: wName, isGlobal: false, otServer: ot });
        await worldRepo.save(world);
        createdWorlds++;
      }
    }

  console.log(`> Seed OTs finalizado. OTs criados: ${createdServers}, mundos criados: ${createdWorlds}. (Execução idempotente)`);
  } catch (err) {
    console.error('Erro ao executar seed de OTServers:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

main();
