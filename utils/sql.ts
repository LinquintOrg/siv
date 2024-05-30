import * as SQLite from 'expo-sqlite';
import { IExchangeRate, IInventoryGame, ISteamProfile } from 'types';

export abstract class sql {
  private static db: SQLite.SQLiteDatabase;

  // ! Settings

  public static async getSetting(option: string): Promise<string | null> {
    const setting = await this.db?.getFirstAsync<{ option: string; value: string }>('SELECT * FROM Settings WHERE option = $option;', { $option: option });
    return setting?.value || null;
  }

  public static async setSetting(option: string, value: string) {
    if (!this.db) {
      return;
    }
    const processed = value.trim().slice(0, 256);
    const existing = await sql.getSetting(option);
    const stmt = !existing
      ? await this.db.prepareAsync('INSERT INTO Settings VALUES ($option, $value);')
      : await this.db.prepareAsync('UPDATE Settings SET value = $value WHERE option = $option;');
    try {
      await stmt.executeAsync({ $option: option, $value: processed });
    } catch (err) {
      console.error(err);
    } finally {
      await stmt.finalizeAsync();
    }
  }

  // ! Profiles

  public static async getOneProfile(id: string): Promise<ISteamProfile | undefined> {
    if (!this.db) {
      return undefined;
    }
    const stmt = await this.db.prepareAsync('SELECT * FROM SavedProfiles WHERE id = $id;');
    const profile = await stmt.executeAsync<ISteamProfile>({ $id: id });
    return await profile.getFirstAsync() as ISteamProfile | undefined;
  }

  public static async getAllProfiles(): Promise<ISteamProfile[]> {
    if (!this.db) {
      return [];
    }
    return await this.db.getAllAsync<ISteamProfile>('SELECT * FROM SavedProfiles;');
  }

  public static async upsertProfile(profile: ISteamProfile) {
    if (!this.db) {
      return;
    }
    const exists = await sql.getOneProfile(profile.id);
    const stmt = !exists
      ? await this.db.prepareAsync('INSERT INTO SavedProfiles VALUES ($id, $name, $url, $public, $state);')
      : await this.db.prepareAsync('UPDATE SavedProfiles SET name = $name, url = $url, public = $public, state = $state WHERE id = $id;');
    await stmt.executeAsync({ $id: profile.id, $name: profile.name, $url: profile.url, $public: profile.public, $state: profile.state });
    await stmt.finalizeAsync();
  }

  // ! Exchange rates

  public static async getOneRate(): Promise<IExchangeRate> {
    const activeRate = await sql.getSetting('currency');
    if (!activeRate) {
      return { code: 'USD', rate: 1 };
    }
    const stmt = await this.db?.prepareAsync('SELECT * FROM Exchange WHERE code = $code;');
    const oneRow = await (await stmt.executeAsync({ $code: activeRate })).getFirstAsync();
    return (oneRow || { code: 'USD', rate: 1 }) as IExchangeRate;
  }

  public static async getRates(): Promise<IExchangeRate[]> {
    const allRows = await this.db?.getAllAsync('SELECT * FROM Exchange;');
    return (allRows || []) as IExchangeRate[];
  }

  public static async updateRates(newRates: IExchangeRate[]) {
    if (!this.db) {
      return;
    }

    const insertStmt = await this.db.prepareAsync('INSERT INTO Exchange VALUES ($code, $rate);');
    const updateStmt = await this.db.prepareAsync('UPDATE Exchange SET rate = $rate WHERE code = $code;');
    try {
      for (const { code, rate } of newRates) {
        const exists = await this.db.getFirstAsync<IExchangeRate>('SELECT * FROM Exchange WHERE code = $code', { $code: code });
        if (exists) {
          await updateStmt.executeAsync({ $code: code, $rate: rate });
        } else {
          await insertStmt.executeAsync({ $code: code, $rate: rate });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      await insertStmt.finalizeAsync();
      await updateStmt.finalizeAsync();
    }
  }

  // ! INVENTORY GAMES

  public static async getInventoryGames(): Promise<IInventoryGame[]> {
    const allRows = await this.db?.getAllAsync('SELECT * FROM InventoryGames ORDER BY name ASC');
    return (allRows || []) as IInventoryGame[];
  }

  public static async updateInventoryGames(gamesList: IInventoryGame[]) {
    if (!this.db) {
      return;
    }

    // Delete existing records
    await this.db.runAsync('DELETE FROM InventoryGames');
    const stmt = await this.db.prepareAsync('INSERT INTO InventoryGames (appid, img, name) VALUES ($appid, $img, $name)');
    try {
      for (const { appid, img, name } of gamesList) {
        await stmt.executeAsync({ $appid: appid, $img: img, $name: name });
      }
    } finally {
      await stmt.finalizeAsync();
    }
  }

  // ! DATABASE MIGRATIONS

  public static async migrateDbIfNeeded(): Promise<boolean> {
    let extraMigrationsNeeded = false;
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('appData', { enableChangeListener: true });
    }

    const DATABASE_VERSION = 1;
    let { user_version: currentDbVersion } = await this.db.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version',
    ) || { user_version: 0 };
    if (currentDbVersion >= DATABASE_VERSION) {
      return extraMigrationsNeeded;
    }

    // ? Database version 0
    if (currentDbVersion === 0) {
      // Create Inventory games table
      await this.db.execAsync(`
        PRAGMA journal_mode = 'wal';
        CREATE TABLE InventoryGames (
          appid INTEGER PRIMARY KEY NOT NULL,
          img VARCHAR(128) NOT NULL,
          name VARCHAR(128) NOT NULL
        );
      `);
      // Create Currency exchanges table
      await this.db.execAsync(`
        PRAGMA journal_mode = 'wal';
        CREATE TABLE Exchange (
          code VARCHAR(4) PRIMARY KEY NOT NULL,
          rate DOUBLE NOT NULL
        );
      `);
      // Create Settings table
      await this.db.execAsync(`
        PRAGMA journal_mode = 'wal';
        CREATE TABLE Settings (
          option VARCHAR(64) PRIMARY KEY NOT NULL,
          value VARCHAR(256) NOT NULL
        );
      `);
      // Create Saved profiles table
      await this.db.execAsync(`
        PRAGMA journal_mode = 'wal';
        CREATE TABLE SavedProfiles (
          id VARCHAR(20) PRIMARY KEY NOT NULL,
          name VARCHAR(64) NOT NULL,
          url VARCHAR(256) NOT NULL,
          public TINYINT(1) NOT NULL,
          state TINYINT(1) NOT NULL
        );
      `);
      extraMigrationsNeeded = true;
      currentDbVersion = 1;
    }
    await this.db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    return extraMigrationsNeeded;
  }
}
