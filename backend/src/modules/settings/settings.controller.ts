import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update setting' })
  updateSetting(@Param('key') key: string, @Body() body: { value: string; type?: string }) {
    return this.settingsService.updateSetting(key, body.value, body.type);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get setting by key' })
  getSetting(@Param('key') key: string) {
    return this.settingsService.getSetting(key);
  }
}