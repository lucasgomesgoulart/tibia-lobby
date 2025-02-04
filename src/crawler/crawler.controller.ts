import { Controller, Get, Query } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Get('level')
  async getLevel(@Query('name') name: string) {
    try {
      if (!name) {
        throw new Error('O nome do personagem é obrigatório');
      }

      const level = await this.crawlerService.getCharacterLevel(name);
      
      if (!level) {
        return { 
          success: false,
          error: 'Personagem não encontrado ou nível indisponível'
        };
      }

      return { 
        success: true,
        character: name, 
        level 
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
  }
}