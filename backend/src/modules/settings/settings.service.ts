import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../../database/entities/setting.entity';
import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  async getAllSettings(): Promise<any> {
    // Load from YAML file
    const configPath = path.resolve(__dirname, '../../../shared/config.yaml');
    
    if (fs.existsSync(configPath)) {
      const configFile = fs.readFileSync(configPath, 'utf8');
      return yaml.parse(configFile);
    }
    
    return {};
  }

  async updateSetting(key: string, value: string, type: string = 'string'): Promise<Setting> {
    let setting = await this.settingRepository.findOne({ where: { key } });
    
    if (!setting) {
      setting = this.settingRepository.create({ key, value, type });
    } else {
      setting.value = value;
      setting.type = type as any;
    }
    
    return this.settingRepository.save(setting);
  }

  async getSetting(key: string): Promise<Setting | null> {
    return this.settingRepository.findOne({ where: { key } });
  }
}