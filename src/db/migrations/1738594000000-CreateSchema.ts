import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSchema1738594000000 implements MigrationInterface {
  name = 'CreateSchema1738594000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    // Enums
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE characters_servertype_enum AS ENUM ('GLOBAL','OTSERVER');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE characters_vocation_enum AS ENUM ('DRUID','SORCERER','KNIGHT','PALADIN');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE lobbies_activitytype_enum AS ENUM ('PVP','HUNT','QUEST','BOSS','WAR','EVENT');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);

    // users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        username varchar NOT NULL UNIQUE,
        email varchar NOT NULL UNIQUE,
        password varchar NOT NULL,
        full_name varchar NULL,
        birth_date date NULL,
        phone varchar NULL,
        country varchar NULL,
        state varchar NULL,
        city varchar NULL,
        zip_code varchar NULL,
        address varchar NULL,
        address_2 varchar NULL,
        role varchar NOT NULL DEFAULT 'user',
        status varchar NOT NULL DEFAULT 'active',
        last_login timestamp NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // otservers
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS otservers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar NOT NULL UNIQUE,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // worlds
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS worlds (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar NOT NULL UNIQUE,
        "isGlobal" boolean NOT NULL DEFAULT true,
        "otServerId" uuid NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_worlds_otserver FOREIGN KEY ("otServerId") REFERENCES otservers(id) ON DELETE CASCADE
      )
    `);

    // lobbies
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS lobbies (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title varchar NOT NULL,
        "minLevel" integer NOT NULL,
        "maxLevel" integer NOT NULL,
        "maxPlayers" integer NOT NULL,
        "minPlayers" integer NOT NULL,
        "activityType" lobbies_activitytype_enum NOT NULL,
        "ownerId" uuid NULL,
        "discordChannelLink" varchar NOT NULL,
        "isDeleted" boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_lobbies_owner FOREIGN KEY ("ownerId") REFERENCES users(id)
      )
    `);

    // characters
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS characters (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar NOT NULL,
        "serverType" characters_servertype_enum NOT NULL,
        "worldId" uuid NULL,
        "otServerId" uuid NULL,
        vocation characters_vocation_enum NOT NULL,
        level integer NULL,
        "userId" uuid NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_characters_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_characters_world FOREIGN KEY ("worldId") REFERENCES worlds(id),
        CONSTRAINT fk_characters_otserver FOREIGN KEY ("otServerId") REFERENCES otservers(id)
      )
    `);

    // lobby_players
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS lobby_players (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "lobbyId" uuid NOT NULL,
        "characterId" uuid NOT NULL,
        joined_at timestamptz NOT NULL DEFAULT now(),
        left_at timestamptz NULL,
        "isLeader" boolean NOT NULL DEFAULT false,
        CONSTRAINT fk_lp_lobby FOREIGN KEY ("lobbyId") REFERENCES lobbies(id) ON DELETE CASCADE,
        CONSTRAINT fk_lp_character FOREIGN KEY ("characterId") REFERENCES characters(id) ON DELETE CASCADE
      )
    `);

    // activity_type
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS activity_type (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar NOT NULL UNIQUE,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // Indexes úteis
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_worlds_isglobal ON worlds("isGlobal")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_lp_left_at ON lobby_players(left_at)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS lobby_players`);
    await queryRunner.query(`DROP TABLE IF EXISTS characters`);
    await queryRunner.query(`DROP TABLE IF EXISTS lobbies`);
    await queryRunner.query(`DROP TABLE IF EXISTS worlds`);
    await queryRunner.query(`DROP TABLE IF EXISTS otservers`);
    await queryRunner.query(`DROP TABLE IF EXISTS activity_type`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);

    await queryRunner.query(`DO $$ BEGIN DROP TYPE IF EXISTS characters_servertype_enum; EXCEPTION WHEN undefined_object THEN null; END $$;`);
    await queryRunner.query(`DO $$ BEGIN DROP TYPE IF EXISTS characters_vocation_enum; EXCEPTION WHEN undefined_object THEN null; END $$;`);
    await queryRunner.query(`DO $$ BEGIN DROP TYPE IF EXISTS lobbies_activitytype_enum; EXCEPTION WHEN undefined_object THEN null; END $$;`);
  }
}